// app/api/auth/line/register/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import User from "@/backend/models/User";

export async function POST(request) {
  try {
    await dbConnect();

    const { userId, displayName, pictureUrl, idToken } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "LINE user ID is required" }, { status: 400 });
    }

    // Check for existing user by lineId
    let user = await User.findOne({ lineId: userId });

    if (!user) {
      // Create new LINE user
      user = new User({
        lineId: userId,
        name: displayName || `LINE User ${userId.slice(0, 4)}`,
        avatar: pictureUrl || null,
        role: "user",
        email: null,
        username: null,
        password: null, // No password for LINE users
        cart: [],
        wishlist: [],
        orders: [], // Empty array, defaults will handle orderId when orders are added
        addresses: [],
        isVerified: true, // LINE users are auto-verified
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
      });
      await user.save();
    } else {
      // Update existing user
      user.lastLogin = new Date();
      if (!user.avatar && pictureUrl) user.avatar = pictureUrl;
      if (!user.name && displayName) user.name = displayName;
      await user.save();
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        lineId: user.lineId,
        avatar: user.avatar,
        role: user.role,
      },
    }, { status: 200 });
  } catch (error) {
    console.error("LINE registration error:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Duplicate LINE user ID or other unique field detected", details: error.message },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to register LINE user", details: error.message },
      { status: 500 }
    );
  }
}