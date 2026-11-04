
"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

const initialItems = [
  {
    id: 1,
    item: "Bread",
    amount: "1",
    lastOrdered: "Nov 01, 2026",
    checked: true,
  },
  {
    id: 2,
    item: "Potatoes",
    amount: "500 grams",
    lastOrdered: "Oct 28, 2026",
    checked: false,
  },
  {
    id: 3,
    item: "Onions",
    amount: "250 grams",
    lastOrdered: "Oct 25, 2026",
    checked: false,
  },
]

const lists = [
  { id: "weekly", name: "Weekly groceries" },
  { id: "monthly", name: "Monthly groceries" },
  { id: "party", name: "Party shopping" },
]

export default function Page() {
  const [selectedList, setSelectedList] = useState("weekly")
  const [items, setItems] = useState(initialItems)

  const toggleItem = (id: number) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, checked: !item.checked }
          : item
      )
    )
  }

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      item: "New item",
      amount: "1",
      lastOrdered: "Not ordered yet",
      checked: false,
    }

    setItems((current) => [...current, newItem])
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />

      <SidebarInset>
        <SiteHeader />

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-6">

            {/* Top toolbar */}
            <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-3">

              {/* Select List */}
              <div className="flex justify-start">
                <Select
                  value={selectedList}
                  onValueChange={setSelectedList}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Select a list" />
                  </SelectTrigger>

                  <SelectContent>
                    {lists.map((list) => (
                      <SelectItem
                        key={list.id}
                        value={list.id}
                      >
                        {list.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* New List */}
              <div className="flex justify-start md:justify-center">
                <Button>
                  + New List
                </Button>
              </div>

              {/* Last Saved */}
              <div className="flex justify-start md:justify-end">
                <span className="text-sm text-muted-foreground">
                  Last saved: Nov 04, 2026, 15:30
                </span>
              </div>

            </div>

            {/* Shopping List */}
            <div className="rounded-xl border bg-card">

              <div className="border-b p-4">
                <h2 className="text-lg font-semibold">
                  Shopping Items
                </h2>
                <p className="text-sm text-muted-foreground">
                  Manage your groceries.
                </p>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">

                  <thead className="bg-muted/50">
                    <tr className="border-b text-left">
                      <th className="px-6 py-3 font-medium">
                        Item
                      </th>
                      <th className="px-6 py-3 font-medium">
                        Amount
                      </th>
                      <th className="px-6 py-3 font-medium text-center">
                        Got it!
                      </th>
                      <th className="px-6 py-3 font-medium">
                        Last ordered
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b last:border-0 hover:bg-muted/30"
                      >
                        <td className={`px-6 py-4 font-medium ${
                          item.checked
                            ? "text-muted-foreground line-through"
                            : ""
                        }`}>
                          {item.item}
                        </td>

                        <td className="px-6 py-4">
                          {item.amount}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <Checkbox
                            checked={item.checked}
                            onCheckedChange={() => toggleItem(item.id)}
                            aria-label={`Mark ${item.item} as purchased`}
                          />
                        </td>

                        <td className="px-6 py-4 text-muted-foreground">
                          {item.lastOrdered}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>

              {/* Add Item */}
              <div className="border-t p-4">
                <Button
                  variant="outline"
                  onClick={addItem}
                >
                  + Add item
                </Button>
              </div>

            </div>

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
