"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import LeaveModal from "@/components/LeaveModal"
import ScrollTopButton from "@/components/ScrollTopButton"
import { supabase } from "@/lib/supabase"

type Leave = {
  id: string
  name: string
  project: string
  start: string
  end: string
  reason: string
}

const projectsColor: Record<string, string> = {
  "A案件": "#c3d60b",
  "B案件": "#60c3d6",
  "C案件": "#d660c3"
}

const weekdays = ["日", "月", "火", "水", "木", "金", "土"]

const getWeekStart = (date: Date) => {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })

export default function CalendarView() {
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null)

  const [projectFilter, setProjectFilter] = useState("all")

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from("leaves").select("*")

      if (error) {
        console.error(error)
        return
      }

      if (data) {
        setLeaves(data)
      }
    }

    fetchData()
  }, [])

  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  monthEnd.setHours(23, 59, 59, 999)

  const monthLeaves = leaves
    .filter(l => {
      const start = new Date(l.start)

      return (
        start >= monthStart &&
        start <= monthEnd &&
        (projectFilter === "all" || l.project === projectFilter)
      )
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

  const weekGroups: Record<string, Leave[]> = {}

  monthLeaves.forEach(l => {
    const weekStart = getWeekStart(new Date(l.start)).toISOString().slice(0, 10)
    if (!weekGroups[weekStart]) weekGroups[weekStart] = []
    weekGroups[weekStart].push(l)
  })

  const weeks = Object.keys(weekGroups).sort()

  const prevMonth = () => {
    const d = new Date(currentMonth)
    d.setMonth(d.getMonth() - 1)
    setCurrentMonth(d)
  }

  const nextMonth = () => {
    const d = new Date(currentMonth)
    d.setMonth(d.getMonth() + 1)
    setCurrentMonth(d)
  }

  const updateLeave = async (updated: Leave) => {
    const { error } = await supabase
      .from("leaves")
      .update({
        name: updated.name,
        project: updated.project,
        start: updated.start,
        end: updated.end,
        reason: updated.reason
      })
      .eq("id", updated.id)

    if (error) {
      console.error("更新エラー", error)
      return
    }

    setLeaves(prev => prev.map(l => (l.id === updated.id ? updated : l)))
  }

  const deleteLeave = async (id: string) => {
    const { error } = await supabase.from("leaves").delete().eq("id", id)

    if (error) {
      console.error("削除エラー", error)
      return
    }

    setLeaves(prev => prev.filter(l => l.id !== id))
    setSelectedLeave(null)
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">有給管理</h1>

          <div className="flex gap-3">
            <Link href="/project">
              <button
                className="px-5 py-2 rounded text-white hover:scale-105 transition"
                style={{ background: "#60c3d6" }}
              >
                ＋ 案件追加
              </button>
            </Link>

            <Link href="/register">
              <button
                className="px-5 py-2 rounded text-white hover:scale-105 transition"
                style={{ background: "#c3d60b" }}
              >
                ＋ 有給登録
              </button>
            </Link>
          </div>
        </div>

        {/* 月切替 */}
        <div className="flex justify-center items-center space-x-4">
          <button
            className="px-4 py-1 rounded bg-gray-300 hover:bg-gray-400 transition"
            onClick={prevMonth}
          >
            前月
          </button>

          <input
            type="month"
            value={`${currentMonth.getFullYear()}-${String(
              currentMonth.getMonth() + 1
            ).padStart(2, "0")}`}
            onChange={e => {
              const [y, m] = e.target.value.split("-").map(Number)
              setCurrentMonth(new Date(y, m - 1, 1))
            }}
            className="border p-1 rounded text-center"
          />

          <button
            className="px-4 py-1 rounded bg-gray-300 hover:bg-gray-400 transition"
            onClick={nextMonth}
          >
            次月
          </button>
        </div>

        {/* ★案件フィルター */}
        <div className="flex justify-center">
          <select
            value={projectFilter}
            onChange={e => setProjectFilter(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="all">すべての案件</option>
            {Object.keys(projectsColor).map(project => (
              <option key={project}>{project}</option>
            ))}
          </select>
        </div>

        {weeks.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
            登録データがありません
          </div>
        ) : (
          weeks.map(week => {
            const weekStart = new Date(week)
            const members = [...new Set(weekGroups[week].map(l => l.name))]

            const dayMap: Record<number, Leave[]> = {}

            weekGroups[week].forEach(l => {
              const d = new Date(l.start).getDay()
              if (!dayMap[d]) dayMap[d] = []
              dayMap[d].push(l)
            })

            return (
              <div key={week} className="bg-white rounded-xl shadow p-6 space-y-4">
                <p className="text-sm text-gray-600">
                  今週休む人: {members.join(" / ")} ({members.length}人)
                </p>

                <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                  {weekdays.map((w, i) => {
                    const dayDate = new Date(weekStart)
                    // ★ ここだけ +1 日補正
                    dayDate.setDate(dayDate.getDate() + i + 1)

                    return (
                      <div key={i} className="bg-gray-50 rounded-lg p-3 min-h-[120px]">
                        <div className="font-semibold text-sm mb-2">
                          {String(dayDate.getMonth() + 1).padStart(2, "0")}/
                          {String(dayDate.getDate()).padStart(2, "0")}（{w}）
                        </div>

                        <div className="space-y-2">
                          {dayMap[i]?.map(l => (
                            <div
                              key={l.id}
                              className="bg-white p-2 rounded shadow text-xs cursor-pointer hover:bg-gray-100"
                              onClick={() => setSelectedLeave(l)}
                            >
                              <div className="font-semibold">{l.name}</div>

                              <div>
                                {formatTime(l.start)}〜{formatTime(l.end)}
                              </div>

                              <div
                                style={{ color: projectsColor[l.project] }}
                                className="font-semibold"
                              >
                                {l.project}
                              </div>

                              <div className="text-gray-400 text-[10px]">
                                {l.reason}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}

        {selectedLeave && (
          <LeaveModal
            leave={selectedLeave}
            onClose={() => setSelectedLeave(null)}
            onUpdate={updateLeave}
            onDelete={deleteLeave}
          />
        )}
      </div>

      <ScrollTopButton />
    </main>
  )
}