import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Application from "@/models/Application"
import Job from "@/models/Job"
import User from "@/models/User"
import { createNotification } from "@/lib/notifications"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is a helper
    if (session.user.role !== "HELPER") {
      return NextResponse.json({ error: "Only helpers can apply for jobs" }, { status: 403 })
    }

    await connectDB()

    const { id: jobId } = await params

    // Check if job exists and is open
    const job = await Job.findById(jobId)
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    if (job.status !== "open") {
      return NextResponse.json({ error: "This job is no longer accepting applications" }, { status: 400 })
    }

    // Check if helper is verified
    const helper = await User.findById(session.user.id)
    if (!helper) {
      return NextResponse.json({ error: "Helper not found" }, { status: 404 })
    }
    
    if (!helper.isVerified) {
      return NextResponse.json({ error: "Please verify yourself first to apply for jobs" }, { status: 403 })
    }

    // Check if helper has already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      helper: session.user.id,
    })

    if (existingApplication) {
      return NextResponse.json({ error: "You have already applied for this job" }, { status: 400 })
    }

    // Create application
    const application = await Application.create({
      job: jobId,
      helper: session.user.id,
      status: "pending",
    })

    // Increment application count on job
    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicationCount: 1 },
    })

    // Create notification for job owner
    await createNotification({
      userId: job.helpSeeker.toString(),
      type: "new_application",
      title: "New Application Received",
      message: `${helper.name} applied for your job: ${job.title}`,
      jobId: jobId,
      applicationId: application._id.toString(),
      link: `/profile?tab=posted-jobs`,
    })

    return NextResponse.json(
      {
        message: "Application submitted successfully",
        application,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error applying for job:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
