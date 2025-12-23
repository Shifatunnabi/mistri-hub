import mongoose, { Schema, Document } from "mongoose"

export interface IAnnouncement extends Document {
  title: string
  details: string
  priority: "high" | "medium" | "low"
  viewedBy: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      required: true,
      default: "low",
    },
    viewedBy: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
  },
  {
    timestamps: true,
  }
)

// Index for efficient queries
AnnouncementSchema.index({ createdAt: -1 })
AnnouncementSchema.index({ priority: 1, createdAt: -1 })

const Announcement = mongoose.models.Announcement || mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema)

export default Announcement
