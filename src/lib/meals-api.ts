import { MealType, WeeklyMeals } from "@/types/meals.types"
import { ApiError, Page, Resource, create, currentUser, idFromHref, items, request, toApiDate } from "@/lib/api"

// Plan de comidas: /mealPlans (uno por semana), /mealPlanItems (una celda) y /meals.
// La semana se identifica con la fecha del domingo en que empieza, como número: 20261115.

type ApiMealPlan = Resource & { week: number }

// Proyección "detail" del backend: incluye el nombre de la comida.
type ApiMealPlanItem = { id: number; mealType: MealType; day: string | null; mealName: string }

export type WeekPlan = {
  planId: number | null
  meals: WeeklyMeals
  // "2026-11-17|Dinner" -> id del mealPlanItem
  itemIds: Record<string, number>
}

export function cellKey(dateKey: string, mealType: MealType) {
  return `${dateKey}|${mealType}`
}

export function weekKey(weekStartDateKey: string): number {
  return Number(weekStartDateKey.replaceAll("-", ""))
}

export async function fetchWeek(weekStartDateKey: string): Promise<WeekPlan> {
  const plans = await request<Page<"mealPlans", ApiMealPlan>>(
    `/mealPlans/search/findByWeek?week=${weekKey(weekStartDateKey)}`
  )
  const plan = items(plans, "mealPlans")[0]
  if (!plan) return { planId: null, meals: {}, itemIds: {} }

  const planId = idFromHref(plan._links.self.href)
  const page = await request<Page<"mealPlanItems", ApiMealPlanItem>>(
    `/mealPlans/${planId}/mealPlanItems?projection=detail`
  )
  const meals: WeeklyMeals = {}
  const itemIds: Record<string, number> = {}

  for (const item of items(page, "mealPlanItems")) {
    if (!item.day) continue
    meals[item.day] ??= { Breakfast: "", Lunch: "", Dinner: "", Dessert: "" }
    meals[item.day][item.mealType] = item.mealName
    itemIds[cellKey(item.day, item.mealType)] = item.id
  }
  return { planId, meals, itemIds }
}

// Busca la comida por nombre (sin distinguir mayúsculas) o la crea.
async function mealPath(name: string, user: string): Promise<string> {
  try {
    const meal = await request<Resource>(
      `/meals/search/findFirstByNameIgnoreCase?name=${encodeURIComponent(name)}`
    )
    return `/meals/${idFromHref(meal._links.self.href)}`
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 404)) throw error
    return create("meals", { name, createdAt: toApiDate(new Date().toISOString()), createdBy: user })
  }
}

// Guarda una celda: crea, cambia o borra la comida de ese día y momento.
// Devuelve el plan actualizado (planId e itemIds).
export async function saveMeal(
  plan: WeekPlan,
  weekStartDateKey: string,
  dateKey: string,
  mealType: MealType,
  name: string
): Promise<WeekPlan> {
  const user = await currentUser()
  const now = toApiDate(new Date().toISOString())
  const key = cellKey(dateKey, mealType)
  const itemId = plan.itemIds[key]
  const itemIds = { ...plan.itemIds }
  const trimmed = name.trim()

  if (!trimmed) {
    if (itemId) {
      await request(`/mealPlanItems/${itemId}`, { method: "DELETE" })
      delete itemIds[key]
    }
    return { ...plan, itemIds }
  }

  let planId = plan.planId
  if (planId === null) {
    const planPath = await create("mealPlans", {
      week: weekKey(weekStartDateKey),
      createdAt: now,
      modifiedAt: now,
      createdBy: user,
    })
    planId = Number(planPath.split("/").pop())
  }

  const meal = await mealPath(trimmed, user)
  if (itemId) {
    await request(`/mealPlanItems/${itemId}`, { method: "PATCH", body: JSON.stringify({ meal }) })
  } else {
    const itemPath = await create("mealPlanItems", {
      mealPlan: `/mealPlans/${planId}`,
      mealType,
      day: dateKey,
      meal,
    })
    itemIds[key] = Number(itemPath.split("/").pop())
  }
  return { ...plan, planId, itemIds }
}
