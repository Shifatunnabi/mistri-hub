import mongoose, { Schema, Document } from "mongoose"

export interface IApplication extends Document {
  job: mongoose.Types.ObjectId
  helper: mongoose.Types.ObjectId
  status: "pending" | "accepted" | "rejected"
  createdAt: Date
  updatedAt: Date
}

const ApplicationSchema = new Schema<IApplication>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    helper: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Compound index to prevent duplicate applications
ApplicationSchema.index({ job: 1, helper: 1 }, { unique: true })

// Index for efficient queries
ApplicationSchema.index({ status: 1, createdAt: -1 })

const Application = mongoose.models.Application || mongoose.model<IApplication>("Application", ApplicationSchema)

export default Application
