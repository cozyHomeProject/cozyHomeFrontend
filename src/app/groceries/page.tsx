
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import { Save } from "lucide-react"

// Types
type Unit = "Grams" | "Kilograms" | "Liters" | "Milliliters"

type GroceryItem = {
  id: number
  item: string
  amount: string
  lastOrdered: string
  checked: boolean
}

type SavedList = {
  id: string
  name: string
  items: GroceryItem[]
  createdAt: string
  updatedAt: string
}

// Mock data
const initialItems: GroceryItem[] = [
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
    amount: "500 Grams",
    lastOrdered: "Oct 28, 2026",
    checked: false,
  },
  {
    id: 3,
    item: "Onions",
    amount: "250 Grams",
    lastOrdered: "Oct 25, 2026",
    checked: false,
  },
]

const units: Unit[] = [
  "Grams",
  "Kilograms",
  "Liters",
  "Milliliters",
]

export default function Page() {
  // List state
  const [savedLists, setSavedLists] = useState<SavedList[]>([])
  const [selectedListId, setSelectedListId] = useState<string | null>(null)
  const [items, setItems] = useState<GroceryItem[]>(initialItems)
  const [isEditing, setIsEditing] = useState(true)

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Form state
  const [itemName, setItemName] = useState("")
  const [quantity, setQuantity] = useState("")
  const [unit, setUnit] = useState<Unit>("Grams")

  // Helpers
  const formatDate = (date: Date) => {
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const selectedList = savedLists.find(
    (list) => list.id === selectedListId
  )

  // Create a new empty list
  const handleNewList = () => {
    setSelectedListId(null)
    setItems([])
    setIsEditing(true)
    resetForm()
  }

  // Load an existing list
  const handleSelectList = (listId: string) => {
    const list = savedLists.find(
      (list) => list.id === listId
    )

    if (!list) return

    setSelectedListId(list.id)
    setItems([...list.items])
    setIsEditing(false)
    resetForm()
  }

  // Save new list or update existing list
  const handleSaveList = () => {
    if (items.length === 0) return

    const now = new Date().toISOString()

    if (selectedListId) {
      // Update existing list
      setSavedLists((current) =>
        current.map((list) =>
          list.id === selectedListId
            ? {
                ...list,
                items: [...items],
                updatedAt: now,
              }
            : list
        )
      )
    } else {
      // Create a new list
      const newList: SavedList = {
        id: crypto.randomUUID(),
        name: formatDate(new Date()),
        items: [...items],
        createdAt: now,
        updatedAt: now,
      }

      setSavedLists((current) => [...current, newList])
      setSelectedListId(newList.id)
    }

    setIsEditing(false)
  }

  // Toggle item checkbox
  const toggleItem = (id: number) => {
    if (!isEditing) return

    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, checked: !item.checked }
          : item
      )
    )
  }

  // Reset form
  const resetForm = () => {
    setItemName("")
    setQuantity("")
    setUnit("Grams")
  }

  // Cancel adding item
  const handleCancel = () => {
    resetForm()
    setIsDialogOpen(false)
  }

  // Add new item
  const handleSaveItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const newItem: GroceryItem = {
      id: Date.now(),
      item: itemName.trim(),
      amount: `${quantity} ${unit}`,
      lastOrdered: "Not ordered yet",
      checked: false,
    }

    setItems((current) => [...current, newItem])

    resetForm()
    setIsDialogOpen(false)
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
                  value={selectedListId ?? ""}
                  onValueChange={handleSelectList}
                  disabled={savedLists.length === 0}
                >
                  <SelectTrigger className="w-[240px]">
                    <SelectValue placeholder="Select a list" />
                  </SelectTrigger>

                  <SelectContent>
                    {savedLists.map((list) => (
                      <SelectItem key={list.id} value={list.id}>
                        {list.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* New List / Edit List */}
              <div className="flex justify-start md:justify-center">
                {selectedListId ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    disabled={isEditing}
                  >
                    Edit List
                  </Button>
                ) : (
                  <Button onClick={handleNewList}>
                    + New List
                  </Button>
                )}
              </div>

              {/* Last Saved */}
              <div className="flex justify-start md:justify-end">
                <span className="text-sm text-muted-foreground">
                  Last saved:{" "}
                  {selectedList
                    ? formatDate(new Date(selectedList.updatedAt))
                    : "Not saved yet"}
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
                  Manage the items you need to buy.
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
                        Quantity
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
                    {items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-10 text-center text-muted-foreground"
                        >
                          No items yet. Click Add item to get started.
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b last:border-0 hover:bg-muted/30"
                        >
                          <td
                            className={`px-6 py-4 font-medium ${
                              item.checked
                                ? "text-muted-foreground line-through"
                                : ""
                            }`}
                          >
                            {item.item}
                          </td>

                          <td className="px-6 py-4">
                            {item.amount}
                          </td>

                          <td className="px-6 py-4 text-center">
                            <Checkbox
                              checked={item.checked}
                              disabled={!isEditing}
                              onCheckedChange={() => toggleItem(item.id)}
                              aria-label={`Mark ${item.item} as purchased`}
                            />
                          </td>

                          <td className="px-6 py-4 text-muted-foreground">
                            {item.lastOrdered}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>

                </table>
              </div>

              {/* Add Item */}
              <div className="border-t p-4">
                <Button
                  variant="outline"
                  disabled={!isEditing}
                  onClick={() => setIsDialogOpen(true)}
                >
                  + Add item
                </Button>
              </div>

              {/* Save List */}
              <div className="flex justify-end border-t p-4">
                <Button
                  onClick={handleSaveList}
                  disabled={!isEditing || items.length === 0}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save List
                </Button>
              </div>

            </div>

            {/* Add Item Dialog */}
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (!open) resetForm()
              }}
            >
              <DialogContent className="sm:max-w-[425px]">

                <DialogHeader>
                  <DialogTitle className="text-xl">
                    Add item
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSaveItem}>

                  <div className="flex flex-col gap-5 py-4">

                    {/* Item Name */}
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="itemName">
                        Item
                      </Label>

                      <Input
                        id="itemName"
                        placeholder="Enter item name"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>

                    {/* Quantity and Units */}
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="quantity">
                        Quantity
                      </Label>

                      <div className="flex gap-2">

                        <Input
                          id="quantity"
                          type="number"
                          placeholder="e.g. 1.5"
                          min="0.01"
                          step="any"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          required
                          className="flex-1"
                        />

                        <Select
                          value={unit}
                          onValueChange={(value) => setUnit(value as Unit)}
                        >
                          <SelectTrigger className="w-[145px]">
                            <SelectValue placeholder="Units" />
                          </SelectTrigger>

                          <SelectContent>
                            {units.map((u) => (
                              <SelectItem key={u} value={u}>
                                {u}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                      </div>
                    </div>

                  </div>

                  {/* Dialog Buttons */}
                  <DialogFooter className="gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>

                    <Button type="submit">
                      Save
                    </Button>
                  </DialogFooter>

                </form>

              </DialogContent>
            </Dialog>

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
