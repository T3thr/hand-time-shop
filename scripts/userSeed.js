// scripts/userSeed.js
import "dotenv/config"; // Load environment variables from .env file
import mongoose from "mongoose";
import dbConnect from "@/backend/lib/mongodb.js";
import User from "@/backend/models/User.js";

async function seedAdmin() {
  try {
    // Connect to MongoDB
    await dbConnect();
    console.log("✅ Connected to MongoDB successfully");

    // Get admin credentials from environment variables
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Validate required environment variables
    if (!adminUsername || !adminEmail || !adminPassword) {
      console.error("❌ Missing required environment variables. Please check your .env file.");
      console.error("Required variables: ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD");
      process.exit(1);
    }

    // Check if admin user already exists
    const existingAdmin = await User.findOne({
      $or: [{ username: adminUsername }, { email: adminEmail }],
    });

    if (existingAdmin) {
      console.log(`⚠️ Admin user already exists with email: ${existingAdmin.email}`);
      console.log("Details:", {
        username: existingAdmin.username,
        email: existingAdmin.email,
        role: existingAdmin.role,
        createdAt: existingAdmin.createdAt,
      });
      process.exit(0);
    }

    // Create new admin user with updated schema
    const newAdmin = new User({
      username: adminUsername,
      email: adminEmail,
      password: adminPassword, // Will be hashed by pre-save hook
      name: "Admin User",
      role: "admin",
      avatar: null,
      lineId: null, // Explicitly null to avoid overlap with LINE users
      cart: [],
      wishlist: [],
      orders: [], // Empty array, defaults will handle orderId when orders are added
      addresses: [],
      isVerified: true,
      lastLogin: new Date(),
      preferences: {
        theme: "system",
        notifications: {
          email: true,
          sms: false,
        },
      },
      stats: {
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: null,
      },
    });

    // Save admin user to database
    await newAdmin.save();

    console.log("✅ Admin user created successfully!");
    console.log("Details:", {
      username: newAdmin.username,
      email: newAdmin.email,
      role: newAdmin.role,
      createdAt: newAdmin.createdAt,
    });
  } catch (error) {
    console.error("❌ Error seeding admin user:", error.message);
    if (error.code === 11000) {
      console.error(
        "This appears to be a duplicate key error. The username or email might already be in use."
      );
    }
    process.exit(1);
  } finally {
    // Close the MongoDB connection
    try {
      await mongoose.connection.close();
      console.log("✅ MongoDB connection closed");
    } catch (error) {
      console.error("❌ Error closing MongoDB connection:", error);
    }
    process.exit(0);
  }
}

// Run the seeding function
seedAdmin();