import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Job from "@/models/Job"
import User from "@/models/User"
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

    // Check if user is the job owner
    if (job.helpSeeker.toString() !== session.user.id) {
      return NextResponse.json({ error: "Only job owner can confirm completion" }, { status: 403 })
    }

    // Check if job status is pending_review
    if (job.status !== "pending_review") {
      return NextResponse.json({ error: "Job must be in pending review status to confirm" }, { status: 400 })
    }

    // Update job
    job.status = "completed"
    job.confirmedAt = new Date()
    await job.save()

    // Populate helper and seeker data before returning
    await job.populate([
      { path: "helpSeeker", select: "name email profilePhoto phone" },
      { path: "assignedHelper", select: "name email profilePhoto phone averageRating isVerified" }
    ])

    // Update helper's completed jobs count
    if (job.assignedHelper) {
      await User.findByIdAndUpdate(job.assignedHelper._id, {
        $inc: { "helperProfile.completedJobs": 1 },
      })

      // Notify helper that job has been confirmed
      await createNotification({
        userId: job.assignedHelper._id.toString(),
        type: "timeline_update",
        title: "Congratulations! Job Completed 🎉",
        message: `The help seeker has confirmed that the job "${job.title}" is completed. Congratulations on successfully finishing the job!`,
        jobId: jobId,
        link: `/jobs/${jobId}/timeline`,
      })
    }

    return NextResponse.json(
      {
        message: "Job confirmed as completed successfully!",
        job,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error confirming job:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
