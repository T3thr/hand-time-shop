// app/api/auth/[...nextauth]/options.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/backend/models/User";
import mongodbConnect from "@/backend/lib/mongodb";
import bcrypt from "bcryptjs";

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
          throw new Error("Username and password are required");
        }

        const user = await User.findOne({
          $or: [{ username: credentials.username }, { email: credentials.username }],
          role: "admin",
        }).select("+password");

        if (!user) {
          throw new Error("Admin user not found");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

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

        if (!credentials?.userId) {
          throw new Error("LINE user ID is required");
        }

        let user = await User.findOne({ lineId: credentials.userId });

        if (!user) {
          // New LINE user - populate all required fields
          user = await User.create({
            lineId: credentials.userId,
            name: credentials.displayName || `LINE User ${credentials.userId.slice(0, 4)}`,
            avatar: credentials.pictureUrl || null,
            role: "user",
            email: null, // Optional for LINE users
            username: null, // Optional for LINE users
            password: null, // No password for LINE users
            cart: [],
            wishlist: [],
            orders: [],
            addresses: [],
            isVerified: true, // LINE users are verified by default
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
          // Existing user - only update lastLogin
          user.lastLogin = new Date();
          await user.save();
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email || null,
          image: user.avatar,
          role: user.role,
          lineId: user.lineId, // Include LINE-specific data
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.lineId = user.lineId || null; // Add LINE-specific data to token
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.lineId = token.lineId; // Add LINE-specific data to session
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

export default options;