import mongoose, { Schema, Document, Model } from "mongoose"

export interface IPasswordReset extends Document {
  email: string
  token: string
  expiresAt: Date
  used: boolean
  createdAt: Date
}

const PasswordResetSchema = new Schema<IPasswordReset>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Index for token lookup and auto-deletion of expired tokens
PasswordResetSchema.index({ token: 1 })
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const PasswordReset: Model<IPasswordReset> =
  mongoose.models.PasswordReset || mongoose.model<IPasswordReset>("PasswordReset", PasswordResetSchema)

export default PasswordReset
