import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/backend/models/User";
import mongodbConnect from "@/backend/lib/mongodb";
import bcrypt from "bcryptjs";
import LineProvider from "next-auth/providers/line";
import liff from '@line/liff';

export const options = {
  providers: [
    // LINE Credentials Provider Integration
    CredentialsProvider({
      id: "line",
      name: "LINE",
      type: "oauth",
      version: "2.1",
      clientId: process.env.LINE_CHANNEL_ID, // Your LINE Channel ID
      clientSecret: process.env.LINE_CHANNEL_SECRET, // Your LINE Channel Secret
      authorization: {
        url: "https://access.line.me/oauth2/v2.1/authorize",
        params: {
          response_type: "code",
          scope: "profile openid",
          nonce: "unique_nonce",
        },
      },
      token: "https://api.line.me/oauth2/v2.1/token",
      userinfo: "https://api.line.me/v2/profile",
      async profile(profile) {
        return {
          id: profile.userId,
          name: profile.displayName,
          email: null, // Email is not provided in LINE profile by default
          image: profile.pictureUrl,
        };
      },
    }),

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

        if (!user) throw new Error("Admin user not found");

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) throw new Error("Invalid password");

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
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Handling JWT for LINE login
      if (account?.provider === "line" && user) {
        token.provider = account.provider;
        token.lineId = user.id;
      }
      // Handling JWT for Admin login
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id,
          role: token.role,
          lineId: token.lineId,
          name: token.name,
          image: token.image,
          provider: token.provider,
        };
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // LINE sign-in logic
      if (account.provider === "line") {
        try {
          await mongodbConnect();

          let existingUser = await User.findOne({ lineId: user.id });

          if (!existingUser) {
            existingUser = await User.create({
              lineId: user.id,
              name: profile.displayName || `LINE User ${user.id.slice(0, 4)}`,
              avatar: profile.pictureUrl || null,
              role: "user",
              email: profile.email || null,
              isVerified: true,
              lastLogin: new Date(),
            });
          } else {
            existingUser.lastLogin = new Date();
            await existingUser.save();
          }

          user.id = existingUser._id.toString();
          user.role = existingUser.role;
          user.name = existingUser.name;
          user.image = existingUser.avatar;
        } catch (error) {
          console.error("LINE signIn error:", error);
          return false;
        }
      }
      return true;
    },
  },
  pages: {
    signIn: process.env.NEXT_PUBLIC_LIFF_URL || "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
};

export default options;
