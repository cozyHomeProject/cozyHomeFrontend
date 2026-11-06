
"use client"

import { useRef, useState } from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

type MealType = "Breakfast" | "Lunch" | "Dinner" | "Dessert"
type ViewMode = "day" | "week"

const mealTypes: MealType[] = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Dessert",
]

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

type DailyMeals = Record<MealType, string>
type WeeklyMeals = Record<string, DailyMeals>

function getDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function getWeekStart(date: Date) {
  const result = new Date(date)

  result.setHours(0, 0, 0, 0)
  result.setDate(result.getDate() - result.getDay())

  return result
}

function getWeekNumber(date: Date) {
  const target = new Date(date)

  target.setHours(0, 0, 0, 0)
  target.setDate(
    target.getDate() + 3 - ((target.getDay() + 6) % 7)
  )

  const firstThursday = new Date(target.getFullYear(), 0, 4)

  firstThursday.setDate(
    firstThursday.getDate() +
      3 -
      ((firstThursday.getDay() + 6) % 7)
  )

  return (
    1 +
    Math.round(
      (target.getTime() - firstThursday.getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    )
  )
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
  })
}

function formatDayDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  })
}

export default function Page() {
  const [selectedDate, setSelectedDate] = useState(
    () => new Date()
  )

  const [viewMode, setViewMode] = useState<ViewMode>("week")

  const [meals, setMeals] = useState<WeeklyMeals>({})

  // Tracks the currently hovered meal cell
  const [hoveredCell, setHoveredCell] = useState<{
    dateKey: string
    mealType: MealType
  } | null>(null)

  const weekStart = getWeekStart(selectedDate)

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart)

    date.setDate(weekStart.getDate() + index)

    return date
  })

  const visibleDays =
    viewMode === "week" ? weekDays : [selectedDate]

  const dateInputValue = getDateKey(selectedDate)

  const dateInputRef = useRef<HTMLInputElement>(null)

  function navigateDate(direction: number) {
    const newDate = new Date(selectedDate)

    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + direction * 7)
    } else {
      newDate.setDate(newDate.getDate() + direction)
    }

    setSelectedDate(newDate)
  }

  function goToCurrentPeriod() {
    setSelectedDate(new Date())
  }

  function handleDateChange(value: string) {
    if (!value) return

    const [year, month, day] = value.split("-").map(Number)

    setSelectedDate(new Date(year, month - 1, day))
  }

  function updateMeal(
    date: Date,
    mealType: MealType,
    value: string
  ) {
    const dateKey = getDateKey(date)

    setMeals((previousMeals) => {
      const currentDayMeals: DailyMeals = previousMeals[dateKey] ?? {
        Breakfast: "",
        Lunch: "",
        Dinner: "",
        Dessert: "",
      }

      return {
        ...previousMeals,
        [dateKey]: {
          ...currentDayMeals,
          [mealType]: value,
        },
      }
    })
  }

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <SiteHeader />

        <div className="flex flex-1 flex-col gap-6 p-6">

          {/* Page heading */}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Meals 🍽️
            </h1>

            <p className="text-muted-foreground">
              Plan your meals and keep track of what you will be
              cooking throughout the week.
            </p>
          </div>

          {/* Calendar */}
          <div className="rounded-xl border bg-card shadow-sm">

            {/* Calendar week heading */}
            <div className="border-b px-4 py-3 text-center">
              <h2 className="font-semibold">
                Week {getWeekNumber(selectedDate)}
              </h2>
            </div>

            {/* Calendar controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b p-3">

              {/* Date navigation */}
              <div className="flex flex-wrap items-center gap-2">

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateDate(-1)}
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateDate(1)}
                  aria-label="Next"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Date selector */}
                <div>
                  <Input
                    ref={dateInputRef}
                    type="date"
                    value={dateInputValue}
                    onChange={(event) =>
                      handleDateChange(event.target.value)
                    }
                    aria-label="Choose a date"
                    tabIndex={-1}
                    className="sr-only"
                  />

                  <Button
                    variant="outline"
                    className="min-w-[130px]"
                    onClick={() => {
                      dateInputRef.current?.showPicker()
                    }}
                  >
                    {formatDate(selectedDate)}
                  </Button>
                </div>

                {/* Return to current day/week */}
                <Button
                  variant="outline"
                  onClick={goToCurrentPeriod}
                >
                  {viewMode === "day"
                    ? "Today"
                    : "This week"}
                </Button>
              </div>

              {/* Day / Week toggle */}
              <div className="flex rounded-lg border p-1">
                <Button
                  size="sm"
                  variant={
                    viewMode === "day" ? "default" : "ghost"
                  }
                  onClick={() => {
                    setViewMode("day")
                    setHoveredCell(null)
                  }}
                >
                  Day
                </Button>

                <Button
                  size="sm"
                  variant={
                    viewMode === "week" ? "default" : "ghost"
                  }
                  onClick={() => {
                    setViewMode("week")
                    setHoveredCell(null)
                  }}
                >
                  Week
                </Button>
              </div>
            </div>

            {/* Calendar grid */}
            <div className="overflow-x-auto p-3">
              <div
                className="grid min-w-[850px]"
                onMouseLeave={() => setHoveredCell(null)}
                style={{
                  gridTemplateColumns: `115px repeat(${visibleDays.length}, minmax(100px, 1fr))`,
                }}
              >

                {/* Empty corner */}
                <div />

                {/* Days of the week */}
                {visibleDays.map((date) => {
                  const dateKey = getDateKey(date)
                  const isColumnHovered =
                    hoveredCell?.dateKey === dateKey

                  return (
                    <div
                      key={dateKey}
                      className={`border-b p-3 text-center transition-colors ${
                        isColumnHovered
                          ? "bg-blue-100 dark:bg-blue-950/40"
                          : ""
                      }`}
                    >
                      <div className="font-semibold text-sm">
                        {dayNames[date.getDay()]}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {formatDayDate(date)}
                      </div>
                    </div>
                  )
                })}

                {/* Meal rows */}
                {mealTypes.map((mealType) => {
                  const isRowHovered =
                    hoveredCell?.mealType === mealType

                  return (
                    <div key={mealType} className="contents">
                      {/* Meal type label */}
                      <div
                        className={`flex min-h-[115px] items-center justify-center border-b border-r px-2 text-center font-medium transition-colors ${
                          isRowHovered
                            ? "bg-blue-100 dark:bg-blue-950/40"
                            : "bg-muted"
                        }`}
                      >
                        {mealType}
                      </div>

                      {/* Editable meal cells */}
                      {visibleDays.map((date) => {
                        const dateKey = getDateKey(date)
                        const meal =
                          meals[dateKey]?.[mealType] ?? ""

                        const isColumnHovered =
                          hoveredCell?.dateKey === dateKey

                        const isHighlighted =
                          isRowHovered || isColumnHovered

                        return (
                          <div
                            key={`${dateKey}-${mealType}`}
                            onMouseEnter={() =>
                              setHoveredCell({
                                dateKey,
                                mealType,
                              })
                            }
                            className={`min-h-[115px] border-b border-r p-2 transition-colors ${
                              isHighlighted
                                ? "bg-blue-100 dark:bg-blue-950/40"
                                : "bg-background"
                            }`}
                          >
                            <Input
                              value={meal}
                              onChange={(event) =>
                                updateMeal(
                                  date,
                                  mealType,
                                  event.target.value
                                )
                              }
                              placeholder="Add a meal..."
                              aria-label={`${mealType} on ${dayNames[date.getDay()]}`}
                              className="h-full min-h-[90px] w-full border-0 bg-transparent text-center shadow-none focus-visible:ring-1 focus-visible:ring-primary"
                            />
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Calendar footer */}
            <div className="border-t px-4 py-3 text-sm text-muted-foreground">
              💡 Every square is editable. Click any cell to add
              or update a meal in your meal plan.
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
