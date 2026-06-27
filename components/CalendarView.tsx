"use client";

import { useState, useEffect } from "react";
import LeaveModal from "@/components/LeaveModal";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollTopButton from "@/components/ScrollTopButton";
import { supabase } from "@/lib/supabase";
import {
  UserIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

type Leave = {
  id: string;
  name: string;
  project: string;
  start: string;
  end: string;
  reason: string;
};

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
const weekdaysFull = ["日曜", "月曜", "火曜", "水曜", "木曜", "金曜", "土曜"];

const getWeekStart = (date: Date) => {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });

const isToday = (date: Date) => {
  const t = new Date();
  return (
    date.getFullYear() === t.getFullYear() &&
    date.getMonth() === t.getMonth() &&
    date.getDate() === t.getDate()
  );
};

// ── 有給カード（共通） ──────────────────────────────
function LeaveCard({ l, onClick }: { l: Leave; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-[#ebebea] border-l-[2.5px] border-l-[#c3d60b] rounded-[10px] px-2 py-2 group hover:shadow-[0_3px_10px_#c3d60b1a] hover:-translate-y-px transition-all duration-150"
    >
      <span className="block text-[8.5px] font-extrabold text-[#8fa008] bg-[#f4f9cc] px-1.5 py-0.5 rounded-[4px] mb-1.5 tracking-[0.03em] w-fit leading-none">
        {l.project}
      </span>
      <span className="flex items-center gap-1 mb-1">
        <UserIcon className="w-3 h-3 text-[#ccc] shrink-0" />
        <span className="text-[11px] font-bold text-[#1a1a1a] truncate leading-none">
          {l.name}
        </span>
      </span>
      <span className="flex items-center gap-1 mb-1">
        <ClockIcon className="w-3 h-3 text-[#ccc] shrink-0" />
        <span className="text-[10px] text-[#aaa] leading-none">
          {formatTime(l.start)}〜{formatTime(l.end)}
        </span>
      </span>
      {l.reason && (
        <span className="flex items-start gap-1">
          <ChatBubbleLeftRightIcon className="w-3 h-3 text-[#ddd] shrink-0 mt-px" />
          <span className="text-[9px] text-[#ccc] leading-snug line-clamp-2">
            {l.reason}
          </span>
        </span>
      )}
      <span className="block h-[1.5px] w-0 group-hover:w-full bg-[#c3d60b] rounded-full mt-1.5 transition-all duration-200" />
    </button>
  );
}

export default function CalendarView() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [projectFilter, setProjectFilter] = useState("all");

  useEffect(() => {
    supabase
      .from("leaves")
      .select("*")
      .then(({ data }) => {
        if (data) setLeaves(data);
      });
  }, []);

  useEffect(() => {
    supabase
      .from("projects")
      .select("id, name")
      .order("created_at")
      .then(({ data }) => {
        if (data) setProjects(data);
      });
  }, []);

  const monthStart = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1,
  );
  const monthEnd = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0,
  );
  monthEnd.setHours(23, 59, 59, 999);

  const monthLeaves = leaves
    .filter((l) => {
      const s = new Date(l.start);
      return (
        s >= monthStart &&
        s <= monthEnd &&
        (projectFilter === "all" || l.project === projectFilter)
      );
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const weekGroups: Record<string, Leave[]> = {};
  monthLeaves.forEach((l) => {
    const key = getWeekStart(new Date(l.start)).toISOString().slice(0, 10);
    if (!weekGroups[key]) weekGroups[key] = [];
    weekGroups[key].push(l);
  });
  const weeks = Object.keys(weekGroups).sort();

  const prevMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() - 1);
    setCurrentMonth(d);
  };
  const nextMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + 1);
    setCurrentMonth(d);
  };

  const updateLeave = async (updated: Leave) => {
    const { error } = await supabase
      .from("leaves")
      .update({
        name: updated.name,
        project: updated.project,
        start: updated.start,
        end: updated.end,
        reason: updated.reason,
      })
      .eq("id", updated.id);
    if (!error)
      setLeaves((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  };

  const deleteLeave = async (id: string) => {
    const { error } = await supabase.from("leaves").delete().eq("id", id);
    if (!error) {
      setLeaves((prev) => prev.filter((l) => l.id !== id));
      setSelectedLeave(null);
    }
  };

  const totalCount = monthLeaves.length;
  const uniqueCount = [...new Set(monthLeaves.map((l) => l.name))].length;
  const monthLabel = `${currentMonth.getFullYear()}年${currentMonth.getMonth() + 1}月`;
  const monthValue = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-3 py-6 md:px-6 md:py-8">
        <div className="max-w-6xl mx-auto space-y-5 md:space-y-6">
          {/* ── ページヘッダー ── */}
          <div className="space-y-2">
            <p className="text-[9px] font-bold tracking-[0.14em] text-[#c3d60b] uppercase">
              有給カレンダー
            </p>
            <div className="flex items-end justify-between gap-2 flex-wrap">
              <h1 className="text-[26px] md:text-[28px] font-black text-[#0d0d0d] tracking-[-0.04em] leading-none">
                {monthLabel}
              </h1>
              {totalCount > 0 && (
                <p className="text-[11px] text-[#b0b0a8]">
                  {uniqueCount}名 · {totalCount}件の有給
                </p>
              )}
            </div>
          </div>

          {/* ── コントロール ── */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {/* 月ナビ */}
              <div className="flex items-center gap-0.5 bg-white border border-[#e5e5e3] rounded-full p-[3px] shadow-md">
                <button
                  onClick={prevMonth}
                  aria-label="前月"
                  className="w-[26px] h-[26px] flex items-center justify-center rounded-full text-[#999] hover:bg-[#f0f6c0] hover:text-[#6e7d06] transition-all duration-150"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <input
                  type="month"
                  value={monthValue}
                  onChange={(e) => {
                    const [y, m] = e.target.value.split("-").map(Number);
                    setCurrentMonth(new Date(y, m - 1, 1));
                  }}
                  className="text-[12px] font-bold text-[#222] bg-transparent border-none outline-none cursor-pointer px-1.5"
                />
                <button
                  onClick={nextMonth}
                  aria-label="次月"
                  className="w-[26px] h-[26px] flex items-center justify-center rounded-full text-[#999] hover:bg-[#f0f6c0] hover:text-[#6e7d06] transition-all duration-150"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              {/* フィルター */}
              <div className="relative">
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="appearance-none bg-white border border-[#e5e5e3] rounded-full pl-3.5 pr-7 py-[5px] text-[11px] font-medium text-[#555] cursor-pointer hover:border-[#c3d60b] focus:border-[#c3d60b] focus:outline-none transition-colors shadow-md"
                >
                  <option value="all">すべての案件</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#bbb]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              {/* 今月 */}
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="text-[11px] font-bold text-[#6e7d06] bg-[#f0f6c0] hover:bg-[#e8f0a8] rounded-full px-4 py-[5px] transition-colors duration-150 shadow-md"
              >
                今月
              </button>
            </div>

            <p className="text-[10px] text-[#b0b0a8]">
              月の切り替えと案件フィルターを組み合わせることで、特定プロジェクトの休暇状況を素早く確認できます。
            </p>
          </div>

          {/* アクセントライン */}
          <div className="h-[1.5px] rounded-full bg-gradient-to-r from-[#c3d60b] via-[#c3d60b]/40 to-transparent" />

          {/* ── コンテンツ ── */}
          {weeks.length === 0 ? (
            <div className="bg-white border border-[#ebebea] rounded-[18px] py-16 text-center shadow-md">
              <div className="w-12 h-12 rounded-full bg-[#f4f9cc] flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-5 h-5 text-[#c3d60b]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="4" width="18" height="18" rx="3" />
                  <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </div>
              <p className="text-[14px] font-bold text-[#333] mb-1">
                この月の有給はありません
              </p>
              <p className="text-[11px] text-[#bbb]">
                別の月を選択するか、有給を登録してチームの休暇状況を可視化しましょう。
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {weeks.map((week) => {
                const weekStart = new Date(week);
                const members = [
                  ...new Set(weekGroups[week].map((l) => l.name)),
                ];
                const dayMap: Record<number, Leave[]> = {};
                weekGroups[week].forEach((l) => {
                  const d = new Date(l.start).getDay();
                  if (!dayMap[d]) dayMap[d] = [];
                  dayMap[d].push(l);
                });
                const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                const weekRange = `${fmt(weekStart)} 〜 ${fmt(weekEnd)}`;

                return (
                  <div
                    key={week}
                    className="bg-white border border-[#ebebea] rounded-[18px] overflow-hidden shadow-md"
                  >
                    {/* 週ヘッダー */}
                    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#fcfcfb] border-b border-[#f2f2f0]">
                      {/* 左側：週範囲 */}
                      <span className="text-[10px] font-bold text-[#c0c0b8] tracking-[0.05em]">
                        {weekRange}
                      </span>

                      {/* 右側：メンバー表示＋軽い説明 */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* 軽い説明文（あなたの要望） */}
                        <span className="text-[10px] text-[#b0b0a8] mr-1">
                          今週休みのメンバー
                        </span>

                        {/* メンバータグ */}
                        {members.map((m) => (
                          <span
                            key={m}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#f4f9cc] text-[#5a6b05] border border-[#dce844]/30"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#c3d60b] inline-block" />
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* PC: 7列グリッド */}
                    <div className="hidden md:grid md:grid-cols-7 divide-x divide-[#f3f3f1]">
                      {weekdays.map((w, i) => {
                        const dayDate = new Date(weekStart);
                        dayDate.setDate(dayDate.getDate() + i);
                        const today = isToday(dayDate);
                        const weekend = i === 0 || i === 6;

                        return (
                          <div
                            key={i}
                            className={`flex flex-col min-h-[155px] ${weekend ? "bg-[#fafaf8]" : ""}`}
                          >
                            <div className="flex flex-col items-center pt-2 pb-1.5 border-b border-[#f3f3f1]">
                              <span
                                className={`text-[9px] font-bold tracking-[0.06em] ${i === 0 ? "text-[#fca5a5]" : i === 6 ? "text-[#93c5fd]" : "text-[#ccc]"}`}
                              >
                                {w}
                              </span>
                              <span
                                className={`text-[11px] font-bold inline-flex items-center justify-center w-5 h-5 rounded-full mt-0.5 ${today ? "bg-[#c3d60b] text-white" : weekend ? "text-[#ccc]" : "text-[#333]"}`}
                              >
                                {dayDate.getDate()}
                              </span>
                            </div>
                            <div className="flex-1 p-1.5 space-y-1.5">
                              {dayMap[i]?.map((l) => (
                                <LeaveCard
                                  key={l.id}
                                  l={l}
                                  onClick={() => setSelectedLeave(l)}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* モバイル: 日付ごとのリスト */}
                    <div className="md:hidden divide-y divide-[#f3f3f1]">
                      {weekdays.map((w, i) => {
                        const dayDate = new Date(weekStart);
                        dayDate.setDate(dayDate.getDate() + i);
                        const today = isToday(dayDate);
                        const weekend = i === 0 || i === 6;
                        const cards = dayMap[i] ?? [];
                        if (cards.length === 0) return null;

                        return (
                          <div
                            key={i}
                            className={`px-3 py-3 ${weekend ? "bg-[#fafaf8]" : ""}`}
                          >
                            <div className="flex items-center gap-2 mb-2.5">
                              <span
                                className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[12px] font-black ${today ? "bg-[#c3d60b] text-white" : weekend ? "bg-[#f3f3f1] text-[#bbb]" : "bg-[#f3f3f1] text-[#333]"}`}
                              >
                                {dayDate.getDate()}
                              </span>
                              <span
                                className={`text-[11px] font-bold ${i === 0 ? "text-[#f87171]" : i === 6 ? "text-[#60a5fa]" : "text-[#888]"}`}
                              >
                                {weekdaysFull[i]}
                              </span>
                              <span className="ml-auto text-[10px] text-[#ccc]">
                                {dayDate.getMonth() + 1}/{dayDate.getDate()}
                              </span>
                            </div>
                            <p className="text-[10px] text-[#b0b0a8] mb-1.5">
                              この日の有給登録一覧です。タップして詳細を確認・編集できます。
                            </p>
                            <div className="space-y-2 pl-2">
                              {cards.map((l) => (
                                <LeaveCard
                                  key={l.id}
                                  l={l}
                                  onClick={() => setSelectedLeave(l)}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
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
  );
}
