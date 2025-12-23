import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Report from "@/models/Report"
import Job from "@/models/Job"
import User from "@/models/User"

// POST - Create a new report
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const body = await req.json()
    const { jobId, reportedUserId, category, description } = body

    // Validation
    if (!jobId || !reportedUserId || !category || !description) {
      return NextResponse.json(
        { error: "Job ID, reported user ID, category, and description are required" },
        { status: 400 }
      )
    }

    // Validate category
    const validCategories = ["misbehave", "inexperienced", "unprofessional", "poor_quality", "safety_concerns", "other"]
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid report category" }, { status: 400 })
    }

    // Check if job exists
    const job = await Job.findById(jobId)
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Check if reported user exists
    const reportedUser = await User.findById(reportedUserId)
    if (!reportedUser) {
      return NextResponse.json({ error: "Reported user not found" }, { status: 404 })
    }

    // Check if user is part of the job (either seeker or helper)
    const isJobSeeker = job.helpSeeker.toString() === session.user.id
    const isHelper = job.assignedHelper?.toString() === session.user.id

    if (!isJobSeeker && !isHelper) {
      return NextResponse.json(
        { error: "You can only report users from jobs you're involved in" },
        { status: 403 }
      )
    }

    // Prevent self-reporting
    if (reportedUserId === session.user.id) {
      return NextResponse.json({ error: "You cannot report yourself" }, { status: 400 })
    }

    // Create report
    const report = await Report.create({
      reporter: session.user.id,
      reportedUser: reportedUserId,
      job: jobId,
      category,
      description,
      status: "pending",
    })

    // Populate the report data for response
    await report.populate([
      { path: "reporter", select: "name email role" },
      { path: "reportedUser", select: "name email role" },
      { path: "job", select: "title status" },
    ])

    return NextResponse.json(
      {
        message: "Report submitted successfully. Our team will review it shortly.",
        report,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET - Fetch reports (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const query: any = {}
    if (status) {
      query.status = status
    }

    const skip = (page - 1) * limit

    const reports = await Report.find(query)
      .populate("reporter", "name email role profilePhoto")
      .populate("reportedUser", "name email role profilePhoto")
      .populate("job", "title status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Report.countDocuments(query)

    return NextResponse.json(
      {
        reports,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
