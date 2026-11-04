import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Link href="/groceries" className="block">
        <Card className="@container/card">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              Groceries 🧺
            </CardTitle>
          </CardHeader>
            <div className="pl-10 text-3xl">
              4 items
            </div>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">
              📋 View List
            </div>
          </CardFooter>
        </Card>
      </Link>

      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
           Next Meal 🍽️
          </CardTitle>
        </CardHeader>
         <div className="pl-10 text-3xl">
            Chiken and Veggies Traybake
          </div>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            ⏭️ Next: Spaghetti Carbonara
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            Chores 🧹
          </CardTitle>
        </CardHeader>
        <div className="pl-10 text-3xl">
          🗹 5 taks done
        </div>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            📋2 tasks to do
          </div>
        </CardFooter>
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
