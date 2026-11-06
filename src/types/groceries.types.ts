export type Unit = "Grams" | "Kilograms" | "Liters" | "Milliliters"

export type GroceryItem = {
  id: number
  item: string
  amount: string
  lastOrdered: string
  checked: boolean
}

export type SavedList = {
  id: string
  name: string
  items: GroceryItem[]
  createdAt: string
  updatedAt: string
}