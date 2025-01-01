// AuthContext.js

"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { signIn as nextAuthSignIn, getSession } from "next-auth/react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores user data
  const [role, setRole] = useState("user"); // Default role to "user"
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch the current session and user data when the component mounts
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const session = await getSession();
        if (session) {
          setUser(session.user);
          setRole(session.user.role || "user"); // Use role from session if available
        } else {
          setUser(null);
          setRole("user");
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUser();
  }, []);

  const signupUser = async ({ name, username, email, password }) => {
    try {
      setLoading(true);
      const { data, status } = await axios.post("/api/auth/signup", { name, username, email, password });
      setLoading(false);

      if (status === 201) {
        toast.success("Signup successful! Please sign in to continue.", {
          autoClose: 3000,
          onClose: () => router.push("/signin"),
        });
        setUser(data.user); // Set user state after signup
      }
    } catch (error) {
      setLoading(false);
      const errorMessage = error.response?.data?.message || "Signup failed";
      toast.error(errorMessage);
    }
  };

  const loginUser = async ({ username, email, password }) => {
    try {
      setLoading(true);
      const res = await nextAuthSignIn("credentials", {
        redirect: false,
        username,
        email,
        password,
      });
      setLoading(false);

      if (res.error) {
        if (res.error.includes("verify your email")) {
          router.push("/resend-verification");
        }
        toast.error(res.error);
        return { success: false, message: res.error };
      } else if (res.ok) {
        await fetchUser(); // Update user and role after successful login
        return { success: true };
      }
    } catch (error) {
      setLoading(false);
      const errorMessage = error.response?.data?.message || "Signin failed";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Adjusted adminSignIn function to work with options.js credentials for admin
  const adminSignIn = async () => {
    try {
      setLoading(true);
      const res = await nextAuthSignIn("credentials", {
        redirect: false,
        username: "Admin", // Must match the hardcoded username in options.js
        password: "admin123", // Must match the hardcoded password in options.js
      });
      setLoading(false);

      if (res.error) {
        toast.error(res.error);
        return { success: false, message: res.error };
      }

      if (res.ok) {
        toast.success("Admin signin successful!", {
          autoClose: 1000,
          onClose: async () => {
            await fetchUser(); // Update user and role after successful admin login
            window.location.reload();
          },
        });
        return { success: true };
      }
    } catch (error) {
      setLoading(false);
      const errorMessage = error.response?.data?.message || "Signin failed";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const clearErrors = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        error,
        loading,
        signupUser,
        loginUser,
        adminSignIn,
        setUser,
        clearErrors,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
