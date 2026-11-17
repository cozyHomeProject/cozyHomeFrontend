"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"

import { DashboardSummary, fetchDashboardSummary } from "@/lib/dashboard-api"

type State = { status: "loading" } | { status: "error" } | { status: "ready"; data: DashboardSummary }

export function SectionCards() {
  const [state, setState] = useState<State>({ status: "loading" })

  useEffect(() => {
    fetchDashboardSummary()
      .then((data) => setState({ status: "ready", data }))
      .catch(() => setState({ status: "error" }))
  }, [])

  const data = state.status === "ready" ? state.data : null
  const placeholder = state.status === "loading" ? "…" : "Backend unavailable"

  const groceriesMain = data
    ? data.groceries
      ? `${data.groceries.pending} to buy`
      : "No lists yet"
    : placeholder
  const groceriesFooter = data?.groceries
    ? `📋 ${data.groceries.total} ${data.groceries.total === 1 ? "item" : "items"} in the latest list`
    : "📋 View List"

  const mealMain = data ? data.meals.next?.name ?? "Nothing planned" : placeholder
  const mealFooter = data?.meals.after
    ? `⏭️ Next: ${data.meals.after.name}`
    : data?.meals.next
      ? `🕒 ${data.meals.next.type}`
      : "📅 Plan your meals"

  const choresMain = data
    ? data.chores
      ? `🗹 ${data.chores.done} done`
      : "No lists yet"
    : placeholder
  const choresFooter = data?.chores ? `📋 ${data.chores.todo} to do` : "📋 View chores"

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card relative">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            Groceries 🧺
          </CardTitle>
        </CardHeader>
        <div className="pl-10 text-3xl">
          {groceriesMain}
        </div>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            {groceriesFooter}
          </div>
        </CardFooter>

        <Link
          href="/groceries"
          aria-label="View groceries list"
          className="absolute inset-0 rounded-xl"
        />
      </Card>

      <Card className="@container/card relative">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
           Next Meal 🍽️
          </CardTitle>
        </CardHeader>
         <div className="pl-10 text-3xl">
            {mealMain}
          </div>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            {mealFooter}
          </div>
        </CardFooter>

        <Link
          href="/meals"
          aria-label="View planned meals"
          className="absolute inset-0 rounded-xl"
        />
      </Card>

      <Card className="@container/card relative">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            Chores 🧹
          </CardTitle>
        </CardHeader>
        <div className="pl-10 text-3xl">
          {choresMain}
        </div>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            {choresFooter}
          </div>
        </CardFooter>

        <Link
          href="/chores"
          aria-label="View chores list"
          className="absolute inset-0 rounded-xl"
        />
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            Garden 🌱🌻
          </CardTitle>
        </CardHeader>
        <div className="pl-10 text-3xl">
          Last read 35% Moisture
        </div>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Watering in 3 hours  20 minutes
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
