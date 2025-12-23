import mongoose, { Schema, Document } from "mongoose"

export interface ICategory extends Document {
  name: string
  slug: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Create slug from name before saving
CategorySchema.pre("save", function () {
  if (this.isModified("name") || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }
})

const Category = mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema)

export default Category
