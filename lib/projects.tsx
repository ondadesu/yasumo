// プロジェクトは string のみで管理
export type Project = string

// 有給データの型
export type Leave = {
  id: string
  name: string
  project: string
  start: string
  end: string
  reason: string
}

// -----------------------------
// プロジェクト一覧取得
// -----------------------------
export const getProjects = (): Project[] => {
  if (typeof window === "undefined") return []

  const data = localStorage.getItem("projects")

  if (!data) {
    const defaultProjects: Project[] = ["A案件", "B案件", "C案件"]
    localStorage.setItem("projects", JSON.stringify(defaultProjects))
    return defaultProjects
  }

  try {
    const parsed = JSON.parse(data) as Project[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// -----------------------------
// プロジェクト追加
// -----------------------------
export const addProject = (name: string): Project[] => {
  const projects = getProjects()
  const newProjects = [...projects, name]

  localStorage.setItem("projects", JSON.stringify(newProjects))

  return newProjects
}

// -----------------------------
// プロジェクト削除
// -----------------------------
export type DeleteProjectResult =
  | { success: false; message: string }
  | { success: true; projects: string[] }

export const deleteProject = (name: string): DeleteProjectResult => {
  const projects = getProjects()

  const leavesData = localStorage.getItem("leaves")
  const leaves: Leave[] = leavesData ? JSON.parse(leavesData) : []

  const isUsed = leaves.some((l) => l.project === name)

  if (isUsed) {
    return {
      success: false,
      message: "この案件は使用中のため削除できません"
    }
  }

  const newProjects = projects.filter((p) => p !== name)

  localStorage.setItem("projects", JSON.stringify(newProjects))

  return {
    success: true,
    projects: newProjects
  }
}