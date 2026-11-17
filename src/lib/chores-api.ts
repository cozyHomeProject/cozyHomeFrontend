import { Assignee, Chore, SavedChoreList } from "@/types/chores.type"
import {
  Page,
  Resource,
  create,
  currentUser,
  formatDate,
  fromApiDate,
  idFromHref,
  items,
  request,
  toApiDate,
  userPath,
} from "@/lib/api"

// Tareas: /taskLists y /tasks. "Anyone" es una tarea sin asignar;
// "Jaz" y "Luis" son los usuarios jaz y luis del backend.

type ApiTaskList = Resource & { name: string; createdAt: string; modifiedAt: string }

// Proyección "detail" del backend: incluye el username del asignado.
type ApiTask = {
  id: number
  name: string
  lastDoneAt: string | null
  assigneeUsername: string | null
}

const ASSIGNEES: Record<Exclude<Assignee, "Anyone">, string> = {
  Jaz: "jaz",
  Luis: "luis",
}

function assigneeFromUsername(username: string | null): Assignee {
  const match = Object.entries(ASSIGNEES).find(([, value]) => value === username)
  return (match?.[0] as Assignee) ?? "Anyone"
}

function assigneePath(assignee: Assignee): Promise<string | null> {
  if (assignee === "Anyone") return Promise.resolve(null)
  return userPath({ username: ASSIGNEES[assignee], name: assignee })
}

function toSavedList(list: ApiTaskList): SavedChoreList {
  return {
    id: String(idFromHref(list._links.self.href)),
    name: list.name,
    chores: [],
    createdAt: fromApiDate(list.createdAt),
    updatedAt: fromApiDate(list.modifiedAt),
  }
}

export async function fetchChoreLists(): Promise<SavedChoreList[]> {
  const page = await request<Page<"taskLists", ApiTaskList>>("/taskLists")
  return items(page, "taskLists")
    .map(toSavedList)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export async function fetchChores(listId: string): Promise<Chore[]> {
  const page = await request<Page<"tasks", ApiTask>>(`/taskLists/${listId}/tasks?projection=detail`)
  return items(page, "tasks")
    .sort((a, b) => a.id - b.id)
    .map((task) => {
      const doneAt = task.lastDoneAt ? fromApiDate(task.lastDoneAt) : null
      return {
        id: String(task.id),
        apiId: task.id,
        item: task.name,
        assignee: assigneeFromUsername(task.assigneeUsername),
        done: doneAt !== null,
        lastDone: doneAt ? formatDate(doneAt) : "Not done yet",
        doneAt,
      }
    })
}

async function addChore(listPath: string, chore: Chore, user: string, now: string) {
  await create("tasks", {
    name: chore.item,
    description: "",
    frequency: "ONCE",
    taskList: listPath,
    assignee: await assigneePath(chore.assignee),
    lastDoneAt: chore.doneAt ? toApiDate(chore.doneAt) : null,
    createdAt: toApiDate(now),
    modifiedAt: toApiDate(now),
    createdBy: user,
  })
}

export async function createChoreList(chores: Chore[]): Promise<SavedChoreList> {
  const user = await currentUser()
  const now = new Date().toISOString()
  const listPath = await create("taskLists", {
    name: `Chore List - ${formatDate(now)}`,
    description: "",
    closed: false,
    createdAt: toApiDate(now),
    modifiedAt: toApiDate(now),
    createdBy: user,
  })
  for (const chore of chores) {
    await addChore(listPath, chore, user, now)
  }
  const listId = listPath.split("/").pop() as string
  const list = toSavedList(await request<ApiTaskList>(listPath))
  return { ...list, chores: await fetchChores(listId) }
}

export async function updateChoreList(listId: string, chores: Chore[]): Promise<SavedChoreList> {
  const user = await currentUser()
  const now = new Date().toISOString()
  const listPath = `/taskLists/${listId}`

  for (const chore of chores) {
    if (chore.apiId) {
      await request(`/tasks/${chore.apiId}`, {
        method: "PATCH",
        body: JSON.stringify({
          assignee: await assigneePath(chore.assignee),
          lastDoneAt: chore.doneAt ? toApiDate(chore.doneAt) : null,
          modifiedAt: toApiDate(now),
        }),
      })
    } else {
      await addChore(listPath, chore, user, now)
    }
  }
  const list = toSavedList(
    await request<ApiTaskList>(listPath, {
      method: "PATCH",
      body: JSON.stringify({ modifiedAt: toApiDate(now) }),
    })
  )
  return { ...list, chores: await fetchChores(listId) }
}
