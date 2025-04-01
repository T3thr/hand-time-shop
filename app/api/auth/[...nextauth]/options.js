import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import LineProvider from "next-auth/providers/line";
import liff from '@line/liff';
import User from "@/backend/models/User";
import LoginActivity from "@/backend/models/LoginActivity";
import mongodbConnect from "@/backend/lib/mongodb";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export const authOptions = {
  providers: [
    // Admin Credentials Provider
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Admin" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        await mongodbConnect();

        const adminId = process.env.ADMIN_ID || new mongoose.Types.ObjectId();
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (
          credentials.username === "Admin" &&
          credentials.password === adminPassword
        ) {
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

        throw new Error("Invalid admin credentials");
      },
    }),

    // LINE Provider (OAuth 2.1, 2025 compatible) with LIFF integration
    {
      id: 'line',
      name: 'LINE',
      type: 'oauth',
      version: '2.1',
      clientId: process.env.LINE_CHANNEL_ID,
      clientSecret: process.env.LINE_CHANNEL_SECRET,
      authorization: {
        url: "https://access.line.me/oauth2/v2.1/authorize",
        params: {
          scope: "profile openid",
          response_type: "code",
          nonce: "unique_nonce",
        },
      },
      token: "https://api.line.me/oauth2/v2.1/token",
      userinfo: "https://api.line.me/v2/profile",
      async profile(profile) {
        return {
          id: profile.userId,
          name: profile.displayName,
          email: null, // LINE doesn't provide email by default
          image: profile.pictureUrl,
        };
      },
    }
  ],
  callbacks: {
    async signIn({ user, account }) {
      await mongodbConnect();

      if (account.provider === "line") {
        let dbUser = await User.findOne({ lineId: user.id });
        if (!dbUser) {
          dbUser = await User.create({
            lineId: user.id,
            name: user.name,
            email: user.email,
            avatar: user.image,
            role: "user",
          });
        } else {
          dbUser.lastLogin = new Date();
          await dbUser.save();
        }

        await LoginActivity.create({
          userId: dbUser._id,
          name: dbUser.name,
          email: dbUser.email,
          username: "LINE User",
          role: "user",
          lastLogin: new Date(),
        });

        user.id = dbUser._id;
        user.role = dbUser.role;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.image = token.image;
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
  },
  events: {
    async signIn({ user, account, profile }) {
      // Additional LIFF login handling if needed
    },
  },
  // LIFF specific initialization
  adapter: {
    async login() {
      await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID });
      if (!liff.isLoggedIn()) {
        liff.login();
      }
    },
    async logout() {
      await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID });
      if (liff.isLoggedIn()) {
        liff.logout();
      }
    }
  }
};

export default NextAuth(authOptions);