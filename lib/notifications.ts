import Notification from "@/models/Notification"
import connectDB from "@/lib/mongodb"

interface CreateNotificationParams {
  userId: string
  type: "welcome" | "new_application" | "application_accepted" | "application_rejected" | "job_status_update" | "new_review" | "verification_update" | "timeline_update"
  title: string
  message: string
  jobId?: string
  applicationId?: string
  link?: string
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  jobId,
  applicationId,
  link,
}: CreateNotificationParams) {
  try {
    await connectDB()
    
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      job: jobId,
      application: applicationId,
      link,
    })

    return notification
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}
