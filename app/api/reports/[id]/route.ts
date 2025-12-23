import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Report from "@/models/Report"
import { createNotification } from "@/lib/notifications"

// PATCH - Update report status (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 })
    }

    const { id } = await params
    await connectDB()

    const body = await req.json()
    const { status, adminNotes } = body

    // Validate status
    const validStatuses = ["pending", "reviewed", "resolved", "dismissed"]
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Find and update report
    const report = await Report.findById(id)
      .populate("reporter", "name email")
      .populate("reportedUser", "name email")
      .populate("job", "title")

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    const oldStatus = report.status

    // Update report
    if (status) report.status = status
    if (adminNotes !== undefined) report.adminNotes = adminNotes

    await report.save()

    // Send notification to reporter if status changed to reviewed
    if (oldStatus !== "reviewed" && status === "reviewed") {
      await createNotification({
        userId: report.reporter._id.toString(),
        type: "timeline_update",
        title: "Your report is under review",
        message: `Our team is currently reviewing your report regarding "${report.job.title}". We will take appropriate action if necessary.`,
        jobId: report.job._id.toString(),
      })
    }

    // Send notification if resolved
    if (oldStatus !== "resolved" && status === "resolved") {
      await createNotification({
        userId: report.reporter._id.toString(),
        type: "timeline_update",
        title: "Report resolved",
        message: `Your report regarding "${report.job.title}" has been resolved. Thank you for helping keep our community safe.`,
        jobId: report.job._id.toString(),
      })
    }

    // Send notification if dismissed
    if (oldStatus !== "dismissed" && status === "dismissed") {
      await createNotification({
        userId: report.reporter._id.toString(),
        type: "timeline_update",
        title: "Report reviewed",
        message: `After reviewing your report regarding "${report.job.title}", we found no violation of our policies. Thank you for your concern.`,
        jobId: report.job._id.toString(),
      })
    }

    return NextResponse.json(
      {
        message: "Report updated successfully",
        report,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
