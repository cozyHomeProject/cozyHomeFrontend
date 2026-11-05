
"use client"

import { useState } from "react"
import { Save } from "lucide-react"

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

import { Unit, GroceryItem, SavedList } from "@/types/groceries.types"

export default function Page() {
  const [savedLists, setSavedLists] = useState<SavedList[]>([])
  const [selectedListId, setSelectedListId] = useState<string | null>(null)

  const [items, setItems] = useState<GroceryItem[]>([])

  const [isEditing, setIsEditing] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [itemName, setItemName] = useState("")
  const [quantity, setQuantity] = useState("")
  const [unit, setUnit] = useState<Unit>("Grams")

  const selectedList = savedLists.find(
    (list) => list.id === selectedListId
  )

  function formatDate(date: string) {
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  function resetForm() {
    setItemName("")
    setQuantity("")
    setUnit("Grams")
  }

  function handleNewList() {
    setSelectedListId(null)
    setItems([])
    setIsEditing(true)
    resetForm()
  }

  function handleSelectList(listId: string) {
    const list = savedLists.find((savedList) => savedList.id === listId)

    if (!list) return

    setSelectedListId(listId)
    setItems(list.items.map((item) => ({ ...item })))
    setIsEditing(false)
    resetForm()
  }

  function handleSaveList() {
    if (items.length === 0) return

    const now = new Date().toISOString()

    if (selectedListId) {
      setSavedLists((previousLists) =>
        previousLists.map((list) =>
          list.id === selectedListId
            ? {
                ...list,
                items: items.map((item) => ({ ...item })),
                updatedAt: now,
              }
            : list
        )
      )
    } else {
      const newList: SavedList = {
        id: crypto.randomUUID(),
        name: `Grocery List - ${formatDate(now)}`,
        items: items.map((item) => ({ ...item })),
        createdAt: now,
        updatedAt: now,
      }

      setSavedLists((previousLists) => [...previousLists, newList])
      setSelectedListId(newList.id)
    }

    setIsEditing(false)
  }

  function toggleItem(itemId: number) {
    if (!isEditing) return

    setItems((previousItems) =>
      previousItems.map((item) => {
        if (item.id !== itemId) return item

        const isNowChecked = !item.checked

        return {
          ...item,
          checked: isNowChecked,
          lastOrdered: isNowChecked
            ? formatDate(new Date().toISOString())
            : "Not ordered yet",
        }
      })
    )
  }

  function handleCancel() {
    resetForm()
    setIsDialogOpen(false)
  }

  function handleSaveItem() {
    const trimmedName = itemName.trim()
    const parsedQuantity = Number(quantity)

    if (!trimmedName || !quantity || !Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      return
    }

    const newItem: GroceryItem = {
      id: Date.now(),
      item: trimmedName,
      amount: `${parsedQuantity} ${unit}`,
      lastOrdered: "Not ordered yet",
      checked: false,
    }

    setItems((previousItems) => [...previousItems, newItem])

    resetForm()
    setIsDialogOpen(false)
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
              Groceries
            </h1>
            <p className="text-muted-foreground">
              Manage your grocery lists and keep track of what you need.
            </p>
          </div>

          {/* List toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {savedLists.length > 0 && (
                <Select
                  value={selectedListId ?? undefined}
                  onValueChange={(value) => {
                    if (value === "create-new") {
                      handleNewList()
                    } else {
                      handleSelectList(value)
                    }
                  }}
                >
                  <SelectTrigger className="w-[260px]">
                    <SelectValue placeholder="Select a list" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="create-new"
                      className="font-semibold text-primary focus:bg-primary/10 focus:text-primary">
                      + Create a new list
                    </SelectItem>

                    {savedLists.map((list) => (
                      <SelectItem key={list.id} value={list.id}>
                        {list.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {selectedListId && (
                <Button
                  onClick={() => setIsEditing(true)}
                  disabled={isEditing}
                >
                  Edit List
                </Button>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              {selectedList
                ? `Last saved: ${formatDate(selectedList.updatedAt)}`
                : "New unsaved list"}
            </div>
          </div>

          {/* Grocery items */}
          <div className="rounded-lg border">
            <div className="grid grid-cols-[2fr_1fr_100px_1fr] gap-4 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
              <div>Item</div>
              <div>Quantity</div>
              <div>Got it?</div>
              <div>Last ordered</div>
            </div>

            {items.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-muted-foreground">
                No items in this list yet. Add your first grocery item.
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[2fr_1fr_100px_1fr] items-center gap-4 border-b px-4 py-3 last:border-b-0"
                >
                  <div className="font-medium">{item.item}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.amount}
                  </div>
                  <div>
                    <Checkbox
                      checked={item.checked}
                      disabled={!isEditing}
                      onCheckedChange={() => toggleItem(item.id)}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.lastOrdered}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add item */}
          <div>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(true)}
              disabled={!isEditing}
            >
              + Add item
            </Button>
          </div>

          {/* Save list */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveList}
              disabled={!isEditing || items.length === 0}
            >
              <Save className="mr-2 h-4 w-4" />
              Save List
            </Button>
          </div>
        </div>
      </SidebarInset>

      {/* Add item dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add grocery item</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="itemName">Item name</Label>
              <Input
                id="itemName"
                placeholder="e.g. Tomatoes"
                value={itemName}
                onChange={(event) => setItemName(event.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0.01"
                  step="any"
                  placeholder="e.g. 500"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select
                  value={unit}
                  onValueChange={(value) => setUnit(value as Unit)}
                >
                  <SelectTrigger id="unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Grams">Grams</SelectItem>
                    <SelectItem value="Kilograms">Kilograms</SelectItem>
                    <SelectItem value="Liters">Liters</SelectItem>
                    <SelectItem value="Milliliters">Milliliters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>

            <Button
              onClick={handleSaveItem}
              disabled={
                !itemName.trim() ||
                !quantity ||
                !Number.isFinite(Number(quantity)) ||
                Number(quantity) <= 0
              }
            >
              Add item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
