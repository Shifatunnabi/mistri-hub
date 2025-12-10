"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { toast } from "react-hot-toast"

const mockCategories = [
  { id: "1", name: "Plumbing", jobCount: 450, active: true },
  { id: "2", name: "Electrical", jobCount: 380, active: true },
  { id: "3", name: "Cleaning", jobCount: 320, active: true },
  { id: "4", name: "Carpentry", jobCount: 280, active: true },
  { id: "5", name: "Painting", jobCount: 210, active: true },
  { id: "6", name: "Moving", jobCount: 190, active: true },
  { id: "7", name: "Delivery", jobCount: 160, active: false },
  { id: "8", name: "Tutoring", jobCount: 145, active: true },
]

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState(mockCategories)
  const [isAdding, setIsAdding] = useState(false)
  const [newCategory, setNewCategory] = useState("")

  const handleAdd = () => {
    if (!newCategory.trim()) {
      toast.error("Please enter a category name")
      return
    }
    const newCat = {
      id: String(categories.length + 1),
      name: newCategory,
      jobCount: 0,
      active: true,
    }
    setCategories([...categories, newCat])
    setNewCategory("")
    setIsAdding(false)
    toast.success("Category added successfully!")
  }

  const handleToggleStatus = (id: string) => {
    setCategories(categories.map((cat) => (cat.id === id ? { ...cat, active: !cat.active } : cat)))
    toast.success("Category status updated!")
  }

  const handleDelete = (id: string) => {
    setCategories(categories.filter((cat) => cat.id !== id))
    toast.success("Category deleted successfully!")
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto max-w-5xl px-4">
        <Link
          href="/admin"
          className="mb-6 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to dashboard
        </Link>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Category Management</h1>
            <p className="text-muted-foreground">Manage service categories</p>
          </div>
          <Button onClick={() => setIsAdding(true)} className="transition-all duration-300 hover:scale-105">
            <Plus className="mr-2 h-5 w-5" />
            Add Category
          </Button>
        </div>

        {isAdding && (
          <Card className="mb-6 p-6 shadow-xl animate-fade-in-up">
            <h3 className="mb-4 font-bold">Add New Category</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Category Name</Label>
                <Input
                  id="categoryName"
                  placeholder="e.g., Gardening"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
              </div>
              <div className="flex space-x-3">
                <Button onClick={handleAdd} className="transition-all duration-300 hover:scale-105">
                  Add Category
                </Button>
                <Button
                  onClick={() => {
                    setIsAdding(false)
                    setNewCategory("")
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          {categories.map((category, index) => (
            <Card
              key={category.id}
              className="p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-xl font-bold">{category.name}</h3>
                    <Badge variant={category.active ? "default" : "secondary"}>
                      {category.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{category.jobCount} jobs posted</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleToggleStatus(category.id)}
                    className="transition-all duration-300 hover:scale-110"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleDelete(category.id)}
                    className="border-red-600 text-red-600 transition-all duration-300 hover:scale-110 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
