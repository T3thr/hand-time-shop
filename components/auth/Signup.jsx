"use client";

import Link from "next/link";
import React, { useState, useContext, useEffect } from "react";
import AuthContext from "@/context/AuthContext";
import { toast } from "react-toastify";

const Signup = () => {
  const { error, signupUser, clearErrors } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearErrors();
    }
  }, [error, clearErrors]);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    // Warn if uppercase letters are found
    if (/[A-Z]/.test(value)) {
      toast.warn("Please use lowercase letters for your email.");
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
    signupUser({ name, username, email, password });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-var-background transition-all duration-500 ease-in-out">
      <div
        style={{ maxWidth: "480px" }}
        className="mt-10 mb-20 p-4 md:p-7 bg-white dark:bg-gray-600 rounded-lg shadow-lg dark:shadow-light"
      >
        <form onSubmit={submitHandler}>
          <h2 className="mb-5 text-2xl font-semibold text-center text-var-foreground">
            Create Account
          </h2>

          <div className="mb-4">
            <label className="block mb-1 text-var-muted">Name</label>
            <input
              className="appearance-none border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded-md py-2 px-3 hover:border-gray-400 focus:outline-none focus:border-gray-400 w-full text-var-foreground dark:text-var-foreground"
              type="text"
              placeholder="Type your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-var-muted">Username</label>
            <input
              className="appearance-none border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded-md py-2 px-3 hover:border-gray-400 focus:outline-none focus:border-gray-400 w-full text-var-foreground dark:text-var-foreground"
              type="text"
              placeholder="Type your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-var-muted">Email</label>
            <input
              className="appearance-none border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded-md py-2 px-3 hover:border-gray-400 focus:outline-none focus:border-gray-400 w-full text-var-foreground dark:text-var-foreground"
              type="email"
              placeholder="Type your email"
              value={email}
              onChange={handleEmailChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-var-muted">Password</label>
            <input
              className="appearance-none border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded-md py-2 px-3 hover:border-gray-400 focus:outline-none focus:border-gray-400 w-full text-var-foreground dark:text-var-foreground"
              type="password"
              placeholder="Type your password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="my-2 px-4 py-2 text-center w-full inline-block text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition duration-200"
          >
            Sign up
          </button>

          <hr className="mt-4" />

          <p className="text-center mt-5 text-var-muted">
            Already have an account?{" "}
            <Link href="/signin" className="text-blue-500 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
