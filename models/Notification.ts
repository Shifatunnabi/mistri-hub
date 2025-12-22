import mongoose, { Schema, Document } from "mongoose"

export interface INotification extends Document {
  user: mongoose.Types.ObjectId
  type: "welcome" | "new_application" | "application_accepted" | "application_rejected" | "job_status_update" | "new_review" | "verification_update" | "timeline_update"
  title: string
  message: string
  job?: mongoose.Types.ObjectId
  application?: mongoose.Types.ObjectId
  link?: string
  isRead: boolean
  createdAt: Date
  updatedAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["welcome", "new_application", "application_accepted", "application_rejected", "job_status_update", "new_review", "verification_update", "timeline_update"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
    },
    application: {
      type: Schema.Types.ObjectId,
      ref: "Application",
    },
    link: {
      type: String,
      default: "",
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

// Compound indexes for efficient queries
NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 })
NotificationSchema.index({ user: 1, createdAt: -1 })

const Notification = mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema)

export default Notification
