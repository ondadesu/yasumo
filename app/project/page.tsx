"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { TrashIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/outline"
import Footer from "@/components/Footer"

export default function ProjectPage() {
  const [name, setName] = useState("")
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([])
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: true })
      if (data) setProjects(data)
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
    <div>
      <main className="min-h-screen bg-gray-50 p-6">

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
              <h2 className="text-lg font-bold text-gray-800 text-center">登録確認</h2>
              <p className="text-sm text-gray-600 text-center">「{name}」を追加しますか？</p>

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
                    submitProject()
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

        <div className="max-w-2xl mx-auto space-y-10">

          {/* ヘッダー（タイトル＋戻るボタンを横並び） */}
          <div className="flex items-center justify-between gap-4 mb-5">

            {/* タイトル */}
            <h1 className="text-3xl font-bold text-gray-800 whitespace-nowrap">
              案件管理
            </h1>

            {/* 戻るボタン */}
            <Link href="/">
              <button
                className="
                  flex items-center gap-1
                  px-3 py-2 md:px-4 md:py-2
                  rounded-full bg-white text-gray-700 border border-gray-300
                  hover:bg-gray-800 hover:text-white hover:border-gray-800
                  transition shadow-sm
                  whitespace-nowrap
                "
              >
                <ArrowUturnLeftIcon className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">戻る</span>
              </button>
            </Link>

          </div>

          {/* 説明文（タイトルの下に配置） */}
          <p className="text-gray-500 text-sm leading-relaxed md:max-w-xl">
            チームの有給管理をより正確にするため、案件を整理しておきましょう。
            案件は有給登録時に選択される重要な情報です。
          </p>

          {/* 案件追加カード */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 space-y-5">
            <div>
              <h2 className="font-semibold text-gray-800 text-lg">新しい案件を追加</h2>
              <p className="text-gray-500 text-sm mt-1">
                案件名はチーム全員が識別しやすい名称にすることをおすすめします。
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
              <input
                type="text"
                placeholder="例：A案件 / Web制作案件 / 社内プロジェクト"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent focus:outline-none text-gray-800"
              />
            </div>

            <button
              onClick={() => setShowConfirm(true)}
              className="
                w-full py-3 rounded-full font-semibold
                bg-[#c3d60b] text-white
                hover:bg-white hover:text-[#c3d60b] hover:border-[#c3d60b]
                border border-transparent hover:border-[#c3d60b]
                transition
              "
            >
              追加する
            </button>
          </div>

          {/* 案件一覧 */}
          <div className="space-y-3">
            <h2 className="font-semibold text-gray-800 text-lg">登録済みの案件</h2>
            <p className="text-gray-500 text-sm">
              案件は有給登録時に選択できます。不要になった案件は削除できます。
            </p>

            {projects.length === 0 ? (
              <p className="text-gray-500 text-sm mt-2">案件が登録されていません</p>
            ) : (
              <div className="space-y-3">
                {projects.map((p) => (
                  <div
                    key={p.id}
                    className="
                      flex items-center justify-between
                      bg-white p-4 rounded-xl shadow-sm border border-gray-200
                    "
                  >
                    <span className="text-gray-800 font-medium">{p.name}</span>

                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      className="
                        p-2 rounded-full border border-gray-300 text-gray-500
                        hover:bg-red-500 hover:text-white hover:border-red-500
                        transition
                      "
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
