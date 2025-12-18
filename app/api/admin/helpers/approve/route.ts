import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { authOptions } from "@/lib/auth"
import { sendHelperApprovalEmail } from "@/lib/email"

// GET - Fetch all helpers (pending and approved)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Fetch all helpers regardless of approval status
    const helpers = await User.find({
      role: "HELPER",
    }).select("-password").sort({ createdAt: -1 })

    return NextResponse.json({ helpers }, { status: 200 })
  } catch (error) {
    console.error("Error fetching helpers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Approve or reject helper
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { userId, action } = await req.json() // action: 'approve' or 'reject'

    if (!userId || !action) {
      return NextResponse.json({ error: "User ID and action are required" }, { status: 400 })
    }

    const helper = await User.findById(userId)

    if (!helper || helper.role !== "HELPER") {
      return NextResponse.json({ error: "Helper not found" }, { status: 404 })
    }

    if (action === "approve") {
      helper.isApproved = true
      await helper.save()

      // Send approval email
      await sendHelperApprovalEmail(helper.email, helper.name, true)

      return NextResponse.json(
        {
          message: "Helper approved successfully",
          helper: {
            id: helper._id,
            name: helper.name,
            email: helper.email,
            isApproved: helper.isApproved,
          },
        },
        { status: 200 }
      )
    } else if (action === "reject") {
      // For rejection, we can either delete or keep with isApproved: false
      // Let's send rejection email and delete the account
      await sendHelperApprovalEmail(helper.email, helper.name, false)
      await User.findByIdAndDelete(userId)

      return NextResponse.json({ message: "Helper rejected and removed" }, { status: 200 })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error processing helper approval:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
