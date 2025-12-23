"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Edit, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "react-hot-toast"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface Category {
  _id: string
  name: string
  slug: string
  active: boolean
  jobCount: number
  createdAt: string
  updatedAt: string
}

export default function CategoryManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [updatingCategoryId, setUpdatingCategoryId] = useState<string | null>(null)

  useEffect(() => {
    if (status === "loading") return
    
    if (!session || session.user?.role !== "ADMIN") {
      toast.error("Unauthorized access")
      router.push("/")
      return
    }

    fetchCategories()
  }, [session, status])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/categories")
      const data = await response.json()

      if (response.ok) {
        setCategories(data.categories)
      } else {
        toast.error(data.error || "Failed to fetch categories")
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error("Failed to load categories")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!newCategory.trim()) {
      toast.error("Please enter a category name")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Category added successfully!")
        setCategories([...categories, data.category])
        setNewCategory("")
        setIsAdding(false)
      } else {
        toast.error(data.error || "Failed to add category")
      }
    } catch (error) {
      console.error("Error adding category:", error)
      toast.error("Failed to add category")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setUpdatingCategoryId(id)
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentStatus }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Category status updated!")
        setCategories(
          categories.map((cat) =>
            cat._id === id ? { ...cat, active: !currentStatus } : cat
          )
        )
      } else {
        toast.error(data.error || "Failed to update category")
      }
    } catch (error) {
      console.error("Error updating category:", error)
      toast.error("Failed to update category")
    } finally {
      setUpdatingCategoryId(null)
    }
  }

  const handleDelete = async (id: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete "${categoryName}"? This action cannot be undone.`)) {
      return
    }

    setUpdatingCategoryId(id)
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Category deleted successfully!")
        setCategories(categories.filter((cat) => cat._id !== id))
      } else {
        toast.error(data.error || "Failed to delete category")
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      toast.error("Failed to delete category")
    } finally {
      setUpdatingCategoryId(null)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    )
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
                <Button 
                  onClick={handleAdd} 
                  className="transition-all duration-300 hover:scale-105"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Category"}
                </Button>
                <Button
                  onClick={() => {
                    setIsAdding(false)
                    setNewCategory("")
                  }}
                  variant="outline"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {categories.length === 0 && !isLoading ? (
          <Card className="p-12 text-center">
            <Plus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Categories</h3>
            <p className="text-muted-foreground mb-4">Get started by adding your first category.</p>
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="mr-2 h-5 w-5" />
              Add Category
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {categories.map((category, index) => (
              <Card
                key={category._id}
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
                      onClick={() => handleToggleStatus(category._id, category.active)}
                      disabled={updatingCategoryId === category._id}
                      className="transition-all duration-300 hover:scale-110"
                    >
                      {updatingCategoryId === category._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Edit className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleDelete(category._id, category.name)}
                      disabled={updatingCategoryId === category._id}
                      className="border-red-600 text-red-600 transition-all duration-300 hover:scale-110 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
