import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Review from "@/models/Review"
import Job from "@/models/Job"
import User from "@/models/User"
import { createNotification } from "@/lib/notifications"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { jobId, rating, comment } = await req.json()

    if (!jobId || !rating || !comment) {
      return NextResponse.json({ error: "Job ID, rating, and comment are required" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    // Check if job exists
    const job = await Job.findById(jobId)
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Check if user is the job owner
    if (job.helpSeeker.toString() !== session.user.id) {
      return NextResponse.json({ error: "Only job owner can submit review" }, { status: 403 })
    }

    // Check if job is completed
    if (job.status !== "completed") {
      return NextResponse.json({ error: "Can only review completed jobs" }, { status: 400 })
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      job: jobId,
      reviewer: session.user.id,
    })

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this job" }, { status: 400 })
    }

    // Create review
    const review = await Review.create({
      job: jobId,
      reviewer: session.user.id,
      reviewedUser: job.assignedHelper,
      rating,
      comment,
    })

    // Update helper's rating
    const helper = await User.findById(job.assignedHelper)
    if (helper) {
      const totalReviews = helper.totalReviews + 1
      const newAverageRating = ((helper.averageRating * helper.totalReviews) + rating) / totalReviews

      helper.averageRating = parseFloat(newAverageRating.toFixed(2))
      helper.totalReviews = totalReviews

      // Update helper profile stats
      if (helper.helperProfile) {
        helper.helperProfile.rating = helper.averageRating
        helper.helperProfile.totalReviews = totalReviews
        helper.helperProfile.completedJobs = (helper.helperProfile.completedJobs || 0) + 1
      }

      await helper.save()

      // Notify helper about new review
      await createNotification({
        userId: helper._id.toString(),
        type: "new_review",
        title: "New Review Received",
        message: `You received a new ${rating}-star review for the job "${job.title}". Check your profile to see the feedback.`,
        jobId: jobId,
        link: `/profile`,
      })
    }

    return NextResponse.json(
      {
        message: "Review submitted successfully",
        review,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error submitting review:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    await connectDB()

    const { searchParams } = new URL(req.url)
    const helperId = searchParams.get("helperId")
    const jobId = searchParams.get("jobId")

    // Check if user has already reviewed a specific job
    if (jobId) {
      const existingReview = await Review.findOne({
        job: jobId,
      }).populate("reviewer", "name profilePhoto")

      if (!session || !session.user) {
        return NextResponse.json({ 
          hasReviewed: !!existingReview,
          review: existingReview 
        }, { status: 200 })
      }

      return NextResponse.json({ 
        hasReviewed: !!existingReview,
        review: existingReview 
      }, { status: 200 })
    }

    // Fetch reviews for a helper
    if (!helperId) {
      return NextResponse.json({ error: "Helper ID or Job ID is required" }, { status: 400 })
    }

    const reviews = await Review.find({ reviewedUser: helperId })
      .populate("reviewer", "name profilePhoto")
      .populate("job", "title category")
      .sort({ createdAt: -1 })
      .limit(20)

    return NextResponse.json({ reviews }, { status: 200 })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
