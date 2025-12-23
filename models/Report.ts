import mongoose, { Schema, Document } from "mongoose"

export interface IReport extends Document {
  reporter: mongoose.Types.ObjectId
  reportedUser: mongoose.Types.ObjectId
  job: mongoose.Types.ObjectId
  category: "misbehave" | "inexperienced" | "unprofessional" | "poor_quality" | "safety_concerns" | "other"
  description: string
  status: "pending" | "reviewed" | "resolved" | "dismissed"
  adminNotes?: string
  createdAt: Date
  updatedAt: Date
}

const ReportSchema = new Schema<IReport>(
  {
    reporter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportedUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    category: {
      type: String,
      enum: ["misbehave", "inexperienced", "unprofessional", "poor_quality", "safety_concerns", "other"],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "dismissed"],
      default: "pending",
    },
    adminNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

const Report = mongoose.models.Report || mongoose.model<IReport>("Report", ReportSchema)

export default Report
