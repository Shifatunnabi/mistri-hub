import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { v2 as cloudinary } from "cloudinary"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("photo") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "mistri-hub/profiles",
      resource_type: "auto",
    })

    await connectDB()

    // Update user profile photo in database
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { profilePhoto: result.secure_url },
      { new: true }
    ).select("-password")

    return NextResponse.json(
      {
        message: "Profile photo updated successfully",
        photoUrl: result.secure_url,
        user,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error uploading photo:", error)
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 })
  }
}
