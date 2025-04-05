import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/backend/models/User";
import mongodbConnect from "@/backend/lib/mongodb";
import bcrypt from "bcryptjs";

export const options = {
  providers: [
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
        try {
          await mongodbConnect();

          if (!credentials?.userId) {
            throw new Error("LINE User ID is required");
          }

          // Find or create the user
          let user = await User.findOne({ lineId: credentials.userId });

          if (!user) {
            // Create new user if not found
            user = await User.create({
              lineId: credentials.userId,
              name: credentials.displayName || `LINE User ${credentials.userId.slice(0, 4)}`,
              avatar: credentials.pictureUrl || null,
              role: "user",
              isVerified: true,
              lastLogin: new Date(),
            });
          } else {
            // Update last login time and picture if available
            user.lastLogin = new Date();
            if (!user.avatar && credentials.pictureUrl) {
              user.avatar = credentials.pictureUrl;
            }
            await user.save();
          }

          return {
            id: user._id.toString(),
            name: user.name,
            image: user.avatar,
            lineId: user.lineId,
            role: user.role,
            provider: "line",
          };
        } catch (error) {
          console.error("LINE authorize error:", error);
          throw new Error("Authentication failed");
        }
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
          image: user.avatar,
          provider: "credentials",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.lineId = user.lineId;
        token.provider = user.provider;
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
          provider: token.provider,
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
    maxAge: 30 * 24 * 60 * 60,
  },
};

export default options;