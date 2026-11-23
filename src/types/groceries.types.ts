export type Unit = "Grams" | "Kilograms" | "Liters" | "Milliliters"

export type GroceryItem = {
  id: number
  item: string
  amount: string
  lastOrdered: string
  checked: boolean
  apiId?: number          // id del groceryListItem en el backend (si ya está guardado)
  orderedAt?: string | null // fecha ISO en que se marcó "Got it?"
}

export type SavedList = {
  id: string
  name: string
  items: GroceryItem[]
  createdAt: string
  updatedAt: string
}