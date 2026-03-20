"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const projects = ["A案件","B案件","C案件"]

export default function Register() {

  const router = useRouter()

  const [name,setName] = useState("")
  const [project,setProject] = useState(projects[0])
  const [start,setStart] = useState("")
  const [end,setEnd] = useState("")
  const [reason,setReason] = useState("")

  const submit = () => {
    if(!name || !start || !end) return

    const data = localStorage.getItem("leaves")
    const leaves = data ? JSON.parse(data) : []

    leaves.push({
      id: crypto.randomUUID(),
      name,
      project,
      start,
      end,
      reason
    })

    localStorage.setItem("leaves", JSON.stringify(leaves))
    router.push("/")
  }

  return (
    <main className="min-h-screen w-full bg-gray-100 flex flex-col items-center justify-center p-6 space-y-6">

      {/* フォームコンテナ */}
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">有給登録</h1>

        <input
          className="border p-2 w-full rounded"
          placeholder="名前"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />

        <select
          className="border p-2 w-full rounded"
          value={project}
          onChange={(e)=>setProject(e.target.value)}
        >
          {projects.map(p=>(
            <option key={p}>{p}</option>
          ))}
        </select>

        <input
          type="datetime-local"
          className="border p-2 w-full rounded"
          value={start}
          onChange={(e)=>setStart(e.target.value)}
        />

        <input
          type="datetime-local"
          className="border p-2 w-full rounded"
          value={end}
          onChange={(e)=>setEnd(e.target.value)}
        />

        <textarea
          className="border p-2 w-full rounded"
          placeholder="理由"
          value={reason}
          onChange={(e)=>setReason(e.target.value)}
        />

        <button
          onClick={submit}
          className="w-full py-3 rounded font-bold text-lg hover:scale-105 transition"
          style={{background:"#c3d60b"}}
        >
          登録
        </button>
      </div>

      {/* 一覧へ戻るボタン */}
      <button
        onClick={()=>router.push("/")}
        className="px-5 py-2 rounded text-white hover:scale-105 transition"
        style={{background:"#888"}} // グレーで差別化
      >
        一覧へ戻る
      </button>

    </main>
  )
}