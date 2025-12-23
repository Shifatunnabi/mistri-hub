import mongoose, { Schema, Document } from "mongoose"

export interface IMessage extends Document {
  job: mongoose.Types.ObjectId
  sender: mongoose.Types.ObjectId
  text: string
  createdAt: Date
  updatedAt: Date
}

const MessageSchema = new Schema<IMessage>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// Compound index for efficient queries
MessageSchema.index({ job: 1, createdAt: 1 })

const Message = mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema)

export default Message
