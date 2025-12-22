import mongoose, { Schema, Document } from "mongoose"

export interface IReview extends Document {
  job: mongoose.Types.ObjectId
  reviewer: mongoose.Types.ObjectId
  reviewedUser: mongoose.Types.ObjectId
  rating: number
  comment: string
  createdAt: Date
  updatedAt: Date
}

const ReviewSchema = new Schema<IReview>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewedUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
)

// Prevent duplicate reviews - one review per job per reviewer
ReviewSchema.index({ job: 1, reviewer: 1 }, { unique: true })

// Index for fetching user's reviews
ReviewSchema.index({ reviewedUser: 1, createdAt: -1 })

const Review = mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema)

export default Review
