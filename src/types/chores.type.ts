export type Assignee = "Anyone" | "Jaz" | "Luis"

export type Chore = {
  id: string
  item: string
  assignee: Assignee
  done: boolean
  lastDone: string
  apiId?: number            // id de la tarea en el backend (si ya está guardada)
  doneAt?: string | null    // fecha ISO en que se marcó como hecha
}

export type SavedChoreList = {
  id: string
  name: string
  chores: Chore[]
  createdAt: string
  updatedAt: string
}