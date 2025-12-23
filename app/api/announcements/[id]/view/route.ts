import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Announcement from "@/models/Announcement"

// PATCH - Mark announcement as viewed
export async function PATCH(
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

    const announcement = await Announcement.findById(id)
    if (!announcement) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 })
    }

    // Add user to viewedBy if not already viewed
    if (!announcement.viewedBy.includes(session.user.id as any)) {
      announcement.viewedBy.push(session.user.id as any)
      await announcement.save()
    }

    return NextResponse.json(
      {
        message: "Announcement marked as viewed",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error marking announcement as viewed:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
