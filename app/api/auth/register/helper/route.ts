import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { HelperRegisterSchema } from "@/lib/validations/auth"
import { ZodError } from "zod"
import { createNotification } from "@/lib/notifications"

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
      profilePhoto: body.profilePhoto || "",
      helperProfile: {
        skills: body.skills || [],
        certificates: [],
        serviceAreas: body.serviceAreas ? body.serviceAreas.split(",").map((s: string) => s.trim()) : [],
        experience: body.experience || "",
        rating: 0,
        totalReviews: 0,
        completedJobs: 0,
        verificationDocuments: [],
      },
    })

    // Send welcome notification
    await createNotification({
      userId: newHelper._id.toString(),
      type: "welcome",
      title: "Welcome to MistriHub! 👋",
      message: "Thank you for joining as a Helper! Your account is pending admin approval. Once approved, you can verify your profile and start applying for jobs.",
      link: "/profile",
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
