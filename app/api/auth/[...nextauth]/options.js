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

    // LINE OAuth Provider - Updated for 2025
    CredentialsProvider({
      id: "line",
      name: "LINE",
      credentials: {
        idToken: { label: "ID Token", type: "text" },
        accessToken: { label: "Access Token", type: "text" },
        profile: { label: "Profile", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.profile) {
            throw new Error("LINE profile data is required");
          }

          // Parse the profile data
          const profileData = JSON.parse(credentials.profile);
          const { userId, displayName, pictureUrl } = profileData;

          if (!userId) {
            throw new Error("LINE user ID is missing");
          }

          // Connect to database
          await mongodbConnect();

          // Find or create user
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
            // Update last login
            user.lastLogin = new Date();
            await user.save();
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email || null,
            image: user.avatar || pictureUrl,
            role: user.role,
            lineId: userId,
          };
        } catch (error) {
          console.error("LINE authorization error:", error);
          throw new Error(`LINE login failed: ${error.message}`);
        }
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
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
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