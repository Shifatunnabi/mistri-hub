import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import PasswordReset from "@/models/PasswordReset"
import { ResetPasswordSchema } from "@/lib/validations/auth"
import { ZodError } from "zod"

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()

    // Validate input
    const validatedData = ResetPasswordSchema.parse(body)

    // Hash the token from URL
    const hashedToken = crypto.createHash("sha256").update(validatedData.token).digest("hex")

    // Find valid reset token
    const resetRecord = await PasswordReset.findOne({
      token: hashedToken,
      used: false,
      expiresAt: { $gt: new Date() },
    })

    if (!resetRecord) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    // Find user
    const user = await User.findOne({ email: resetRecord.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Update user password
    user.password = hashedPassword
    await user.save()

    // Mark token as used
    resetRecord.used = true
    await resetRecord.save()

    return NextResponse.json(
      {
        message: "Password reset successfully! You can now login with your new password.",
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

    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
  }
}
