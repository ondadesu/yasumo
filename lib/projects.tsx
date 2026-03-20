export const getProjects = () => {
  if (typeof window === "undefined") return []

  const data = localStorage.getItem("projects")

  if (!data) {
    const defaultProjects = ["A案件","B案件","C案件"]
    localStorage.setItem("projects", JSON.stringify(defaultProjects))
    return defaultProjects
  }

  return JSON.parse(data)
}

export const addProject = (name: string) => {

  const projects = getProjects()

  const newProjects = [...projects, name]

  localStorage.setItem("projects", JSON.stringify(newProjects))

  return newProjects
}

export const deleteProject = (name: string) => {

  const projects = getProjects()

  // 有給データ取得
  const leavesData = localStorage.getItem("leaves")
  const leaves = leavesData ? JSON.parse(leavesData) : []

  // その案件が使われているか確認
  const isUsed = leaves.some((l: any) => l.project === name)

  if (isUsed) {
    return {
      success: false,
      message: "この案件は使用中のため削除できません"
    }
  }

  const newProjects = projects.filter((p: string) => p !== name)

  localStorage.setItem("projects", JSON.stringify(newProjects))

  return {
    success: true,
    projects: newProjects
  }
}