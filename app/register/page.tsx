"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getProjects } from "@/lib/projects"

export default function RegisterPage() {

  const router = useRouter()

  const [name,setName] = useState("")
  const [date,setDate] = useState("")
  const [startTime,setStartTime] = useState("")
  const [endTime,setEndTime] = useState("")
  const [reason,setReason] = useState("")
  const [project,setProject] = useState("")
  const [projects,setProjects] = useState<string[]>([])

  useEffect(()=>{

    const list = getProjects()
    setProjects(list)

    if(list.length > 0){
      setProject(list[0])
    }

  },[])

const handleSubmit = () => {

  const start = `${date}T${startTime}`
  const end = `${date}T${endTime}`

  const newLeave = {
    id: Date.now().toString(),
    name,
    project,
    start,
    end,
    reason
  }

  const data = localStorage.getItem("leaves")
  const leaves = data ? JSON.parse(data) : []

  leaves.push(newLeave)

  localStorage.setItem("leaves", JSON.stringify(leaves))
}

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-50">

      <div className="bg-white p-8 rounded-lg shadow w-96">

        <h1 className="text-xl font-bold mb-6 text-center">
          有給登録
        </h1>

        <div className="flex flex-col gap-4">

          <input
          className="border p-2 rounded"
          placeholder="名前"
          value={name}
          onChange={(e)=>setName(e.target.value)}
          />

          <input
          type="date"
          className="border p-2 rounded"
          value={date}
          onChange={(e)=>setDate(e.target.value)}
          />

          <div className="flex gap-2">

            <input
            type="time"
            className="border p-2 rounded w-1/2"
            value={startTime}
            onChange={(e)=>setStartTime(e.target.value)}
            />

            <input
            type="time"
            className="border p-2 rounded w-1/2"
            value={endTime}
            onChange={(e)=>setEndTime(e.target.value)}
            />

          </div>

          <textarea
          className="border p-2 rounded"
          placeholder="理由"
          value={reason}
          onChange={(e)=>setReason(e.target.value)}
          />

          <select
          className="border p-2 rounded"
          value={project}
          onChange={(e)=>setProject(e.target.value)}
          >
            {projects.map(p=>(
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <button
          className="text-white p-2 rounded"
          style={{background:"#c3d60b"}}
          onClick={handleSubmit}
          >
          登録
          </button>

          <button
          className="bg-gray-300 hover:bg-gray-400 p-2 rounded"
          onClick={()=>router.push("/")}
          >
          一覧へ戻る
          </button>

        </div>

      </div>

    </div>
  )
}