"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { addProject, getProjects, deleteProject } from "@/lib/projects"

export default function ProjectPage() {

  const [name, setName] = useState("")
  const [projects, setProjects] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    setProjects(getProjects())
  }, [])

  const handleAdd = () => {

    if (!name.trim()) return

    const newProjects = addProject(name)

    setProjects(newProjects)

    setName("")
  }

  const handleDelete = (project: string) => {

    const result = deleteProject(project)

    if (!result.success) {
      alert(result.message)
      return
    }

    setProjects(result.projects)
  }

  return (

    <main className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-md mx-auto space-y-6">

        {/* ヘッダー */}
        <div className="flex justify-between items-center">

          <h1 className="text-2xl font-bold">
            案件管理
          </h1>

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

          <button
            onClick={handleAdd}
            className="w-full py-2 text-white rounded hover:scale-105 transition"
            style={{ background: "#c3d60b" }}
          >
            追加
          </button>

        </div>

        {/* 案件一覧 */}
        <div className="bg-white p-6 rounded-xl shadow space-y-3">

          <h2 className="font-semibold">
            案件一覧
          </h2>

          {projects.length === 0 ? (
            <p className="text-gray-500 text-sm">
              案件が登録されていません
            </p>
          ) : (

            <div className="space-y-2">

              {projects.map((p) => (
                <div
                  key={p}
                  className="flex justify-between items-center border rounded p-2"
                >

                  <span>{p}</span>

                  <button
                    onClick={() => handleDelete(p)}
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