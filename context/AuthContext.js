"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, useSession } from "next-auth/react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { data: session, status, update } = useSession();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setUser(session.user);
    } else if (status === "unauthenticated") {
      setUser(null);
    }
  }, [session, status]);

  const signupUser = async ({ name, username, email, password }) => {
    try {
      setLoading(true);
      const { data, status: resStatus } = await axios.post("/api/auth/signup", {
        name,
        username,
        email,
        password,
      });
      if (resStatus === 201) {
        toast.success("Signup successful! Please sign in to continue.", {
          autoClose: 3000,
          onClose: () => router.push("/auth/signin"),
        });
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Signup failed";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const adminSignIn = async ({ username, password }) => {
    try {
      setLoading(true);
      const res = await nextAuthSignIn("admin-credentials", {
        redirect: false,
        username,
        password,
      });
      
      if (res?.error) {
        toast.error(res.error);
        return { success: false, message: res.error };
      }
      
      if (res?.ok) {
        await update();
        toast.success("Admin login successful!");
        return { success: true };
      }
      
      return { success: false, message: "Unknown error occurred" };
    } catch (error) {
      toast.error("Signin failed");
      return { success: false, message: "Signin failed" };
    } finally {
      setLoading(false);
    }
  };

  const lineSignIn = useCallback(async () => {
    try {
      setLoading(true);
      const res = await nextAuthSignIn("line", { redirect: false });
      
      if (res?.error) {
        toast.error(res.error);
        return { success: false, message: res.error };
      }
      
      if (res?.ok) {
        await update();
        toast.success("LINE login successful!");
        return { success: true };
      }
      
      return { success: false, message: "Unknown error occurred" };
    } catch (error) {
      console.error("LINE signin error:", error);
      toast.error("LINE signin failed");
      return { success: false, message: error.message || "LINE signin failed" };
    } finally {
      setLoading(false);
    }
  }, [update]);

  const logoutUser = async () => {
    try {
      setLoading(true);
      await nextAuthSignOut({ redirect: false });
      setUser(null);
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      toast.error("Logout failed");
    } finally {
      setLoading(false);
    }
  };

  const clearErrors = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        error,
        loading,
        status,
        signupUser,
        adminSignIn,
        lineSignIn,
        logoutUser,
        setUser,
        clearErrors,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;