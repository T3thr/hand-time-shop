// app/api/auth/line/register/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import User from "@/backend/models/User";

export async function POST(request) {
  try {
    await dbConnect();
    const { userId, displayName, pictureUrl } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "LINE user ID is required" }, { status: 400 });
    }

    // Check if user already exists
    let user = await User.findOne({ lineId: userId });
    if (user) {
      return NextResponse.json({ message: "User already registered", user }, { status: 200 });
    }

    // Create new LINE user
    user = await User.create({
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
      createdAt: new Date(), 
      updatedAt: new Date(),
    });

    return NextResponse.json({ message: "LINE user registered successfully", user }, { status: 201 });
  } catch (error) {
    console.error("LINE registration error:", error);
    return NextResponse.json(
      { error: "Failed to register LINE user", details: error.message },
      { status: 500 }
    );
  }
}