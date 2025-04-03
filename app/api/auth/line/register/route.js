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
    
    // Verify the idToken if needed
    // This would normally involve a verification step with LINE's API
    
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
      // Update last login time
      user.lastLogin = new Date();
      if (!user.avatar && pictureUrl) {
        user.avatar = pictureUrl;
      }
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
    return NextResponse.json(
      { error: "Failed to register LINE user", details: error.message },
      { status: 500 }
    );
  }
}