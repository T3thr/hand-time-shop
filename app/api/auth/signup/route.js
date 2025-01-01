import User from "@/backend/models/User";
import mongodbConnect from "@/backend/lib/mongodb";
import { NextResponse } from "next/server";
import crypto from 'crypto';
import { sendVerificationEmail } from '@/backend/utils/sendemail';

export async function POST(req) {
  await mongodbConnect();

  const { name, username, email, password } = await req.json();

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  const existingUsername = await User.findOne({ username });
  
  if (existingUser) {
    return NextResponse.json(
      { message: "Email already registered" },
      { status: 400 }
    );
  }

  if (existingUsername) {
    return NextResponse.json(
      { message: "Username already taken" },
      { status: 400 }
    );
  }

  try {
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user with verification token
    const user = await User.create({ 
      name, 
      username, 
      email, 
      password,
      verificationToken,
      verificationTokenExpiry,
      isVerified: false
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: 'user',
        isVerified: false
      },
      message: "Registration successful. Please check your email to verify your account."
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: "Error creating user" },
      { status: 500 }
    );
  }
}