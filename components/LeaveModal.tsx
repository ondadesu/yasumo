"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

type Leave = {
  id: string
  name: string
  project: string
  start: string
  end: string
  reason: string
}

type Props = {
  leave: Leave
  onClose: () => void
  onUpdate: (leave: Leave) => void
  onDelete: (id: string) => void
}

export default function LeaveModal({ leave, onClose, onUpdate, onDelete }: Props) {

  const date = leave.start.split("T")[0]
  const startTime = leave.start.split("T")[1]
  const endTime = leave.end.split("T")[1]

  const [name, setName] = useState(leave.name)
  const [project, setProject] = useState(leave.project)
  const [day, setDay] = useState(date)
  const [start, setStart] = useState(startTime)
  const [end, setEnd] = useState(endTime)
  const [reason, setReason] = useState(leave.reason)

  const [projects, setProjects] = useState<{ id: string; name: string }[]>([])

  // 背景スクロール禁止
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  // 案件一覧取得
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("projects")
        .select("id, name")
        .order("created_at", { ascending: true })

      if (data) {
        setProjects(data)
        if (!data.some((p) => p.name === project)) {
          if (data.length > 0) setProject(data[0].name)
        }
      }
    }
    load()
  }, [])

  const handleUpdate = () => {
    const updatedLeave = {
      ...leave,
      name,
      project,
      start: `${day}T${start}`,
      end: `${day}T${end}`,
      reason
    }

    onUpdate(updatedLeave)
    onClose()
  }

  const handleDeleteClick = () => {
    const ok = window.confirm("本当に削除しますか？")
    if (!ok) return
    onDelete(leave.id)
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <style>{`
      .fade-up {
      opacity: 0;
      transform: translateY(40px);
      animation: fadeUp 0.8s ease-out forwards;
      }

      @keyframes fadeUp {
      to {
      opacity: 1;
      transform: translateY(0);
      }
      }
      `}</style>
      <div
        className="
          bg-white rounded-xl p-6 space-y-4
          w-11/12 max-w-md
          shadow-lg fade-up
        "
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold">有給更新</h2>

        {/* 下線のみの入力欄 */}
        <input
          className="
            w-full p-2
            border-b border-gray-400
            focus:outline-none
          "
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select
          className="
            w-full p-2
            border-b border-gray-400
            focus:outline-none
            cursor-pointer
          "
          value={project}
          onChange={(e) => setProject(e.target.value)}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="
            w-full p-2
            border-b border-gray-400
            focus:outline-none
          "
          value={day}
          onChange={(e) => setDay(e.target.value)}
        />

        <div className="flex gap-4">
          <input
            type="time"
            className="
              w-1/2 p-2
              border-b border-gray-400
              focus:outline-none
            "
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />

          <input
            type="time"
            className="
              w-1/2 p-2
              border-b border-gray-400
              focus:outline-none
            "
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>

        <textarea
          className="
            w-full p-2
            border-b border-gray-400
            focus:outline-none
          "
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        {/* ボタン群 */}
        <div className="flex gap-2">

          {/* 更新（黄緑 → 白反転） */}
          <button
            className="
              flex-1 py-2 rounded-full font-medium cursor-pointer
              bg-[#c3d60b] text-white border border-transparent
              hover:bg-white hover:text-[#c3d60b] hover:border-[#c3d60b]
              transition
            "
            onClick={handleUpdate}
          >
            更新
          </button>

          {/* 削除（白 × 赤 → 赤反転） */}
          <button
            className="
              flex-1 py-2 rounded-full font-medium cursor-pointer
              bg-white text-red-500 border border-red-500
              hover:bg-red-500 hover:text-white hover:border-white
              transition
            "
            onClick={handleDeleteClick}
          >
            削除
          </button>

          {/* 閉じる（白 × 黒 → 黒反転） */}
          <button
            className="
              flex-1 py-2 rounded-full font-medium cursor-pointer
              bg-white text-black border border-black
              hover:bg-black hover:text-white hover:border-white
              transition
            "
            onClick={onClose}
          >
            閉じる
          </button>

        </div>

      </div>
    </div>
  )
}