
"use client"

import { useState } from "react"
import type { CSSProperties } from "react"
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

import { Assignee, Chore, SavedChoreList } from "@/types/chores.type"

export default function Page() {
  const [savedLists, setSavedLists] = useState<SavedChoreList[]>([])
  const [selectedListId, setSelectedListId] = useState<string | null>(null)

  const [chores, setChores] = useState<Chore[]>([])

  const [isEditing, setIsEditing] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [choreName, setChoreName] = useState("")
  const [assignee, setAssignee] = useState<Assignee>("Anyone")

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
    setChoreName("")
    setAssignee("Anyone")
  }

  function handleNewList() {
    setSelectedListId(null)
    setChores([])
    setIsEditing(true)
    resetForm()
  }

  function handleSelectList(listId: string) {
    const list = savedLists.find(
      (savedList) => savedList.id === listId
    )

    if (!list) return

    setSelectedListId(listId)
    setChores(list.chores.map((chore) => ({ ...chore })))
    setIsEditing(false)
    resetForm()
  }

  function handleSaveList() {
    if (chores.length === 0) return

    const now = new Date().toISOString()

    if (selectedListId) {
      setSavedLists((previousLists) =>
        previousLists.map((list) =>
          list.id === selectedListId
            ? {
                ...list,
                chores: chores.map((chore) => ({ ...chore })),
                updatedAt: now,
              }
            : list
        )
      )
    } else {
      const newList: SavedChoreList = {
        id: crypto.randomUUID(),
        name: `Chore List - ${formatDate(now)}`,
        chores: chores.map((chore) => ({ ...chore })),
        createdAt: now,
        updatedAt: now,
      }

      setSavedLists((previousLists) => [...previousLists, newList])
      setSelectedListId(newList.id)
    }

    setIsEditing(false)
  }

  function toggleChore(choreId: string) {
    if (!isEditing) return

    setChores((previousChores) =>
      previousChores.map((chore) => {
        if (chore.id !== choreId) return chore

        const isNowDone = !chore.done

        return {
          ...chore,
          done: isNowDone,
          lastDone: isNowDone
            ? formatDate(new Date().toISOString())
            : "Not done yet",
        }
      })
    )
  }

  function updateAssignee(choreId: string, newAssignee: Assignee) {
    if (!isEditing) return

    setChores((previousChores) =>
      previousChores.map((chore) =>
        chore.id === choreId
          ? { ...chore, assignee: newAssignee }
          : chore
      )
    )
  }

  function handleCancel() {
    resetForm()
    setIsDialogOpen(false)
  }

  function handleSaveChore() {
    const trimmedName = choreName.trim()

    if (!trimmedName) return

    const newChore: Chore = {
      id: crypto.randomUUID(),
      item: trimmedName,
      assignee,
      done: false,
      lastDone: "Not done yet",
    }

    setChores((previousChores) => [...previousChores, newChore])

    resetForm()
    setIsDialogOpen(false)
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" />

      <SidebarInset>
        <SiteHeader />

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Page heading */}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Chores
            </h1>
            <p className="text-muted-foreground">
              Manage your chores and keep track of what needs to be done.
            </p>
          </div>

          {/* List toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {savedLists.length > 0 && (
                <Select
                  value={selectedListId ?? ""}
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
                    <SelectItem
                      value="create-new"
                      className="font-semibold text-primary focus:bg-primary/10 focus:text-primary"
                    >
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

          {/* Chores table */}
          <div className="rounded-lg border">
            <div className="grid grid-cols-[2fr_1fr_100px_1fr] gap-4 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
              <div>Chore</div>
              <div>Assignee</div>
              <div>Done</div>
              <div>Last done</div>
            </div>

            {chores.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-muted-foreground">
                No chores in this list yet. Add your first chore.
              </div>
            ) : (
              chores.map((chore) => (
                <div
                  key={chore.id}
                  className="grid grid-cols-[2fr_1fr_100px_1fr] items-center gap-4 border-b px-4 py-3 last:border-b-0"
                >
                  <div className="font-medium">{chore.item}</div>

                  {/* Editable assignee */}
                  <div>
                    <Select
                      value={chore.assignee}
                      disabled={!isEditing}
                      onValueChange={(value) =>
                        updateAssignee(chore.id, value as Assignee)
                      }
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="Anyone">Anyone</SelectItem>
                        <SelectItem value="Jaz">Jaz</SelectItem>
                        <SelectItem value="Luis">Luis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Checkbox
                      checked={chore.done}
                      disabled={!isEditing}
                      onCheckedChange={() => toggleChore(chore.id)}
                    />
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {chore.lastDone}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add chore */}
          <div>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(true)}
              disabled={!isEditing}
            >
              + Add chore
            </Button>
          </div>

          {/* Save list */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveList}
              disabled={!isEditing || chores.length === 0}
            >
              <Save className="mr-2 h-4 w-4" />
              Save List
            </Button>
          </div>
        </div>
      </SidebarInset>

      {/* Add chore dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add chore</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="choreName">Chore</Label>
              <Input
                id="choreName"
                placeholder="e.g. Clean the kitchen"
                value={choreName}
                onChange={(event) => setChoreName(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Select
                value={assignee}
                onValueChange={(value) => setAssignee(value as Assignee)}
              >
                <SelectTrigger id="assignee">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Anyone">Anyone</SelectItem>
                  <SelectItem value="Jaz">Jaz</SelectItem>
                  <SelectItem value="Luis">Luis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>

            <Button
              onClick={handleSaveChore}
              disabled={!choreName.trim()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
