import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import PasswordReset from "@/models/PasswordReset"
import { sendPasswordResetEmail } from "@/lib/email"
import { ForgotPasswordSchema } from "@/lib/validations/auth"
import { ZodError } from "zod"

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()

    // Validate input
    const validatedData = ForgotPasswordSchema.parse(body)

    // Check if user exists
    const user = await User.findOne({ email: validatedData.email })
    if (!user) {
      // For security, don't reveal if email exists or not
      return NextResponse.json(
        {
          message: "If an account with that email exists, a password reset link has been sent.",
        },
        { status: 200 }
      )
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    // Save token to database
    await PasswordReset.create({
      email: validatedData.email,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    })

    // Send email
    await sendPasswordResetEmail(validatedData.email, resetToken)

    return NextResponse.json(
      {
        message: "If an account with that email exists, a password reset link has been sent.",
      },
      { status: 200 }
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

    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
