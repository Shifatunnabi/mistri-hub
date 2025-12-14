/**
 * Admin User Creation Script
 * 
 * Run this script to create an admin user in MongoDB
 * Usage: node scripts/create-admin.js
 */

const bcrypt = require('bcryptjs');

async function generateAdminUser() {
  const adminData = {
    name: "Admin User",
    email: "admin@mistrihub.com",
    password: "admin123", // Change this!
    phone: "01700000000",
    address: "Dhaka, Bangladesh"
  };

  // Hash the password
  const hashedPassword = await bcrypt.hash(adminData.password, 10);

  const adminDocument = {
    name: adminData.name,
    email: adminData.email,
    password: hashedPassword,
    phone: adminData.phone,
    address: adminData.address,
    role: "ADMIN",
    isApproved: true,
    isVerified: false,
    isBanned: false,
    profilePhoto: "",
    createdAt: new Date(),
    updatedAt: new Date()
  };

  console.log("\n===== ADMIN USER DATA =====");
  console.log("Copy and paste this into MongoDB:\n");
  console.log("db.users.insertOne(" + JSON.stringify(adminDocument, null, 2) + ")");
  console.log("\n===========================");
  console.log("\nLogin Credentials:");
  console.log("Email:", adminData.email);
  console.log("Password:", adminData.password);
  console.log("\n⚠️  Remember to change the password after first login!");
}

generateAdminUser();
