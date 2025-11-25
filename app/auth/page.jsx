"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, ArrowRight, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

export default function AuthPage() {
  const router = useRouter();
  const [isSignIn, setIsSignIn] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isMounted) return;
    setError("");
    setIsLoading(true);

    try {
      // ✅ Generate fingerprint ID
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      const fingerprint_id = result?.visitorId;

      const endpoint = isSignIn ? "/api/user/sign-in" : "/api/user/sign-up";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: phone,
          password,
          invited_by: inviteCode,
          fingerprint_id,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "An error occurred");

      // setCookie("auth_token", data.token);
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // <div className="h-full grow flex items-center justify-center bg-linear-to-br from-orange-500 via-orange-400 to-yellow-400 p-4">
    <motion.div
      // initial={{ opacity: 0, scale: 0.95, y: 30 }}
      // animate={{ opacity: 1, scale: 1, y: 0 }}
      // transition={{ duration: 0.5 }}
      className=" grow h-full w-full max-w-md bg-orange-50 mx-auto dark:bg-slate-900 backdrop-blur-md px-4 py-10"
    >
      {/* Header Tabs */}
      <div className="flex mb-6 border-t border-orange-200">
        {[
          { name: "Register", icon: <UserPlus size={18} /> },
          { name: "Sign In", icon: <LogIn size={18} /> },
        ].map((tab, idx) => (
          <button
            key={tab.name}
            onClick={() => setIsSignIn(idx === 1)}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all duration-300 ${
              (isSignIn && idx === 1) || (!isSignIn && idx === 0)
                ? "border-orange-500 text-orange-600"
                : "border-transparent hover:text-orange-500"
            }`}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-4  bg-red-100 text-red-700 px-4 py-2 text-sm"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full  border border-gray-300 px-4 py-2  focus:border-orange-400 outline-none "
            placeholder="+8801XXXXXXXXX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full  border border-gray-300 px-4 py-2  focus:border-orange-400 outline-none"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 "
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {!isSignIn && (
          <div>
            <label className="block text-sm font-medium  mb-1">
              Invite Code (Optional)
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="w-full  border border-gray-300 px-4 py-2  focus:border-orange-400 outline-none"
              placeholder="Enter invite code"
            />
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={isLoading || !isMounted}
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3  font-semibold shadow-md transition-all disabled:opacity-70"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
                ></path>
              </svg>
              {isSignIn ? "Signing in..." : "Registering..."}
            </span>
          ) : (
            <>
              {isSignIn ? <LogIn size={18} /> : <UserPlus size={18} />}
              {isSignIn ? "Sign In" : "Register"}
              <ArrowRight size={18} />
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
    // </div>
  );
}
