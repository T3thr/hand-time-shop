// context/AuthContext.js
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
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setLoading(false);
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
        password,
      });
      if (status === 201) {
        toast.success("Signup successful! Please sign in to continue.", {
          autoClose: 3000,
          onClose: () => router.push("/signin"),
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Signup failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async ({ username, password }) => {
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
        await fetchUser();
        toast.success("Login successful!");
        return { success: true };
      }
    } catch (error) {
      toast.error("Signin failed");
      return { success: false, message: "Signin failed" };
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
        const errorMsg =
          res.error === "CredentialsSignin"
            ? "Invalid username/email or password"
            : res.error;
        toast.error(errorMsg);
        return { success: false, message: errorMsg };
      }

      if (res?.ok) {
        await fetchUser();
        return { success: true };
      }
    } catch (error) {
      toast.error("Admin signin failed");
      return { success: false, message: "Admin signin failed" };
    } finally {
      setLoading(false);
    }
  };

  const lineSignIn = async ({ userId, displayName, pictureUrl }) => {
    try {
      setLoading(true);

      // Register the LINE user if they don't exist
      const registerResponse = await axios.post("/api/auth/line/register", {
        userId,
        displayName,
        pictureUrl,
      });

      if (registerResponse.status !== 201 && registerResponse.status !== 200) {
        throw new Error("Failed to register LINE user");
      }

      // Sign in with LINE credentials
      const res = await nextAuthSignIn("line", {
        redirect: false,
        userId,
        displayName,
        pictureUrl,
      });

      if (res?.error) {
        toast.error(res.error);
        return { success: false, message: res.error };
      }

      if (res?.ok) {
        await fetchUser();
        toast.success("LINE login successful!");
        return { success: true };
      }
    } catch (error) {
      toast.error("LINE signin failed");
      return { success: false, message: "LINE signin failed" };
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    try {
      setLoading(true);
      await nextAuthSignOut({ redirect: false });
      setUser(null);
      toast.success("Logged out successfully");
      router.push("/signin");
    } catch (error) {
      toast.error("Logout failed");
    } finally {
      setLoading(false);
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