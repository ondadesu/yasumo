"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import LeaveModal from "@/components/LeaveModal"
import ScrollTopButton from "@/components/ScrollTopButton"
import { supabase } from "@/lib/supabase"
import { UserIcon, ClockIcon, ChatBubbleLeftRightIcon, } from "@heroicons/react/24/outline"

type Leave = {
  id: string
  name: string
  project: string
  start: string
  end: string
  reason: string
}

const weekdays = ["日", "月", "火", "水", "木", "金", "土"]

const getWeekStart = (date: Date) => {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit"
  })

export default function CalendarView() {
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null)
  const [projectFilter, setProjectFilter] = useState("all")

  // 有給データ取得
  useEffect(() => {
    const fetchLeaves = async () => {
      const { data, error } = await supabase.from("leaves").select("*")
      if (!error && data) setLeaves(data)
    }
    fetchLeaves()
  }, [])

  // 案件一覧取得（色なし）
  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name")
        .order("created_at")

      if (!error && data) setProjects(data)
    }
    fetchProjects()
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
    <main className="bg-gray-100 min-h-screen p-6">

      {/* アニメーションCSS */}
      <style>{`
        .fade-right {
          opacity: 0;
          transform: translateX(100px);
          animation: fadeInRight 1s ease-out forwards;
        }
        .fade-left {
          opacity: 0;
          transform: translateX(-100px);
          animation: fadeInLeft 1s ease-out forwards;
        }
        @keyframes fadeInRight {
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInLeft {
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <div className="max-w-6xl mx-auto space-y-6">

        {/* ヘッダー */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 pb-4 border-b border-gray-300">
          <div className="fade-left">
            <h1 className="text-4xl font-bold text-black text-center md:text-left">
              YASUMO
            </h1>
            <p className="text-xs text-gray-500 text-center mt-1">
              ～チームの有給状況を、ひと目でスマートに把握～
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto fade-right">
            <Link href="/project">
              <button
                className="
                  rounded-full w-full md:w-auto px-5 py-2
                  text-white text-sm font-semibold shadow
                  bg-black
                  border border-transparent
                  hover:text-black hover:bg-white hover:border-black
                  transition cursor-pointer
                "
              >
                ＋ 案件追加
              </button>
            </Link>

            <Link href="/register">
              <button
                className="
                  rounded-full w-full md:w-auto px-5 py-2
                  text-white text-sm font-semibold shadow
                  bg-[#c3d60b]
                  border border-transparent
                  hover:text-[#c3d60b] hover:bg-white hover:border-[#c3d60b]
                  transition cursor-pointer
                "
              >
                ＋ 有給登録
              </button>
            </Link>
          </div>
        </div>

        {/* 月切替 */}
        <div className="flex justify-center items-center space-x-4 fade-right">
          <button
            className="px-4 py-1 rounded-full bg-white border border-gray-300 text-sm text-gray-700 shadow-sm hover:bg-gray-100 transition cursor-pointer"
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
            className="border p-1 rounded text-center shadow-sm cursor-pointer"
          />

          <button
            className="px-4 py-1 rounded-full bg-white border border-gray-300 text-sm text-gray-700 shadow-sm hover:bg-gray-100 transition cursor-pointer"
            onClick={nextMonth}
          >
            次月
          </button>
        </div>

        {/* 案件フィルター */}
        <div className="flex justify-center fade-left">
          <select
            value={projectFilter}
            onChange={e => setProjectFilter(e.target.value)}
            className="border p-2 rounded-full shadow-sm cursor-pointer"
          >
            <option value="all">すべての案件</option>
            {projects.map(p => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* カレンダー */}
        {weeks.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500 border border-gray-200">
            登録データがありません
          </div>
        ) : (
          weeks.map((week, index) => {
            const weekStart = new Date(week)
            const members = [...new Set(weekGroups[week].map(l => l.name))]

            const dayMap: Record<number, Leave[]> = {}

            weekGroups[week].forEach(l => {
              const d = new Date(l.start).getDay()
              if (!dayMap[d]) dayMap[d] = []
              dayMap[d].push(l)
            })

            const animationClass = index % 2 === 0 ? "fade-right" : "fade-left"

            return (
              <div
                key={week}
                className={`bg-white rounded-xl shadow p-6 space-y-4 border border-gray-200 ${animationClass}`}
              >
                <p className="text-sm text-gray-600">
                  今週休む人:{" "}
                  <span className="font-semibold text-black">
                    {members.length > 0 ? members.join(" / ") : "なし"}
                  </span>{" "}
                  <span className="text-xs text-gray-400">
                    ({members.length}人)
                  </span>
                </p>

                <div className="grid md:grid-cols-7 gap-3">
                  {weekdays.map((w, i) => {
                    const dayDate = new Date(weekStart)
                    dayDate.setDate(dayDate.getDate() + i + 1)

                    return (
                      <div
                        key={i}
                        className="bg-white rounded-lg p-3 min-h-[120px] shadow border border-gray-200"
                      >
                        <div className="font-semibold text-sm mb-2 text-gray-800">
                          {String(dayDate.getMonth() + 1).padStart(2, "0")}/
                          {String(dayDate.getDate()).padStart(2, "0")}（{w}）
                        </div>

                        <div className="space-y-2">
                          {dayMap[i]?.map(l => (
                            <div
                              key={l.id}
                              className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-xs cursor-pointer hover:bg-gray-100 transition space-y-1"
                              onClick={() => setSelectedLeave(l)}
                            >

                              {/* プロジェクト名 */}
                              <div className="text-black font-semibold mb-2">
                                【{l.project}】
                              </div>

                              {/* 名前 + アイコン */}
                              <div className="flex items-center gap-1 text-gray-700">
                                <UserIcon className="w-4 h-4 text-gray-500" />
                                <span className="font-semibold">{l.name}</span>
                              </div>

                              {/* 時間 + アイコン */}
                              <div className="flex items-center gap-1 text-gray-700">
                                <ClockIcon className="w-4 h-4 text-gray-500" />
                                <span>
                                  {formatTime(l.start)}〜{formatTime(l.end)}
                                </span>
                              </div>

                              {/* 理由 + アイコン */}
                              <div className="flex items-start gap-1 text-gray-700 text-[10px]">
                                <ChatBubbleLeftRightIcon className="w-4 h-4 text-gray-400 shrink-0" />
                                <span className="leading-snug break-words">{l.reason}</span>
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