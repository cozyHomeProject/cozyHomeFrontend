import { MealType } from "@/types/meals.types"
import { fetchListItems, fetchLists } from "@/lib/groceries-api"
import { fetchChoreLists, fetchChores } from "@/lib/chores-api"
import { fetchWeek } from "@/lib/meals-api"

// Resumen para las tarjetas del dashboard, leído del backend.

export type DashboardSummary = {
  groceries: { total: number; pending: number } | null
  chores: { done: number; todo: number } | null
  meals: { next: { type: MealType; name: string } | null; after: { type: MealType; name: string } | null }
}

const MEAL_ORDER: MealType[] = ["Breakfast", "Lunch", "Dinner", "Dessert"]
// Hora hasta la que cada comida se considera "la próxima".
const MEAL_UNTIL_HOUR: Record<MealType, number> = { Breakfast: 10, Lunch: 15, Dinner: 21, Dessert: 24 }

function dateKey(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function weekStartKey(date: Date) {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - start.getDay())
  return dateKey(start)
}

async function groceriesSummary() {
  const lists = await fetchLists()
  const latest = lists.at(-1)
  if (!latest) return null
  const listItems = await fetchListItems(latest.id)
  return { total: listItems.length, pending: listItems.filter((item) => !item.checked).length }
}

async function choresSummary() {
  const lists = await fetchChoreLists()
  const latest = lists.at(-1)
  if (!latest) return null
  const chores = await fetchChores(latest.id)
  const done = chores.filter((chore) => chore.done).length
  return { done, todo: chores.length - done }
}

async function mealsSummary(now: Date) {
  const plan = await fetchWeek(weekStartKey(now))
  const today = plan.meals[dateKey(now)]
  const upcoming = MEAL_ORDER.filter((type) => now.getHours() < MEAL_UNTIL_HOUR[type])
    .filter((type) => today?.[type])
    .map((type) => ({ type, name: today[type] }))
  return { next: upcoming[0] ?? null, after: upcoming[1] ?? null }
}

export async function fetchDashboardSummary(now = new Date()): Promise<DashboardSummary> {
  const [groceries, chores, meals] = await Promise.all([
    groceriesSummary(),
    choresSummary(),
    mealsSummary(now),
  ])
  return { groceries, chores, meals }
}
