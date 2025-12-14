import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"

// GET - Fetch user profile
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(session.user.id).select("-password")

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update user profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const body = await req.json()
    const { name, phone, address, currentPassword, newPassword } = body

    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update basic fields
    if (name) user.name = name
    if (phone) user.phone = phone
    if (address) user.address = address

    // Handle password change
    if (currentPassword && newPassword) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
      if (!isPasswordValid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 })
      }
      user.password = await bcrypt.hash(newPassword, 10)
    }

    await user.save()

    // Return user without password
    const userResponse = user.toObject()
    delete userResponse.password

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        user: userResponse,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
