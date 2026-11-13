export type Assignee = "Anyone" | "Jaz" | "Luis"

export type Chore = {
  id: string
  item: string
  assignee: Assignee
  done: boolean
  lastDone: string
}

export type SavedChoreList = {
  id: string
  name: string
  chores: Chore[]
  createdAt: string
  updatedAt: string
}