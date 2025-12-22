import mongoose, { Schema, Document, Model } from "mongoose"

export interface IJob extends Document {
  _id: string
  title: string
  description: string
  category: string
  budget: {
    min: number
    max: number
  }
  location: string
  photos: string[]
  helpSeeker: mongoose.Types.ObjectId
  assignedHelper?: mongoose.Types.ObjectId
  status: "open" | "assigned" | "scheduled" | "in_progress" | "pending_review" | "completed"
  applicationCount: number
  scheduledDate?: Date
  startedAt?: Date
  completedAt?: Date
  confirmedAt?: Date
  aiAnalysis?: {
    problemAnalysis: string
    steps: Array<{
      order: string
      description: string
    }>
    budget: string
  }
  createdAt: Date
  updatedAt: Date
}

const JobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    budget: {
      min: {
        type: Number,
        required: [true, "Minimum budget is required"],
        min: [0, "Budget cannot be negative"],
      },
      max: {
        type: Number,
        required: [true, "Maximum budget is required"],
        min: [0, "Budget cannot be negative"],
      },
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    photos: {
      type: [String],
      default: [],
      validate: {
        validator: function (photos: string[]) {
          return photos.length <= 5
        },
        message: "Cannot upload more than 5 photos",
      },
    },
    helpSeeker: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Help seeker is required"],
    },
    assignedHelper: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["open", "assigned", "scheduled", "in_progress", "pending_review", "completed"],
      default: "open",
    },
    applicationCount: {
      type: Number,
      default: 0,
    },
    scheduledDate: {
      type: Date,
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    confirmedAt: {
      type: Date,
      default: null,
    },
    aiAnalysis: {
      problemAnalysis: {
        type: String,
      },
      steps: [
        {
          order: String,
          description: String,
        },
      ],
      budget: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for better query performance
JobSchema.index({ helpSeeker: 1, createdAt: -1 })
JobSchema.index({ assignedHelper: 1 })
JobSchema.index({ status: 1, createdAt: -1 })
JobSchema.index({ category: 1, status: 1, createdAt: -1 })

const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema)

export default Job
