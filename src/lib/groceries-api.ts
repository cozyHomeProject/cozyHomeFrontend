import { GroceryItem, SavedList } from "@/types/groceries.types"
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
} from "@/lib/api"

// Listas de compras: /groceryLists, /groceries y /groceryListItems.

type ApiList = Resource & { closed: boolean; createdAt: string; modifiedAt: string }

// Proyección "detail" del backend: el producto viene incluido, sin un pedido extra.
type ApiListItem = {
  id: number
  amount: string
  lastOrderedAt: string | null
  groceryName: string
  measureUnit: string
}

export { formatDate }

function toSavedList(list: ApiList): SavedList {
  const createdAt = fromApiDate(list.createdAt)
  return {
    id: String(idFromHref(list._links.self.href)),
    name: `Grocery List - ${formatDate(createdAt)}`,
    items: [],
    createdAt,
    updatedAt: fromApiDate(list.modifiedAt),
  }
}

export async function fetchLists(): Promise<SavedList[]> {
  const page = await request<Page<"groceryLists", ApiList>>("/groceryLists")
  return items(page, "groceryLists")
    .map(toSavedList)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export async function fetchListItems(listId: string): Promise<GroceryItem[]> {
  const page = await request<Page<"groceryListItems", ApiListItem>>(
    `/groceryLists/${listId}/groceryListItems?projection=detail`
  )
  return items(page, "groceryListItems")
    .sort((a, b) => a.id - b.id)
    .map((listItem) => {
      const orderedAt = listItem.lastOrderedAt ? fromApiDate(listItem.lastOrderedAt) : null
      return {
        id: listItem.id,
        apiId: listItem.id,
        item: listItem.groceryName,
        amount: `${listItem.amount} ${listItem.measureUnit}`,
        lastOrdered: orderedAt ? formatDate(orderedAt) : "Not ordered yet",
        checked: orderedAt !== null,
        orderedAt,
      }
    })
}

async function addItem(listPath: string, item: GroceryItem, user: string, now: string) {
  const [quantity, ...unit] = item.amount.split(" ")
  const groceryPath = await create("groceries", {
    name: item.item,
    measureUnit: unit.join(" "),
    createdAt: toApiDate(now),
    createdBy: user,
  })
  await create("groceryListItems", {
    groceryList: listPath,
    grocery: groceryPath,
    amount: quantity,
    lastOrderedAt: item.orderedAt ? toApiDate(item.orderedAt) : null,
    orderedBy: user,
  })
}

// Guarda una lista nueva con sus productos y devuelve la lista leída de vuelta del backend.
export async function createList(listItems: GroceryItem[]): Promise<SavedList> {
  const user = await currentUser()
  const now = new Date().toISOString()
  const listPath = await create("groceryLists", {
    closed: false,
    createdAt: toApiDate(now),
    modifiedAt: toApiDate(now),
    createdBy: user,
  })
  for (const item of listItems) {
    await addItem(listPath, item, user, now)
  }
  const listId = listPath.split("/").pop() as string
  const list = toSavedList(await request<ApiList>(listPath))
  return { ...list, items: await fetchListItems(listId) }
}

// Guarda los cambios de una lista existente: productos nuevos y marcas de "Got it?".
export async function updateList(listId: string, listItems: GroceryItem[]): Promise<SavedList> {
  const user = await currentUser()
  const now = new Date().toISOString()
  const listPath = `/groceryLists/${listId}`

  for (const item of listItems) {
    if (item.apiId) {
      await request(`/groceryListItems/${item.apiId}`, {
        method: "PATCH",
        body: JSON.stringify({ lastOrderedAt: item.orderedAt ? toApiDate(item.orderedAt) : null }),
      })
    } else {
      await addItem(listPath, item, user, now)
    }
  }
  const list = toSavedList(
    await request<ApiList>(listPath, {
      method: "PATCH",
      body: JSON.stringify({ modifiedAt: toApiDate(now) }),
    })
  )
  return { ...list, items: await fetchListItems(listId) }
}
