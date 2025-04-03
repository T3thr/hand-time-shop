// app/api/auth/[...nextauth]/options.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/backend/models/User";
import LoginActivity from "@/backend/models/LoginActivity";
import mongodbConnect from "@/backend/lib/mongodb";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export const options = {
  providers: [
    // Admin Credentials Provider
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Admin" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        await mongodbConnect();

        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // Find user by username or email with role "admin"
        const user = await User.findOne({
          $or: [
            { username: credentials.username },
            { email: credentials.username },
          ],
          role: "admin",
        }).select("+password");

        if (!user) {
          return null; // User not found or not an admin
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          return null; // Invalid password
        }

        // Log login activity
        const ipAddress = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        await LoginActivity.create({
          userId: user._id,
          email: user.email,
          name: user.name,
          username: user.username,
          ipAddress,
          role: user.role,
          lastLogin: new Date(),
        });

        // Update lastLogin in User model
        user.lastLogin = new Date();
        await user.save();

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),

    // LINE Provider (unchanged)
    CredentialsProvider({
      id: "line",
      name: "LINE",
      credentials: {
        userId: { label: "User ID", type: "text" },
        displayName: { label: "Display Name", type: "text" },
        pictureUrl: { label: "Picture URL", type: "text" },
      },
      async authorize(credentials) {
        await mongodbConnect();

        if (!credentials?.userId) return null;

        let user = await User.findOne({ lineId: credentials.userId });
        
        if (!user) {
          user = await User.create({
            lineId: credentials.userId,
            name: credentials.displayName,
            avatar: credentials.pictureUrl,
            role: "user",
          });
        }

        await LoginActivity.create({
          userId: user._id,
          name: user.name,
          role: user.role,
          lastLogin: new Date(),
        });

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email || null,
          image: user.avatar,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: process.env.NEXT_PUBLIC_LIFF_URL,
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

export default options;