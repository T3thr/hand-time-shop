// app/api/auth/line-login/route.js
import { NextResponse } from "next/server";
import { signIn } from "next-auth/react";
import User from "@/backend/models/User";
import mongodbConnect from "@/backend/lib/mongodb";

export async function POST(req) {
  try {
    await mongodbConnect();

    const { userId, displayName, pictureUrl } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "LINE user ID is required" }, { status: 400 });
    }

    // Check if user exists
    let user = await User.findOne({ lineId: userId });

    if (!user) {
      // Create new LINE user with a structure similar to admin user
      user = await User.create({
        lineId: userId,
        name: displayName || `LINE User ${userId.slice(0, 4)}`,
        avatar: pictureUrl || null,
        role: "user",
        email: null, // LINE users typically don't provide email
        username: null, // No username for LINE users
        password: null, // No password for LINE users
        cart: [],
        wishlist: [],
        orders: [],
        addresses: [],
        isVerified: true, // LINE users are verified by default
        lastLogin: new Date(),
        preferences: {
          theme: "system",
          notifications: { email: false, sms: false },
        },
        stats: {
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: null,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      // Update lastLogin for existing user
      user.lastLogin = new Date();
      await user.save();
    }

    // Trigger NextAuth sign-in with LINE credentials
    const signInResponse = await signIn("line", {
      redirect: false,
      userId: userId,
      displayName: displayName,
      pictureUrl: pictureUrl,
    });

    if (signInResponse?.error) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        lineId: user.lineId,
      },
    });
  } catch (error) {
    console.error("LINE login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}