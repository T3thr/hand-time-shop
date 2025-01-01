import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import User from "@/backend/models/User";
import GoogleUser from "@/backend/models/GoogleUser";
import mongodbConnect from "@/backend/lib/mongodb";
import bcrypt from "bcryptjs";
import LoginActivity from "@/backend/models/LoginActivity";
import mongoose from "mongoose";

export const options = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "Enter your username" },
                email: { label: "Email", type: "text", placeholder: "Enter your email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                await mongodbConnect();

                // Check for email sign-in
                if (credentials.email) {
                    const user = await User.findOne({ email: credentials.email }).select("+password");
                    if (!user) throw new Error("No user found with this email");

                    if (!user.isVerified) {
                        throw new Error("Please verify your email before signing in");
                    }

                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                    if (!isPasswordValid) throw new Error("Incorrect password");

                    // Update lastLogin field
                    user.lastLogin = new Date();
                    await user.save();

                    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                    await LoginActivity.create({
                        userId: user._id,
                        name: user.name,
                        email: user.email,
                        username: user.username,
                        ipAddress,
                        lastLogin: user.lastLogin // Use updated lastLogin time
                    });

                    return { id: user._id, role: user.role, ...user.toObject() };
                }

                // Check for username sign-in
                const user = await User.findOne({ username: credentials.username }).select("+password");
                if (user) {
                    if (!user.isVerified) {
                        throw new Error("Please verify your email before signing in");
                    }
                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                    if (!isPasswordValid) throw new Error("Incorrect password");

                    // Update lastLogin field
                    user.lastLogin = new Date();
                    await user.save();

                    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                    await LoginActivity.create({
                        userId: user._id,
                        name: user.name,
                        email: user.email,
                        username: user.username,
                        ipAddress,
                        lastLogin: user.lastLogin // Use updated lastLogin time
                    });

                    return { id: user._id, role: user.role, ...user.toObject() };
                }

                // Admin credentials check
                const adminId = new mongoose.Types.ObjectId(); // Use a predefined admin ID from environment variable
                const adminPassword = process.env.ADMIN_PASSWORD; 

                if (credentials.username === 'Admin' && credentials.password === adminPassword) {
                    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

                    await LoginActivity.create({
                        userId: adminId,
                        email: 'admin@pathy.com',
                        name: 'admin',
                        username: 'Admin',
                        ipAddress: ipAddress,
                        role: 'admin',
                        lastLogin: new Date() // Update lastLogin time
                    });

                    return { id: adminId, name: 'admin', username: 'Admin', email: 'admin@pathy.com', role: 'admin' };
                }

                throw new Error("No user found with this username");
            },
        }),

        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                },
            },
            async profile(profile, req) { // Add req to the parameters to access the request object
                await mongodbConnect();
                const existingUser = await GoogleUser.findOne({ email: profile.email });
                

                if (existingUser) {
                    existingUser.lastLogin = new Date();
                    await existingUser.save();
                } else {
                    await GoogleUser.create({
                        name: profile.name,
                        email: profile.email,
                        avatar: { url: profile.picture },
                        role : 'user',
                        lastLogin: new Date(),
                    });
                }

                // Log the login activity for Google sign-in
                await LoginActivity.create({
                    userId: existingUser ? existingUser._id : mongoose.Types.ObjectId(), 
                    email: profile.email,
                    name: profile.name,
                    username: 'google user',
                    role : 'user',
                    lastLogin: new Date(),
                });

                return { id: profile.sub, name: profile.name, email: profile.email, image: profile.picture, role: existingUser?.role || 'user' };
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account.provider === 'google') {
                user.role = 'user';
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                token.role = user.role;
                token.avatar = user.avatar;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id;
            session.user.name = token.name;
            session.user.email = token.email;
            session.user.role = token.role;
            session.user.avatar = token.avatar;
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: true,
};

export default options;
