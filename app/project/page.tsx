"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { TrashIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/outline"

export default function ProjectPage() {
  const [name, setName] = useState("")
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([])
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: true })
      if (!error && data) setProjects(data)
    }
    load()
  }, [])

  const submitProject = async () => {
    if (!name.trim()) {
      alert("案件名を入力してください")
      return
    }

    const { data, error } = await supabase
    .from("projects")
    .insert([{ name }])
    .select()

    if (error) {
      alert("保存失敗")
      return
    }

    setProjects(prev => [...prev, data![0]])
    setName("")
  }

  const handleDelete = async (id: string, projectName: string) => {
    const { data: usedLeaves } = await supabase
    .from("leaves")
    .select("id")
    .eq("project", projectName)

    if (usedLeaves && usedLeaves.length > 0) {
      alert("この案件は有給登録で使用されているため削除できません")
      return
    }

    const ok = window.confirm("本当に削除しますか？")
    if (!ok) return

    const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)

    if (error) {
      alert("削除失敗")
      return
    }

    setProjects(prev => prev.filter((p) => p.id !== id))
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 z-10">
      <style>{`
        .fade-right { opacity: 0; transform: translateX(100px); animation: fadeInRight 1s ease-out forwards; }
        .fade-left { opacity: 0; transform: translateX(-100px); animation: fadeInLeft 1s ease-out forwards; }
        @keyframes fadeInRight { to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeInLeft { to { opacity: 1; transform: translateX(0); } }
      `}</style>

      {/* ★ 確認モーダル（最前面） */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40" onClick={() => setShowConfirm(false)}>
          <div className="bg-white p-6 rounded-xl w-80 space-y-4 z-50" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-center">登録確認</h2>
            <p className="text-sm text-gray-700 text-center">「{name}」を追加しますか？</p>

            <div className="flex gap-3">
              <button
                className="flex-1 py-2 rounded-full cursor-pointer font-medium bg-[#c3d60b] text-white border border-transparent hover:bg-white hover:text-[#c3d60b] hover:border-[#c3d60b] transition shadow-sm"
                onClick={() => {
                  setShowConfirm(false)
                  submitProject()
                }}
              >
                はい
              </button>

              <button
                className="flex-1 py-2 rounded-full cursor-pointer font-medium bg-white text-black border border-gray-300 hover:bg-black hover:text-white hover:border-white transition shadow-sm"
                onClick={() => setShowConfirm(false)}
              >
                いいえ
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto space-y-6">

        {/* ヘッダー */}
        <div className="flex justify-between items-center fade-right">
          <h1 className="text-2xl font-bold">案件管理</h1>

          <Link href="/">
            <button className="rounded-full px-3 py-1 text-black bg-white hover:bg-black hover:text-white hover:border-black border transition cursor-pointer flex items-center gap-2 shadow-sm">
              <ArrowUturnLeftIcon className="w-5 h-5" />
              戻る
            </button>
          </Link>
        </div>

        {/* 案件追加 */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow space-y-4 fade-left">
          <h2 className="font-semibold">案件追加</h2>

          <input type="text" placeholder="案件名" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border-b border-gray-400 focus:outline-none" />

          <button onClick={() => setShowConfirm(true)} className="rounded-full w-full py-2 font-medium cursor-pointer bg-[#c3d60b] text-white border border-transparent hover:bg-white hover:text-[#c3d60b] hover:border-[#c3d60b] transition">
            追加
          </button>
        </div>

        {/* 案件一覧 */}
        <h2 className="font-semibold fade-right">案件一覧</h2>

        {projects.length === 0 ? (
          <p className="text-gray-500 text-sm">案件が登録されていません</p>
        ) : (
          <div className="space-y-2">
            {projects.map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm transition fade-left">
                <span className="text-base">{p.name}</span>

                <button onClick={() => handleDelete(p.id, p.name)} className="p-1 rounded-full border border-gray-400 bg-white text-gray-400 hover:bg-gray-400 hover:text-white transition cursor-pointer flex items-center justify-center">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}