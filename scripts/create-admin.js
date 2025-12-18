/**
 * Admin User Creation Script
 * 
 * Run this script to create an admin user in MongoDB
 * Usage: node scripts/create-admin.js
 */

const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

// Admin credentials - Change these if needed
const ADMIN_EMAIL = "admin@mistrihub.com"
const ADMIN_PASSWORD = "Admin@123"
const ADMIN_NAME = "Admin User"
const ADMIN_PHONE = "+8801700000000"

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/mistri-hub"

// User Schema (must match the model)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, default: "" },
  role: { type: String, enum: ["HELP_SEEKER", "HELPER", "ADMIN"], default: "HELP_SEEKER" },
  profilePhoto: { type: String, default: "" },
  isApproved: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

userSchema.index({ email: 1 })

const User = mongoose.models.User || mongoose.model("User", userSchema)

async function createAdmin() {
  try {
    console.log("\n🔄 Starting admin creation process...\n")
    
    // Connect to MongoDB
    console.log("Connecting to MongoDB...")
    await mongoose.connect(MONGODB_URI)
    console.log("✅ Connected to MongoDB\n")

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL })
    if (existingAdmin) {
      console.log("⚠️  Admin user already exists!")
      console.log("\n=================================")
      console.log("Existing Admin Details:")
      console.log("=================================")
      console.log("Name:     ", existingAdmin.name)
      console.log("Email:    ", ADMIN_EMAIL)
      console.log("Role:     ", existingAdmin.role)
      console.log("=================================\n")
      console.log("You can login with your existing credentials.")
      console.log("If you forgot the password, delete the user from MongoDB and run this script again.\n")
      await mongoose.connection.close()
      return
    }

    // Hash password
    console.log("🔐 Hashing password...")
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)

    // Create admin user
    console.log("👤 Creating admin user...\n")
    const admin = new User({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      phone: ADMIN_PHONE,
      address: "MistriHub Headquarters",
      role: "ADMIN",
      isApproved: true,
      isVerified: true,
      isBanned: false,
    })

    await admin.save()

    console.log("✅ Admin user created successfully!\n")
    console.log("=================================")
    console.log("   Admin Login Credentials")
    console.log("=================================")
    console.log("Email:    ", ADMIN_EMAIL)
    console.log("Password: ", ADMIN_PASSWORD)
    console.log("=================================\n")
    console.log("🌐 Login URL: http://localhost:3000/login")
    console.log("📊 Admin Panel: http://localhost:3000/admin\n")
    console.log("⚠️  IMPORTANT: Change the password after first login!\n")

    // Close connection
    await mongoose.connection.close()
    console.log("✅ Database connection closed\n")
    process.exit(0)
  } catch (error) {
    console.error("\n❌ Error creating admin:", error.message)
    if (error.code === 11000) {
      console.error("   Duplicate key error - Admin with this email already exists")
    }
    await mongoose.connection.close()
    process.exit(1)
  }
}

// Run the script
createAdmin()
