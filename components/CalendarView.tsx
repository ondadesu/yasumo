"use client"

import { useState, useEffect } from "react"
import LeaveModal from "@/components/LeaveModal"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ScrollTopButton from "@/components/ScrollTopButton"
import { supabase } from "@/lib/supabase"
import { UserIcon, ClockIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline"

type Leave = {
  id: string
  name: string
  project: string
  start: string
  end: string
  reason: string
}

const weekdays     = ["日", "月", "火", "水", "木", "金", "土"]
const weekdaysFull = ["日曜", "月曜", "火曜", "水曜", "木曜", "金曜", "土曜"]

const getWeekStart = (date: Date) => {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })

const isToday = (date: Date) => {
  const t = new Date()
  return date.getFullYear() === t.getFullYear() &&
    date.getMonth() === t.getMonth() &&
    date.getDate() === t.getDate()
}

// ── 有給カード ──────────────────────────────────────────
function LeaveCard({ l, onClick }: { l: Leave; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="
        w-full text-left group
        bg-white border border-[#ebebea]
        border-l-[2.5px] border-l-[#c3d60b]
        rounded-r-[9px] rounded-l-none
        px-2 pt-2 pb-2
        hover:shadow-[0_3px_10px_#c3d60b1e] hover:-translate-y-px
        transition-all duration-150 relative overflow-hidden
      "
    >
      <span className="absolute inset-0 bg-[#c3d60b] opacity-0 group-hover:opacity-[0.03] transition-opacity duration-150" />
      <span className="block text-[8px] font-black text-[#8fa008] bg-[#f4f9cc] px-1.5 py-0.5 rounded-[3px] mb-1.5 tracking-[0.04em] w-fit leading-[1.5]">
        {l.project}
      </span>
      <span className="flex items-center gap-1 mb-1">
        <UserIcon className="w-2.5 h-2.5 text-[#d0d0c8] shrink-0" />
        <span className="text-[10.5px] font-black text-[#111] truncate leading-none">{l.name}</span>
      </span>
      <span className="flex items-center gap-1 mb-1">
        <ClockIcon className="w-2.5 h-2.5 text-[#d0d0c8] shrink-0" />
        <span className="text-[9px] text-[#b8b8b0] leading-none">{formatTime(l.start)}〜{formatTime(l.end)}</span>
      </span>
      {l.reason && (
        <span className="flex items-start gap-1">
          <ChatBubbleLeftRightIcon className="w-2.5 h-2.5 text-[#d8d8d0] shrink-0 mt-px" />
          <span className="text-[8.5px] text-[#c8c8c0] leading-snug line-clamp-2">{l.reason}</span>
        </span>
      )}
      <span className="block h-[1.5px] w-0 group-hover:w-full bg-[#c3d60b] rounded-full mt-1.5 transition-all duration-200" />
    </button>
  )
}

// ── スタットカード ──────────────────────────────────────
function StatCard({ label, value, sub, icon }: { label: string; value: number; sub: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#f0f0ee] rounded-xl px-4 py-3.5 shadow-md">
      <p className="flex items-center gap-1.5 text-[9px] font-bold tracking-[0.1em] text-[#c0c0b8] uppercase mb-1.5">
        <span className="text-[#c3d60b]">{icon}</span>
        {label}
      </p>
      <p className="text-[22px] font-black text-[#0d0d0d] leading-none tracking-[-0.04em]">{value}</p>
      <p className="text-[10px] text-[#c0c0b8] mt-1">{sub}</p>
    </div>
  )
}

export default function CalendarView() {
  const [leaves, setLeaves]               = useState<Leave[]>([])
  const [projects, setProjects]           = useState<{ id: string; name: string }[]>([])
  const [currentMonth, setCurrentMonth]   = useState(new Date())
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null)
  const [projectFilter, setProjectFilter] = useState("all")

  useEffect(() => {
    supabase.from("leaves").select("*").then(({ data }) => { if (data) setLeaves(data) })
  }, [])

  useEffect(() => {
    supabase.from("projects").select("id, name").order("created_at").then(({ data }) => { if (data) setProjects(data) })
  }, [])

  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const monthEnd   = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  monthEnd.setHours(23, 59, 59, 999)

  const monthLeaves = leaves
    .filter(l => {
      const s = new Date(l.start)
      return s >= monthStart && s <= monthEnd && (projectFilter === "all" || l.project === projectFilter)
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

  const weekGroups: Record<string, Leave[]> = {}
  monthLeaves.forEach(l => {
    const key = getWeekStart(new Date(l.start)).toISOString().slice(0, 10)
    if (!weekGroups[key]) weekGroups[key] = []
    weekGroups[key].push(l)
  })
  const weeks = Object.keys(weekGroups).sort()

  const prevMonth = () => { const d = new Date(currentMonth); d.setMonth(d.getMonth() - 1); setCurrentMonth(d) }
  const nextMonth = () => { const d = new Date(currentMonth); d.setMonth(d.getMonth() + 1); setCurrentMonth(d) }

  const updateLeave = async (updated: Leave) => {
    const { error } = await supabase.from("leaves").update({
      name: updated.name, project: updated.project,
      start: updated.start, end: updated.end, reason: updated.reason,
    }).eq("id", updated.id)
    if (!error) setLeaves(prev => prev.map(l => l.id === updated.id ? updated : l))
  }

  const deleteLeave = async (id: string) => {
    const { error } = await supabase.from("leaves").delete().eq("id", id)
    if (!error) { setLeaves(prev => prev.filter(l => l.id !== id)); setSelectedLeave(null) }
  }

  const totalCount    = monthLeaves.length
  const uniqueCount   = [...new Set(monthLeaves.map(l => l.name))].length
  const projectCount  = [...new Set(monthLeaves.map(l => l.project))].length
  const monthLabel    = `${currentMonth.getFullYear()}年${currentMonth.getMonth() + 1}月`
  const monthValue    = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`
  const dateRange     = `${currentMonth.getFullYear()}年${currentMonth.getMonth() + 1}月1日 〜 ${currentMonth.getMonth() + 1}月${monthEnd.getDate()}日`

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* ── ヒーローセクション ── */}
      <section className="bg-white border-b border-[#f0f0ee] px-4 pt-8 pb-7 md:px-6">
        <div className="max-w-6xl mx-auto">

          {/* タイトル + コントロール */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
            <div>
              <p className="flex items-center gap-2 text-[9px] font-black tracking-[0.16em] text-[#c3d60b] uppercase mb-2">
                <span className="inline-block w-4 h-[2px] rounded-full bg-[#c3d60b]" />
                有給カレンダー
              </p>
              <h1 className="text-[28px] md:text-[32px] font-black text-[#0d0d0d] tracking-[-0.05em] leading-none mb-1.5">
                {monthLabel}
              </h1>
              <p className="text-[11px] text-[#b0b0a8]">{dateRange}</p>
            </div>

            {/* コントロール */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-[#f7f7f5] rounded-full p-1 gap-0.5">
                <button onClick={prevMonth} aria-label="前月" className="w-[26px] h-[26px] flex items-center justify-center rounded-full text-[#999] hover:bg-[#c3d60b] hover:text-white transition-all duration-150">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
                </button>
                <input
                  type="month" value={monthValue}
                  onChange={e => { const [y, m] = e.target.value.split("-").map(Number); setCurrentMonth(new Date(y, m - 1, 1)) }}
                  className="text-[12px] font-bold text-[#1a1a1a] bg-transparent border-none outline-none cursor-pointer px-2"
                />
                <button onClick={nextMonth} aria-label="次月" className="w-[26px] h-[26px] flex items-center justify-center rounded-full text-[#999] hover:bg-[#c3d60b] hover:text-white transition-all duration-150">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>

              <div className="relative">
                <select
                  value={projectFilter}
                  onChange={e => setProjectFilter(e.target.value)}
                  className="appearance-none bg-white border border-[#e8e8e6] rounded-full pl-3.5 pr-7 py-[6px] text-[11px] font-medium text-[#555] cursor-pointer hover:border-[#c3d60b] focus:border-[#c3d60b] focus:outline-none transition-colors"
                >
                  <option value="all">すべての案件</option>
                  {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
                <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#bbb]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
              </div>

              <button onClick={() => setCurrentMonth(new Date())} className="text-[11px] font-bold text-[#6e7d06] bg-[#f4f9cc] hover:bg-[#e8f0a8] rounded-full px-4 py-[6px] transition-colors duration-150">
                今月
              </button>
            </div>
          </div>

          {/* スタットカード */}
          <div className="grid grid-cols-3 gap-2.5">
            <StatCard
              label="今月の人数"
              value={uniqueCount}
              sub="名が有給取得"
              icon={
                <svg className="w-[11px] h-[11px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/>
                </svg>
              }
            />
            <StatCard
              label="今月の件数"
              value={totalCount}
              sub="件の有給登録"
              icon={
                <svg className="w-[11px] h-[11px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="3"/><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
              }
            />
            <StatCard
              label="対象案件数"
              value={projectCount}
              sub="案件が対象"
              icon={
                <svg className="w-[11px] h-[11px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M9 12h6m-3-3v6m9 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* ── メインコンテンツ ── */}
      <main className="flex-1 bg-white px-3 py-5 md:px-6 md:py-6">
        <div className="max-w-6xl mx-auto">

          {/* アクセントライン */}
          <div className="h-[2px] rounded-full bg-gradient-to-r from-[#c3d60b] via-[#c3d60b]/40 to-transparent mb-5" />

          {weeks.length === 0 ? (
            <div className="bg-white border border-[#ebebea] rounded-2xl py-20 text-center">
              <div className="w-13 h-13 w-[52px] h-[52px] rounded-full bg-[#f4f9cc] flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#c3d60b]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="3"/><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
              </div>
              <p className="text-[15px] font-black text-[#333] tracking-[-0.02em] mb-1.5">この月の有給はありません</p>
              <p className="text-[11px] text-[#c0c0b8] leading-relaxed">別の月を選択するか、有給を登録してチームの休暇状況を可視化しましょう。</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {weeks.map(week => {
                const weekStart = new Date(week)
                const members   = [...new Set(weekGroups[week].map(l => l.name))]
                const dayMap: Record<number, Leave[]> = {}
                weekGroups[week].forEach(l => {
                  const d = new Date(l.start).getDay()
                  if (!dayMap[d]) dayMap[d] = []
                  dayMap[d].push(l)
                })
                const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`
                const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 6)
                const weekRange = `${fmt(weekStart)} 〜 ${fmt(weekEnd)}`

                return (
                  <div key={week} className="bg-white border border-[#ebebea] rounded-2xl overflow-hidden shadow-md">

                    {/* 週ヘッダー */}
                    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#fcfcfa] border-b border-[#f0f0ee]">
                      <span className="text-[10px] font-bold text-[#c8c8c0] tracking-[0.05em]">{weekRange}</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-[#d8d8d0] mr-0.5">今週休むメンバー</span>
                        {members.map(m => (
                          <span key={m} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-[#f4f9cc] text-[#5a6b05] border border-[#daea50]/25">
                            <span className="w-1 h-1 rounded-full bg-[#c3d60b] inline-block" />
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* PC: 7列グリッド */}
                    <div className="hidden md:block">
                      {/* 曜日ヘッダー行 */}
                      <div className="grid grid-cols-7 border-b border-[#f4f4f2] bg-[#fafaf8]">
                        {weekdays.map((w, i) => {
                          const dayDate = new Date(weekStart); dayDate.setDate(dayDate.getDate() + i)
                          const today   = isToday(dayDate)
                          const weekend = i === 0 || i === 6
                          const hasCard = dayMap[i] && dayMap[i].length > 0
                          return (
                            <div key={i} className={`flex flex-col items-center py-2 border-r border-[#f4f4f2] last:border-r-0 gap-1 ${weekend ? "bg-[#f5f5f3]" : ""}`}>
                              <span className={`text-[9px] font-black tracking-[0.08em] ${i === 0 ? "text-[#fca5a5]" : i === 6 ? "text-[#93c5fd]" : "text-[#d0d0c8]"}`}>{w}</span>
                              <span className={`text-[12px] font-black w-[22px] h-[22px] rounded-full flex items-center justify-center leading-none ${today ? "bg-[#c3d60b] text-white" : i === 0 ? "text-[#f87171]" : i === 6 ? "text-[#60a5fa]" : weekend ? "text-[#c8c8c0]" : "text-[#333]"}`}>
                                {dayDate.getDate()}
                              </span>
                              {hasCard && <span className="w-[3px] h-[3px] rounded-full bg-[#c3d60b]" />}
                            </div>
                          )
                        })}
                      </div>

                      {/* カード行 */}
                      <div className="grid grid-cols-7 divide-x divide-[#f5f5f3] min-h-[150px]">
                        {weekdays.map((_, i) => {
                          const weekend = i === 0 || i === 6
                          return (
                            <div key={i} className={`flex flex-col gap-1.5 p-1.5 ${weekend ? "bg-[#fafaf8]" : ""}`}>
                              {dayMap[i]?.map(l => (
                                <LeaveCard key={l.id} l={l} onClick={() => setSelectedLeave(l)} />
                              ))}
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* モバイル: 有給ありの日だけリスト */}
                    <div className="md:hidden divide-y divide-[#f5f5f3]">
                      {weekdays.map((_, i) => {
                        const dayDate = new Date(weekStart); dayDate.setDate(dayDate.getDate() + i)
                        const today   = isToday(dayDate)
                        const weekend = i === 0 || i === 6
                        const cards   = dayMap[i] ?? []
                        if (cards.length === 0) return null
                        return (
                          <div key={i} className={`px-3 py-3.5 ${weekend ? "bg-[#fafaf8]" : ""}`}>
                            <div className="flex items-center gap-2 mb-3">
                              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-black ${today ? "bg-[#c3d60b] text-white" : weekend ? "bg-[#f0f0ee] text-[#bbb]" : "bg-[#f0f0ee] text-[#333]"}`}>
                                {dayDate.getDate()}
                              </span>
                              <span className={`text-[11px] font-bold ${i === 0 ? "text-[#f87171]" : i === 6 ? "text-[#60a5fa]" : "text-[#888]"}`}>
                                {weekdaysFull[i]}
                              </span>
                              <span className="ml-auto text-[9px] text-[#d0d0c8]">{dayDate.getMonth() + 1}/{dayDate.getDate()}</span>
                            </div>
                            <div className="flex flex-col gap-2 pl-2">
                              {cards.map(l => <LeaveCard key={l.id} l={l} onClick={() => setSelectedLeave(l)} />)}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                  </div>
                )
              })}
            </div>
          )}
        </div>

        <ScrollTopButton />
      </main>

      {selectedLeave && (
        <LeaveModal
          leave={selectedLeave}
          onClose={() => setSelectedLeave(null)}
          onUpdate={updateLeave}
          onDelete={deleteLeave}
        />
      )}

      <Footer />
    </div>
  )
}
