import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { HelpSeekerRegisterSchema } from "@/lib/validations/auth"
import { ZodError } from "zod"

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()

    // Validate input
    const validatedData = HelpSeekerRegisterSchema.parse(body)

    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email })
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Create new help seeker
    const newUser = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      phone: validatedData.phone,
      address: validatedData.address,
      role: "HELP_SEEKER",
      isApproved: true, // Auto-approve help seekers
    })

    // Remove password from response
    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      address: newUser.address,
      role: newUser.role,
      isApproved: newUser.isApproved,
    }

    return NextResponse.json(
      {
        message: "Help Seeker account created successfully! You can now login.",
        user: userResponse,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      )
    }

    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
