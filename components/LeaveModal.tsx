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

  // ★ モーダル表示中は背景スクロール禁止
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  // ★ 案件一覧を Supabase から取得
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name")
        .order("created_at", { ascending: true })

      if (!error && data) {
        setProjects(data)

        // 現在の leave.project が DB に存在しない場合は先頭をセット
        if (!data.some((p) => p.name === project)) {
          if (data.length > 0) setProject(data[0].name)
        }
      }
    }

    load()
  }, [])

  // ★ 更新処理
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

  // ★ 削除前に確認アラートを出す
  const handleDeleteClick = () => {
    const ok = window.confirm("本当に削除しますか？")
    if (!ok) return
    onDelete(leave.id)
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center"
      onClick={onClose}   // ← 背景クリックで閉じる
    >
      <div
        className="bg-white rounded-xl p-6 w-96 space-y-4"
        onClick={(e) => e.stopPropagation()}  // ← モーダル内クリックは閉じない
      >
        <h2 className="text-lg font-bold">有給更新</h2>

        <input
          className="border p-2 rounded w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select
          className="border p-2 rounded w-full"
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
          className="border p-2 rounded w-full"
          value={day}
          onChange={(e) => setDay(e.target.value)}
        />

        <div className="flex gap-2">
          <input
            type="time"
            className="border p-2 rounded w-full"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />

          <input
            type="time"
            className="border p-2 rounded w-full"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>

        <textarea
          className="border p-2 rounded w-full"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="flex gap-2">

          <button
            className="flex-1 text-white py-2 rounded"
            style={{ background: "#c3d60b" }}
            onClick={handleUpdate}
          >
            更新
          </button>

          <button
            className="flex-1 bg-red-500 text-white py-2 rounded"
            onClick={handleDeleteClick}   // ← 確認アラート付き削除
          >
            削除
          </button>

          <button
            className="flex-1 bg-gray-300 py-2 rounded"
            onClick={onClose}
          >
            閉じる
          </button>

        </div>

      </div>
    </div>
  )
}