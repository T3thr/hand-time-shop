// api/auth/signin/route.js

import User from "@/backend/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mongodbConnect from "@/backend/lib/mongodb";

export async function POST(req) {
  await mongodbConnect();

  const { name,username,email, password } = await req.json();

  // Find user by username
  const user = await User.findOne({ username }).select("+password");
  if (!user) {
    return NextResponse.json({ message: "Invalid username or password" }, { status: 401 });
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return NextResponse.json({ message: "Invalid username or password" }, { status: 401 });
  }

  // Return user data (excluding password)
  return NextResponse.json({
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  }, { status: 200 });
}
