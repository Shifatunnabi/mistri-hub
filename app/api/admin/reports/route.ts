import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Report from "@/models/Report"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is admin
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const reportedUserId = searchParams.get("reportedUserId")

    if (!reportedUserId) {
      return NextResponse.json({ error: "Reported user ID is required" }, { status: 400 })
    }

    // Fetch all reports for the user
    const reports = await Report.find({ reportedUser: reportedUserId })
      .populate("reporter", "name profilePhoto")
      .populate("job", "title")
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(
      {
        reports,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Fetch reports error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
