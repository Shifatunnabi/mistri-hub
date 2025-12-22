import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Application from "@/models/Application"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const { id: jobId } = await params

    // Check if user has applied for this job
    const application = await Application.findOne({
      job: jobId,
      helper: session.user.id,
    })

    if (application) {
      return NextResponse.json(
        {
          hasApplied: true,
          application: {
            status: application.status,
            createdAt: application.createdAt,
          },
        },
        { status: 200 }
      )
    }

    return NextResponse.json({ hasApplied: false }, { status: 200 })
  } catch (error) {
    console.error("Error checking application status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
