"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, getSession } from "next-auth/react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      setLoading(true);
      const session = await getSession();
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Failed to fetch user data:", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const signupUser = async ({ name, username, email, password }) => {
    try {
      setLoading(true);
      const { data, status } = await axios.post("/api/auth/signup", { 
        name, 
        username, 
        email, 
        password 
      });
      setLoading(false);

      if (status === 201) {
        toast.success("Signup successful! Please sign in to continue.", {
          autoClose: 3000,
          onClose: () => router.push("/signin"),
        });
      }
    } catch (error) {
      setLoading(false);
      const errorMessage = error.response?.data?.message || "Signup failed";
      toast.error(errorMessage);
    }
  };

  const loginUser = async ({ username, password }) => {
    try {
      setLoading(true);
      const res = await nextAuthSignIn("user-credentials", {
        redirect: false,
        username,
        password,
      });
      setLoading(false);

      if (res?.error) {
        toast.error(res.error);
        return { success: false, message: res.error };
      }

      if (res?.ok) {
        await fetchUser();
        return { success: true };
      }
    } catch (error) {
      setLoading(false);
      toast.error("Signin failed");
      return { success: false, message: "Signin failed" };
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
      setLoading(false);

      if (res?.error) {
        toast.error(res.error);
        return { success: false, message: res.error };
      }

      if (res?.ok) {
        await fetchUser();
        toast.success("Admin login successful!");
        return { success: true };
      }
    } catch (error) {
      setLoading(false);
      toast.error("Admin signin failed");
      return { success: false, message: "Admin signin failed" };
    }
  };

  const logoutUser = async () => {
    try {
      setLoading(true);
      await nextAuthSignOut({ redirect: false });
      setUser(null);
      setLoading(false);
      router.push("/signin");
    } catch (error) {
      setLoading(false);
      toast.error("Logout failed");
    }
  };

  const clearErrors = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        error,
        loading,
        signupUser,
        loginUser,
        adminSignIn,
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