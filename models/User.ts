import mongoose, { Schema, Document, Model } from "mongoose"

export type UserRole = "HELP_SEEKER" | "HELPER" | "ADMIN"

export interface IUser extends Document {
  _id: string
  name: string
  email: string
  password: string
  phone: string
  address: string
  role: UserRole
  profilePhoto?: string
  isApproved: boolean // For HELPER approval by admin
  isVerified: boolean // For HELPER verification badge
  isBanned: boolean
  verificationStatus?: string // For tracking verification submission status
  createdAt: Date
  updatedAt: Date

  // Helper-specific fields
  helperProfile?: {
    skills: string[]
    certificates: string[]
    serviceAreas: string[]
    experience?: string
    hourlyRate?: number
    rating: number
    totalReviews: number
    completedJobs: number
    nidNumber?: string
    nidPhoto?: string
    verificationDocuments: string[]
  }
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["HELP_SEEKER", "HELPER", "ADMIN"],
      default: "HELP_SEEKER",
      required: true,
    },
    profilePhoto: {
      type: String,
      default: "",
    },
    isApproved: {
      type: Boolean,
      default: function (this: IUser) {
        // Auto-approve HELP_SEEKER and ADMIN, require approval for HELPER
        return this.role === "HELP_SEEKER" || this.role === "ADMIN"
      },
    },
    isVerified: {
      type: Boolean,
      default: false, // Verification badge (for helpers only)
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ["none", "pending", "verified", "rejected"],
      default: "none",
    },
    helperProfile: {
      skills: {
        type: [String],
        default: [],
      },
      certificates: {
        type: [String],
        default: [],
      },
      serviceAreas: {
        type: [String],
        default: [],
      },
      experience: {
        type: String,
        default: "",
      },
      nidNumber: {
        type: String,
        default: "",
      },
      nidPhoto: {
        type: String,
        default: "",
      },
      hourlyRate: {
        type: Number,
        default: 0,
      },
      rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      totalReviews: {
        type: Number,
        default: 0,
      },
      completedJobs: {
        type: Number,
        default: 0,
      },
      verificationDocuments: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for better query performance
UserSchema.index({ email: 1 }, { unique: true })
UserSchema.index({ role: 1 })
UserSchema.index({ isApproved: 1 })
UserSchema.index({ isVerified: 1 })

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User
