import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Announcement from "@/models/Announcement"

// GET - Fetch all announcements
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const announcements = await Announcement.find()
      .sort({ priority: 1, createdAt: -1 }) // Sort by priority then date
      .lean()

    // Calculate unread count for current user
    const unreadCount = announcements.filter(
      (announcement) => !announcement.viewedBy.some(
        (id: any) => id.toString() === session.user.id
      )
    ).length

    // Add isViewed flag for each announcement
    const announcementsWithViewStatus = announcements.map((announcement) => ({
      ...announcement,
      isViewed: announcement.viewedBy.some(
        (id: any) => id.toString() === session.user.id
      ),
    }))

    return NextResponse.json(
      {
        announcements: announcementsWithViewStatus,
        unreadCount,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching announcements:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create announcement (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 })
    }

    await connectDB()

    const body = await req.json()
    const { title, details, priority } = body

    if (!title || !details || !priority) {
      return NextResponse.json(
        { error: "Title, details, and priority are required" },
        { status: 400 }
      )
    }

    if (!["high", "medium", "low"].includes(priority)) {
      return NextResponse.json({ error: "Invalid priority" }, { status: 400 })
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      details: details.trim(),
      priority,
      viewedBy: [],
    })

    return NextResponse.json(
      {
        message: "Announcement created successfully",
        announcement,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating announcement:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
