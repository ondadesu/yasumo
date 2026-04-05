"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function RegisterPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [reason, setReason] = useState("")

  const [projects, setProjects] = useState<{ id: string; name: string }[]>([])
  const [project, setProject] = useState("")

  const [showConfirm, setShowConfirm] = useState(false)

  // 案件一覧取得
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: true })

      if (data) {
        setProjects(data)
        if (data.length > 0) setProject(data[0].name)
      }
    }
    load()
  }, [])

  // 実際の登録処理
  const submitLeave = async () => {
    if (!name || !date || !startTime || !endTime) {
      alert("入力してください")
      return
    }

    const start = `${date}T${startTime}:00`
    const end = `${date}T${endTime}:00`

    const { error } = await supabase
      .from("leaves")
      .insert([{ name, project, start, end, reason }])

    if (error) {
      alert("保存失敗")
      return
    }

    router.push("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">

      {/* ★ アニメーションCSS */}
      <style>{`
        .fade-in {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeIn 0.6s ease-out forwards;
        }
        @keyframes fadeIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* ★ 確認モーダル */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-white p-6 rounded-xl w-80 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-center">登録確認</h2>
            <p className="text-sm text-gray-700 text-center">
              この内容で登録しますか？
            </p>

            <div className="flex gap-3">
              <button
                className="flex-1 py-2 rounded text-white cursor-pointer bg-[#c3d60b] hover:bg-[#a8c00a] transition"
                onClick={() => {
                  setShowConfirm(false)
                  submitLeave()
                }}
              >
                はい
              </button>

              <button
                className="flex-1 py-2 rounded bg-gray-300 hover:bg-gray-400 cursor-pointer transition"
                onClick={() => setShowConfirm(false)}
              >
                いいえ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 本体 */}
      <div className="bg-white p-8 rounded-lg shadow w-96 shadow-[0_2px_8px_rgba(0,0,0,0.12)] fade-in">

        <h1 className="text-xl font-bold mb-6 text-center">
          有給登録
        </h1>

        <div className="flex flex-col gap-4">

          <input
            className="border p-2 rounded"
            placeholder="名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="date"
            className="border p-2 rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <div className="flex gap-2">
            <input
              type="time"
              className="border p-2 rounded w-1/2"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />

            <input
              type="time"
              className="border p-2 rounded w-1/2"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>

          <textarea
            className="border p-2 rounded"
            placeholder="理由"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <select
            className="border p-2 rounded cursor-pointer"
            value={project}
            onChange={(e) => setProject(e.target.value)}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>

          {/* ★ 登録ボタン（初期色 #c3d60b → ホバーで濃く） */}
          <button
            className="text-white font-bold p-2 rounded cursor-pointer bg-[#c3d60b] hover:bg-[#a8c00a] transition"
            onClick={() => setShowConfirm(true)}
          >
            登録
          </button>

          {/* ★ 一覧へ戻る（黒 → ホバーでグレー） */}
          <button
            className="text-white font-bold p-2 rounded cursor-pointer bg-black hover:bg-gray-700 transition"
            onClick={() => router.push("/")}
          >
            一覧へ戻る
          </button>

        </div>

      </div>

    </div>
  )
}