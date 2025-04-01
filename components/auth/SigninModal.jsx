'use client'
import React, { useState, useCallback, useEffect } from "react";
import { LockKeyhole, User as UserIcon, X } from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react"; // This is for session management

const SigninModal = ({ isOpen, onClose, adminSignIn }) => {
  const { data: session, status } = useSession(); // Check session status and session data
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Close modal if session exists
  useEffect(() => {
    if (session) {
      onClose(); // Close modal if user is already logged in
    }
  }, [session, onClose]);

  const handleAdminLogin = useCallback(async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await adminSignIn({ username, password });
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  }, [username, password, adminSignIn]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", bounce: 0.25 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
          >
            <div 
              className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-fast"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Admin Sign In
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Enter your admin credentials
                  </p>
                </div>

                <form onSubmit={handleAdminLogin}>
                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        className="input-field"
                        type="text"
                        placeholder="Enter admin username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockKeyhole className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        className="input-field"
                        type="password"
                        placeholder="Enter admin password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <button
                    className={`w-full btn-primary py-2.5 rounded-md flex justify-center items-center ${
                      isLoading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default React.memo(SigninModal);
