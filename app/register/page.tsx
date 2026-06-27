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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">

      {/* モーダル */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-4 fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-center text-gray-800">登録内容確認</h2>
            <p className="text-sm text-gray-600 text-center">この内容で登録しますか？</p>

            <div className="flex gap-3">
              <button
                className="
                  flex-1 py-2 rounded-full font-medium
                  bg-[#c3d60b] text-white
                  hover:bg-white hover:text-[#c3d60b] hover:border-[#c3d60b]
                  border border-transparent hover:border-[#c3d60b]
                  transition
                "
                onClick={() => {
                  setShowConfirm(false)
                  submitLeave()
                }}
              >
                はい
              </button>

              <button
                className="
                  flex-1 py-2 rounded-full font-medium
                  bg-white text-gray-700 border border-gray-300
                  hover:bg-gray-800 hover:text-white hover:border-gray-800
                  transition
                "
                onClick={() => setShowConfirm(false)}
              >
                いいえ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 本体カード */}
      <div className="
        bg-white w-full max-w-lg p-6 md:p-8 rounded-2xl shadow-md space-y-8 fade-up
      ">
        <div className="space-y-2 text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">有給登録</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            チームの有給状況を正確に管理するため、必要な情報を入力してください。
            入力内容は後から編集することもできます。
          </p>
        </div>

        {/* 入力フォーム */}
        <div className="space-y-5">

          {/* 名前 */}
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-3">
            <label className="text-xs text-gray-500">名前</label>
            <input
              className="w-full bg-transparent mt-1 text-gray-800 focus:outline-none"
              placeholder="例：佐藤"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* 日付 */}
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-3">
            <label className="text-xs text-gray-500">日付</label>
            <input
              type="date"
              className="w-full bg-transparent mt-1 text-gray-800 focus:outline-none"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* 時間 */}
          <div className="flex flex-col md:flex-row md:gap-4 mb-3">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-3 flex-1">
              <label className="text-xs text-gray-500">開始時間</label>
              <input
                type="time"
                className="w-full bg-transparent mt-1 text-gray-800 focus:outline-none"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-3 flex-1">
              <label className="text-xs text-gray-500">終了時間</label>
              <input
                type="time"
                className="w-full bg-transparent mt-1 text-gray-800 focus:outline-none"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* 理由 */}
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-3">
            <label className="text-xs text-gray-500">理由</label>
            <textarea
              className="w-full bg-transparent mt-1 text-gray-800 focus:outline-none resize-none"
              placeholder="例：私用 / 通院 / 家庭の事情"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {/* 案件 */}
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-3">
            <label className="text-xs text-gray-500">案件</label>
            <select
              className="w-full bg-transparent mt-1 text-gray-800 focus:outline-none cursor-pointer"
              value={project}
              onChange={(e) => setProject(e.target.value)}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
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
            onClick={() => setShowConfirm(true)}
          >
            登録する
          </button>

          <button
            className="
              flex-1 py-3 rounded-full font-semibold
              bg-white text-gray-700 border border-gray-400
              hover:bg-gray-800 hover:text-white hover:border-gray-800
              transition
            "
            onClick={() => router.push("/")}
          >
            一覧へ戻る
          </button>

        </div>
      </div>
    </div>
  )
}
