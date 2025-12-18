import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Job from "@/models/Job"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const { id } = await params
    const job = await Job.findById(id).populate("helpSeeker", "name email profilePhoto phone")

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    return NextResponse.json({ job }, { status: 200 })
  } catch (error) {
    console.error("Error fetching job:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
