import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

// GET - Fetch pending verification requests
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const pendingVerifications = await User.find({
      role: "HELPER",
      isApproved: true,
      verificationStatus: "pending",
    }).select("-password").sort({ updatedAt: -1 })

    return NextResponse.json({ helpers: pendingVerifications }, { status: 200 })
  } catch (error) {
    console.error("Error fetching pending verifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Verify or reject helper verification
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { userId, action } = await req.json()

    if (!userId || !action) {
      return NextResponse.json({ error: "User ID and action are required" }, { status: 400 })
    }

    if (action !== "verify" && action !== "reject") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const helper = await User.findById(userId)

    if (!helper) {
      return NextResponse.json({ error: "Helper not found" }, { status: 404 })
    }

    if (helper.role !== "HELPER") {
      return NextResponse.json({ error: "User is not a helper" }, { status: 400 })
    }

    if (action === "verify") {
      helper.isVerified = true
      helper.verificationStatus = "verified"
      await helper.save()

      return NextResponse.json(
        {
          message: "Helper verified successfully!",
          helper: {
            id: helper._id,
            name: helper.name,
            isVerified: helper.isVerified,
          },
        },
        { status: 200 }
      )
    } else {
      // Reject verification
      helper.verificationStatus = "rejected"
      helper.isVerified = false
      // Clear verification documents
      if (helper.helperProfile) {
        helper.helperProfile.nidNumber = ""
        helper.helperProfile.nidPhoto = ""
        helper.helperProfile.verificationDocuments = []
      }
      await helper.save()

      return NextResponse.json(
        {
          message: "Verification rejected. Helper can resubmit documents.",
          helper: {
            id: helper._id,
            name: helper.name,
          },
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error("Verification action error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
