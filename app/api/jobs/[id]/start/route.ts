import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Job from "@/models/Job"
import { createNotification } from "@/lib/notifications"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { id: jobId } = await params

    const job = await Job.findById(jobId)
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Check if user is the assigned helper
    if (job.assignedHelper?.toString() !== session.user.id) {
      return NextResponse.json({ error: "Only assigned helper can start the job" }, { status: 403 })
    }

    // Check if job status is scheduled
    if (job.status !== "scheduled") {
      return NextResponse.json({ error: "Job must be scheduled before starting" }, { status: 400 })
    }

    // Update job
    job.status = "in_progress"
    job.startedAt = new Date()
    await job.save()

    // Notify job seeker that work has started
    await createNotification({
      userId: job.helpSeeker.toString(),
      type: "timeline_update",
      title: "Job Started",
      message: `Work has started on your job: ${job.title}`,
      jobId: jobId,
      link: `/jobs/${jobId}/timeline`,
    })

    return NextResponse.json(
      {
        message: "Job started successfully",
        job,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error starting job:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
