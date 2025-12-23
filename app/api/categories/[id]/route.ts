import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Category from "@/models/Category"

// PATCH - Update category (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 })
    }

    const { id } = await params
    await connectDB()

    const body = await req.json()
    const { name, active } = body

    const category = await Category.findById(id)
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Update fields
    if (name !== undefined && name.trim()) {
      // Check if new name already exists (excluding current category)
      const existingCategory = await Category.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
      })

      if (existingCategory) {
        return NextResponse.json({ error: "Category name already exists" }, { status: 400 })
      }

      category.name = name.trim()
    }

    if (active !== undefined) {
      category.active = active
    }

    await category.save()

    return NextResponse.json(
      {
        message: "Category updated successfully",
        category: {
          _id: category._id,
          name: category.name,
          slug: category.slug,
          active: category.active,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete category (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 })
    }

    const { id } = await params
    await connectDB()

    const category = await Category.findById(id)
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    await Category.findByIdAndDelete(id)

    return NextResponse.json(
      {
        message: "Category deleted successfully",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
