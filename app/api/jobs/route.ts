import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Job from "@/models/Job"
import User from "@/models/User"

// GET - Fetch all jobs
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const category = searchParams.get("category")
    const status = searchParams.get("status") || "open"
    const helpSeeker = searchParams.get("helpSeeker")

    const query: any = {}
    
    // Filter by status if no specific helpSeeker is requested
    if (!helpSeeker) {
      query.status = status
    }
    
    if (category) {
      query.category = category
    }
    
    // Filter by helpSeeker for user's posted jobs
    if (helpSeeker) {
      query.helpSeeker = helpSeeker
    }

    const skip = (page - 1) * limit

    const jobs = await Job.find(query)
      .populate("helpSeeker", "name email profilePhoto")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Job.countDocuments(query)

    return NextResponse.json(
      {
        jobs,
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
    console.error("Error fetching jobs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create a new job
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "HELP_SEEKER") {
      return NextResponse.json({ error: "Unauthorized. Only help seekers can post jobs." }, { status: 401 })
    }

    await connectDB()

    const body = await req.json()
    const { title, description, category, budgetMin, budgetMax, location, photos } = body

    // Validation
    if (!title || !description || !category || !location) {
      return NextResponse.json(
        { error: "Title, description, category, and location are required" },
        { status: 400 }
      )
    }

    if (!budgetMin || !budgetMax || budgetMin < 0 || budgetMax < budgetMin) {
      return NextResponse.json({ error: "Invalid budget range" }, { status: 400 })
    }

    if (photos && photos.length > 5) {
      return NextResponse.json({ error: "Maximum 5 photos allowed" }, { status: 400 })
    }

    // Create job
    const job = await Job.create({
      title,
      description,
      category,
      budget: {
        min: budgetMin,
        max: budgetMax,
      },
      location,
      photos: photos || [],
      helpSeeker: session.user.id,
      status: "open",
    })

    // Populate help seeker data
    await job.populate("helpSeeker", "name email profilePhoto")

    // Generate AI analysis asynchronously (don't wait for it)
    generateAIAnalysis(job._id.toString(), title, description).catch((err) =>
      console.error("AI analysis failed:", err)
    )

    return NextResponse.json(
      {
        message: "Job posted successfully!",
        job,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating job:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to generate AI analysis in the background
async function generateAIAnalysis(jobId: string, title: string, description: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/jobs/ai-analysis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, title, description }),
    })

    if (!response.ok) {
      console.error("AI analysis request failed")
    }
  } catch (error) {
    console.error("Error generating AI analysis:", error)
  }
}
