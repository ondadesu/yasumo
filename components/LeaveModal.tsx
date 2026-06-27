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

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

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
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <style>{`
        .fade-up {
          opacity: 0;
          transform: translateY(40px);
          animation: fadeUp 0.4s ease-out forwards;
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
            bg-white rounded-2xl 
            w-full max-w-lg 
            p-4 md:p-6 
            space-y-6 
            shadow-xl fade-up
            max-h-[90vh] overflow-y-auto
          "
          onClick={(e) => e.stopPropagation()}
        >

        <h2 className="text-lg md:text-xl font-bold text-gray-800">有給の編集</h2>

        {/* 入力フィールド */}
        <div className="space-y-4">

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
            <label className="text-xs text-gray-500">名前</label>
            <input
              className="w-full bg-transparent mt-1 text-gray-800 focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
            <label className="text-xs text-gray-500">案件</label>
            <select
              className="w-full bg-transparent mt-1 text-gray-800 focus:outline-none cursor-pointer"
              value={project}
              onChange={(e) => setProject(e.target.value)}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
            <label className="text-xs text-gray-500">日付</label>
            <input
              type="date"
              className="w-full bg-transparent mt-1 text-gray-800 focus:outline-none"
              value={day}
              onChange={(e) => setDay(e.target.value)}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex-1">
              <label className="text-xs text-gray-500">開始</label>
              <input
                type="time"
                className="w-full bg-transparent mt-1 text-gray-800 focus:outline-none"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex-1">
              <label className="text-xs text-gray-500">終了</label>
              <input
                type="time"
                className="w-full bg-transparent mt-1 text-gray-800 focus:outline-none"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
            <label className="text-xs text-gray-500">理由</label>
            <textarea
              className="w-full bg-transparent mt-1 text-gray-800 focus:outline-none resize-none"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        {/* ボタン群 */}
        <div className="flex flex-col md:flex-row gap-3">

          <button
            className="
              flex-1 py-3 rounded-full font-semibold
              bg-[#c3d60b] text-white
              hover:bg-white hover:text-[#c3d60b] hover:border-[#c3d60b]
              border border-transparent hover:border-[#c3d60b]
              transition
            "
            onClick={handleUpdate}
          >
            更新する
          </button>

          <button
            className="
              flex-1 py-3 rounded-full font-semibold
              bg-white text-red-500 border border-red-500
              hover:bg-red-500 hover:text-white hover:border-white
              transition
            "
            onClick={handleDeleteClick}
          >
            削除
          </button>

          <button
            className="
              flex-1 py-3 rounded-full font-semibold
              bg-white text-gray-700 border border-gray-400
              hover:bg-gray-800 hover:text-white hover:border-gray-800
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
