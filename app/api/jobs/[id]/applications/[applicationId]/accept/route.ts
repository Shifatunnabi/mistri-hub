import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Application from "@/models/Application"
import Job from "@/models/Job"
import User from "@/models/User"
import { createNotification } from "@/lib/notifications"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; applicationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { id: jobId, applicationId } = await params

    // Check if job exists
    const job = await Job.findById(jobId)
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Check if user is the job owner
    if (job.helpSeeker.toString() !== session.user.id) {
      return NextResponse.json({ error: "Only job owner can select helpers" }, { status: 403 })
    }

    // Check if job is still open
    if (job.status !== "open") {
      return NextResponse.json({ error: "This job is no longer accepting applications" }, { status: 400 })
    }

    // Check if application exists and is pending
    const application = await Application.findById(applicationId)
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    if (application.job.toString() !== jobId) {
      return NextResponse.json({ error: "Invalid application for this job" }, { status: 400 })
    }

    if (application.status !== "pending") {
      return NextResponse.json({ error: "This application has already been processed" }, { status: 400 })
    }

    // Accept the selected application
    application.status = "accepted"
    await application.save()

    // Get all other pending applications for notifications
    const rejectedApplications = await Application.find({
      job: jobId,
      _id: { $ne: applicationId },
      status: "pending",
    })

    // Reject all other pending applications for this job
    await Application.updateMany(
      {
        job: jobId,
        _id: { $ne: applicationId },
        status: "pending",
      },
      {
        $set: { status: "rejected" },
      }
    )

    // Update job status and assign helper
    job.status = "assigned"
    job.assignedHelper = application.helper
    await job.save()

    // Get accepted helper details
    const acceptedHelper = await User.findById(application.helper)

    // Send notification to accepted helper
    if (acceptedHelper) {
      await createNotification({
        userId: application.helper.toString(),
        type: "application_accepted",
        title: "Application Accepted! 🎉",
        message: `Congratulations! You've been selected for the job: ${job.title}`,
        jobId: jobId,
        applicationId: application._id.toString(),
        link: `/jobs/${jobId}/timeline`,
      })
    }

    // Send notifications to rejected helpers
    for (const rejectedApp of rejectedApplications) {
      await createNotification({
        userId: rejectedApp.helper.toString(),
        type: "application_rejected",
        title: "Application Update",
        message: `The job "${job.title}" has been filled. Keep applying to other opportunities!`,
        jobId: jobId,
        applicationId: rejectedApp._id.toString(),
      })
    }

    return NextResponse.json(
      {
        message: "Helper selected successfully",
        job,
        application,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error selecting helper:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
