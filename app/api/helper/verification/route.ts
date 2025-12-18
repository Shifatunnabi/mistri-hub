import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "HELPER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const body = await req.json()
    const { nidNumber, nidPhoto, certificates } = body

    if (!nidNumber || !nidPhoto || !certificates || certificates.length === 0) {
      return NextResponse.json(
        { error: "NID number, NID photo, and at least one certificate are required" },
        { status: 400 }
      )
    }

    // Find the user
    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.isApproved) {
      return NextResponse.json({ error: "Your account must be approved first" }, { status: 400 })
    }

    // Update verification documents - ensure helperProfile exists and preserve all existing fields
    if (!user.helperProfile) {
      user.helperProfile = {
        skills: [],
        certificates: [],
        serviceAreas: [],
        rating: 0,
        totalReviews: 0,
        completedJobs: 0,
        verificationDocuments: [],
      }
    }

    // Update verification fields
    user.helperProfile.nidNumber = nidNumber
    user.helperProfile.nidPhoto = nidPhoto
    user.helperProfile.verificationDocuments = certificates
    user.verificationStatus = "pending"
    user.isVerified = false // Reset verification status until admin approves

    await user.save()

    return NextResponse.json(
      {
        message: "Verification documents submitted successfully! Awaiting admin review.",
        user: {
          id: user._id,
          verificationStatus: user.verificationStatus,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Verification submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
