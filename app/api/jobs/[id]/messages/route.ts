import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Message from "@/models/Message"
import Job from "@/models/Job"

// GET - Fetch messages for a job
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await connectDB()

    // Check if user is part of the job
    const job = await Job.findById(id)
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    const isJobSeeker = job.helpSeeker.toString() === session.user.id
    const isHelper = job.assignedHelper?.toString() === session.user.id

    if (!isJobSeeker && !isHelper) {
      return NextResponse.json(
        { error: "You can only view messages for jobs you're involved in" },
        { status: 403 }
      )
    }

    // Fetch messages
    const messages = await Message.find({ job: id })
      .populate("sender", "name profilePhoto")
      .sort({ createdAt: 1 })

    return NextResponse.json({ messages }, { status: 200 })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Send a message
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await connectDB()

    const body = await req.json()
    const { text } = body

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Message text is required" }, { status: 400 })
    }

    // Check if user is part of the job
    const job = await Job.findById(id)
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    const isJobSeeker = job.helpSeeker.toString() === session.user.id
    const isHelper = job.assignedHelper?.toString() === session.user.id

    if (!isJobSeeker && !isHelper) {
      return NextResponse.json(
        { error: "You can only send messages for jobs you're involved in" },
        { status: 403 }
      )
    }

    // Create message
    const message = await Message.create({
      job: id,
      sender: session.user.id,
      text: text.trim(),
    })

    // Populate sender info
    await message.populate("sender", "name profilePhoto")

    return NextResponse.json(
      {
        message: "Message sent successfully",
        data: message,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
