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
      async authorize(credentials) {
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

        const user = await User.findOne({ lineId: credentials.userId });

        if (!user) {
          throw new Error("User not found. Please sign in via LINE first.");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email || null,
          image: user.avatar || null,
          role: user.role,
          lineId: user.lineId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.lineId = user.lineId || null;
        token.name = user.name;
        token.image = user.image || null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.lineId = token.lineId;
        session.user.name = token.name;
        session.user.image = token.image;
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