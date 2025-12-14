import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { authOptions } from "@/lib/auth"
import { sendHelperApprovalEmail } from "@/lib/email"

// GET - Fetch all pending helper approvals
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const pendingHelpers = await User.find({
      role: "HELPER",
      isApproved: false,
      isBanned: false,
    }).select("-password")

    return NextResponse.json({ helpers: pendingHelpers }, { status: 200 })
  } catch (error) {
    console.error("Error fetching pending helpers:", error)
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

    const { helperId, action } = await req.json() // action: 'approve' or 'reject'

    if (!helperId || !action) {
      return NextResponse.json({ error: "Helper ID and action are required" }, { status: 400 })
    }

    const helper = await User.findById(helperId)

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
      await User.findByIdAndDelete(helperId)

      return NextResponse.json({ message: "Helper rejected and removed" }, { status: 200 })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error processing helper approval:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
