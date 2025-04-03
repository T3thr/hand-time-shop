// app/api/auth/line/register/route.js
import { NextResponse } from "next/server";
import mongodbConnect from "@/backend/lib/mongodb";
import User from "@/backend/models/User";

export async function POST(request) {
  try {
    await mongodbConnect();
    const { userId, displayName, pictureUrl } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { message: "LINE user ID is required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ lineId: userId });
    if (existingUser) {
      return NextResponse.json(
        { message: "LINE user already registered" },
        { status: 409 }
      );
    }

    // Create new LINE user
    const user = await User.create({
      lineId: userId,
      name: displayName || `LINE User ${userId.slice(0, 4)}`,
      avatar: pictureUrl || null,
      role: "user",
      email: null,
      username: null,
      password: null,
      cart: [],
      wishlist: [],
      orders: [],
      addresses: [],
      isVerified: true,
      lastLogin: new Date(),
      preferences: {
        theme: "system",
        notifications: { email: true, sms: false },
      },
      stats: {
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: null,
      },
      createdAt: new Date(), // Using 2025 date as per request
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { message: "LINE user registered successfully", userId: user._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("LINE registration error:", error);
    return NextResponse.json(
      { message: "Failed to register LINE user", error: error.message },
      { status: 500 }
    );
  }
}