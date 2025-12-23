import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Category from "@/models/Category"
import Job from "@/models/Job"

// GET - Fetch all categories (public)
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const activeOnly = searchParams.get("activeOnly") === "true"

    const query = activeOnly ? { active: true } : {}

    const categories = await Category.find(query).sort({ name: 1 })

    // Get job counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const jobCount = await Job.countDocuments({ category: category.name })
        return {
          _id: category._id,
          name: category.name,
          slug: category.slug,
          active: category.active,
          jobCount,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        }
      })
    )

    return NextResponse.json({ categories: categoriesWithCounts }, { status: 200 })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create a new category (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 })
    }

    await connectDB()

    const body = await req.json()
    const { name } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    })

    if (existingCategory) {
      return NextResponse.json({ error: "Category already exists" }, { status: 400 })
    }

    const category = await Category.create({
      name: name.trim(),
      active: true,
    })

    return NextResponse.json(
      {
        message: "Category created successfully",
        category: {
          _id: category._id,
          name: category.name,
          slug: category.slug,
          active: category.active,
          jobCount: 0,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
