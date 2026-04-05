"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getProjects } from "@/lib/projects"
import { supabase } from "@/lib/supabase"

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

const handleSubmit = async () => {

  if(!name || !date || !startTime || !endTime){
    alert("入力してください")
    return
  }

const { error } = await supabase
  .from("leaves")
  .insert([
    {
      name,
      project,
      start: `${date}T${startTime}`,
      end: `${date}T${endTime}`,
      reason
    }
  ])

if(error){
  console.error("エラー内容👇", error)
  alert("保存失敗")
  return
}

  router.push("/")
}

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-50">

      <div className="bg-white p-8 rounded-lg shadow w-96 shadow-[0_2px_8px_rgba(0,0,0,0.12)]">

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
          className="border p-2 rounded cursor-pointer"
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
          className="text-white font-bold hover::bg-lime-400 p-2 rounded cursor-pointer"
          style={{background:"#c3d60b"}}
          onClick={handleSubmit}
          >
          登録
          </button>

          <button
          className="text-white bg-black-300 font-bold hover:bg-gray-400 p-2 rounded cursor-pointer"
          style={{background:"#000000"}}
          onClick={()=>router.push("/")}
          >
          一覧へ戻る
          </button>

        </div>

      </div>

    </div>
  )
}