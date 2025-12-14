import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { HelperRegisterSchema } from "@/lib/validations/auth"
import { ZodError } from "zod"

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()

    // Validate input
    const validatedData = HelperRegisterSchema.parse(body)

    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email })
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Check if NID already exists
    const existingNID = await User.findOne({ "helperProfile.nidNumber": validatedData.nidNumber })
    if (existingNID) {
      return NextResponse.json({ error: "Helper with this NID number already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Create new helper (pending approval)
    const newHelper = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      phone: validatedData.phone,
      address: validatedData.address,
      role: "HELPER",
      isApproved: false, // Requires admin approval
      helperProfile: {
        nidNumber: validatedData.nidNumber,
      },
    })

    // Remove password from response
    const helperResponse = {
      id: newHelper._id,
      name: newHelper.name,
      email: newHelper.email,
      phone: newHelper.phone,
      address: newHelper.address,
      role: newHelper.role,
      isApproved: newHelper.isApproved,
      nidNumber: newHelper.helperProfile?.nidNumber,
    }

    return NextResponse.json(
      {
        message:
          "Helper registration submitted successfully! Your account is pending admin approval. You will receive an email once approved.",
        user: helperResponse,
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

    console.error("Helper registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
