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

        // Check for hardcoded admin credentials first
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (
          credentials?.username === "Admin" &&
          credentials?.password === adminPassword
        ) {
          const adminId = process.env.ADMIN_ID || new mongoose.Types.ObjectId();
          const ipAddress = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
          
          await LoginActivity.create({
            userId: adminId,
            email: "admin@handtime.com",
            name: "Admin",
            username: "Admin",
            ipAddress,
            role: "admin",
            lastLogin: new Date(),
          });

          return {
            id: adminId,
            name: "Admin",
            email: "admin@handtime.com",
            role: "admin",
          };
        }

        // Check database for admin users
        const user = await User.findOne({ 
          username: credentials?.username,
          role: "admin"
        }).select("+password");

        if (!user) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials?.password,
          user.password
        );

        if (!isPasswordValid) return null;

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

        return {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),

    // User Credentials Provider
    CredentialsProvider({
      id: "user-credentials",
      name: "User Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        await mongodbConnect();

        const user = await User.findOne({ 
          username: credentials?.username,
          role: "user"
        }).select("+password");

        if (!user) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials?.password,
          user.password
        );

        if (!isPasswordValid) return null;

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

        return {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),

    // LINE Provider
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
          id: user._id,
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
    signIn: process.env.NEXT_PUBLIC_LIFF_URL ,
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