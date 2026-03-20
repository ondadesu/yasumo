"use client"

import { useState, useEffect } from "react"
import { getProjects } from "@/lib/projects"

type Leave = {
  id: string
  name: string
  project: string
  start: string
  end: string
  reason: string
}

type Props = {
  leave: Leave
  onClose: () => void
  onUpdate: (leave: Leave) => void
  onDelete: (id: string) => void
}

export default function LeaveModal({leave,onClose,onUpdate,onDelete}:Props){

  const date = leave.start.split("T")[0]
  const startTime = leave.start.split("T")[1]
  const endTime = leave.end.split("T")[1]

  const [name,setName] = useState(leave.name)
  const [project,setProject] = useState(leave.project)
  const [day,setDay] = useState(date)
  const [start,setStart] = useState(startTime)
  const [end,setEnd] = useState(endTime)
  const [reason,setReason] = useState(leave.reason)

  // ★追加：案件一覧
  const [projects,setProjects] = useState<string[]>([])

  useEffect(()=>{
    const list = getProjects()
    setProjects(list)
  },[])

  const handleUpdate = () => {

    const updatedLeave = {
      ...leave,
      name,
      project,
      start: `${day}T${start}`,
      end: `${day}T${end}`,
      reason
    }

    onUpdate(updatedLeave)
    onClose()
  }

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

      <div className="bg-white rounded-xl p-6 w-96 space-y-4">

        <h2 className="text-lg font-bold">
          有給更新
        </h2>

        <input
          className="border p-2 rounded w-full"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />

        {/* ★ここが動的になる */}
        <select
          className="border p-2 rounded w-full"
          value={project}
          onChange={(e)=>setProject(e.target.value)}
        >
          {projects.map(p=>(
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="border p-2 rounded w-full"
          value={day}
          onChange={(e)=>setDay(e.target.value)}
        />

        <div className="flex gap-2">

          <input
            type="time"
            className="border p-2 rounded w-full"
            value={start}
            onChange={(e)=>setStart(e.target.value)}
          />

          <input
            type="time"
            className="border p-2 rounded w-full"
            value={end}
            onChange={(e)=>setEnd(e.target.value)}
          />

        </div>

        <textarea
          className="border p-2 rounded w-full"
          value={reason}
          onChange={(e)=>setReason(e.target.value)}
        />

        <div className="flex gap-2">

          <button
            className="flex-1 text-white py-2 rounded"
            style={{background:"#c3d60b"}}
            onClick={handleUpdate}
          >
            更新
          </button>

          <button
            className="flex-1 bg-red-500 text-white py-2 rounded"
            onClick={()=>onDelete(leave.id)}
          >
            削除
          </button>

          <button
            className="flex-1 bg-gray-300 py-2 rounded"
            onClick={onClose}
          >
            閉じる
          </button>

        </div>

      </div>

    </div>
  )
}