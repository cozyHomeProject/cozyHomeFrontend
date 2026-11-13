export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Dessert"

export type ViewMode = "day" | "week"

export type DailyMeals = Record<MealType, string>

export type WeeklyMeals = Record<string, DailyMeals>