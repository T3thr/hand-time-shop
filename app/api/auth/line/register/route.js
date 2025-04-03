// app/api/line/register/route.js
import { NextResponse } from "next/server";
import mongodbConnect from "@/backend/lib/mongodb";
import User from "@/backend/models/User";

export async function POST(request) {
  try {
    await mongodbConnect();
    const { userId, displayName, pictureUrl } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "LINE user ID is required" }, { status: 400 });
    }

    let user = await User.findOne({ lineId: userId });

    if (!user) {
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
      });
    } else {
      user.lastLogin = new Date();
      await user.save();
    }

    return NextResponse.json({
      message: "LINE user registered successfully",
      user: {
        id: user._id.toString(),
        name: user.name,
        lineId: user.lineId,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LINE registration error:", error);
    return NextResponse.json({ error: "Failed to register LINE user" }, { status: 500 });
  }
}