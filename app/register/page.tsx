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
    <div className="min-h-screen flex items-center justify-center bg-white md:bg-gray-50">
      <style>{`
        .fade-up { opacity: 0; transform: translateY(40px); animation: fadeUp 0.8s ease-out forwards; }
        @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* ★ 確認モーダル（最前面） */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40" onClick={() => setShowConfirm(false)}>
          <div className="bg-white p-6 rounded-xl w-80 space-y-4 z-50" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-center">登録内容確認</h2>
            <p className="text-sm text-gray-700 text-center">この内容で登録しますか？</p>

            <div className="flex gap-3">
              <button
                className="flex-1 py-2 rounded-full cursor-pointer font-medium bg-[#c3d60b] text-white border border-transparent hover:bg-white hover:text-[#c3d60b] hover:border-[#c3d60b] transition shadow-sm"
                onClick={() => {
                  setShowConfirm(false)
                  submitLeave()
                }}
              >
                はい
              </button>

              <button
                className="flex-1 py-2 rounded-full cursor-pointer font-medium bg-white text-black border border-black hover:bg-black hover:text-white hover:border-white transition shadow-sm"
                onClick={() => setShowConfirm(false)}
              >
                いいえ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ★ 有給登録カード（モーダルより後ろ） */}
      <div className="bg-white p-8 rounded-xl w-96 shadow-none md:shadow-[0_2px_8px_rgba(0,0,0,0.12)] fade-up z-10">
        <h1 className="text-xl font-bold mb-6 text-center">有給登録</h1>

        <div className="flex flex-col gap-6">
          <input className="border-b border-gray-400 focus:outline-none p-2" placeholder="名前" value={name} onChange={(e) => setName(e.target.value)} />

          <input type="date" className="border-b border-gray-400 focus:outline-none p-2" value={date} onChange={(e) => setDate(e.target.value)} />

          <div className="flex gap-4">
            <input type="time" className="border-b border-gray-400 focus:outline-none p-2 w-1/2" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            <input type="time" className="border-b border-gray-400 focus:outline-none p-2 w-1/2" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>

          <textarea className="border-b border-gray-400 focus:outline-none p-2" placeholder="理由" value={reason} onChange={(e) => setReason(e.target.value)} />

          <select className="border-b border-gray-400 focus:outline-none p-2 cursor-pointer" value={project} onChange={(e) => setProject(e.target.value)}>
            {projects.map((p) => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>

          <button className="rounded-full font-medium p-2 cursor-pointer bg-[#c3d60b] text-white border border-transparent hover:bg-white hover:text-[#c3d60b] hover:border-[#c3d60b] transition" onClick={() => setShowConfirm(true)}>
            登録
          </button>

          <button className="rounded-full font-medium p-2 cursor-pointer bg-black text-white border border-transparent hover:bg-white hover:text-black hover:border-black transition" onClick={() => router.push("/")}>
            一覧へ戻る
          </button>
        </div>
      </div>
    </div>
  )
}