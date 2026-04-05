"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function ProjectPage() {
  const [name, setName] = useState("")
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([])

  // ★ 確認モーダル表示フラグ
  const [showConfirm, setShowConfirm] = useState(false)

  // 初回ロードで Supabase から取得
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

  // ★ 実際の追加処理
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

  // 削除
  const handleDelete = async (id: string, name: string) => {
    const { data: usedLeaves, error: checkError } = await supabase
      .from("leaves")
      .select("id")
      .eq("project", name)

    if (checkError) {
      alert("確認中にエラーが発生しました")
      return
    }

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
    <main className="min-h-screen bg-gray-100 p-6">

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
              「{name}」を追加しますか？
            </p>

            <div className="flex gap-3">
              <button
                className="flex-1 py-2 rounded text-white"
                style={{ background: "#c3d60b" }}
                onClick={() => {
                  setShowConfirm(false)
                  submitProject()
                }}
              >
                はい
              </button>

              <button
                className="flex-1 py-2 rounded bg-gray-300"
                onClick={() => setShowConfirm(false)}
              >
                いいえ
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto space-y-6">

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">案件管理</h1>

          <Link href="/">
            <button className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">
              一覧へ戻る
            </button>
          </Link>
        </div>

        {/* 案件追加 */}
        <div className="bg-white p-6 rounded-xl shadow space-y-3">
          <h2 className="font-semibold">案件追加</h2>

          <input
            type="text"
            placeholder="案件名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 w-full rounded"
          />

          {/* ★ 追加ボタン → 確認モーダル表示 */}
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full py-2 text-white rounded hover:scale-105 transition"
            style={{ background: "#c3d60b" }}
          >
            追加
          </button>
        </div>

        {/* 案件一覧 */}
        <div className="bg-white p-6 rounded-xl shadow space-y-3">
          <h2 className="font-semibold">案件一覧</h2>

          {projects.length === 0 ? (
            <p className="text-gray-500 text-sm">
              案件が登録されていません
            </p>
          ) : (
            <div className="space-y-2">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center border rounded p-2"
                >
                  <span>{p.name}</span>

                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    className="px-3 py-1 text-white rounded bg-red-500 hover:bg-red-600"
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}