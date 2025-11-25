"use client";

import { CircleQuestionMark, Eye } from "lucide-react";
import Image from "next/image";
import React, { useState, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showUsernameTooltip, setShowUsernameTooltip] = useState(false);
  const [showPasswordTooltip, setShowPasswordTooltip] = useState(false);

  const usernameRef = useRef(null);
  const phoneRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const referralRef = useRef(null);

  const pathname = usePathname();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const username = usernameRef.current?.value.trim();
    const phone = phoneRef.current?.value.trim();
    const password = passwordRef.current?.value;
    const confirmPassword = confirmPasswordRef.current?.value;
    const referral = referralRef.current?.value.trim();

    if (!username || username.length < 6 || username.length > 11) {
      return toast.error("ব্যবহারকারীর নাম ৬-১১ অক্ষর হতে হবে");
    }
    if (!phone || phone.length !== 10) {
      return toast.error("সঠিক মোবাইল নম্বর দিন (উদাহরণ: 1312XXXXXX)");
    }
    if (!password || password.length < 6 || password.length > 14) {
      return toast.error("পাসওয়ার্ড ৬-১৪ অক্ষর হতে হবে");
    }
    if (password !== confirmPassword) {
      return toast.error("পাসওয়ার্ড মিলছে না");
    }

    try {
      // ✅ Generate fingerprint ID
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      const fingerprint_id = result?.visitorId;

      const res = await fetch("/api/user/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          phone_number: phone,
          password,
          invited_by: referral,
          fingerprint_id,
        }),
      });
      const data = await res.json();
      if (!data.success) return toast.error(data.message || "নিবন্ধন ব্যর্থ");
      toast.success("নিবন্ধন সফল হয়েছে!");
      router.push("/");
    } catch (err) {
      toast.error("কিছু ভুল হয়েছে, পরে চেষ্টা করুন");
    }
  };

  return (
    <div className="mx-auto md:my-10 w-full md:w-auto">
      <div className="md:block hidden text-center space-y-2 mb-5">
        <h2 className="text-xl font-semibold">একাউন্ট তৈরি করুন</h2>
        <p>
          আসুন আপনাকে No.1 ক্যাসিনো এবং বেটিং প্ল্যাটফর্মে নিবন্ধন করিয়ে দিই
        </p>
      </div>

      <p className="block md:hidden py-2 text-center bg-black dark:bg-white text-white dark:text-black w-full">
        নিবন্ধন করুন
      </p>

      <form
        onSubmit={handleSubmit}
        className="md:w-lg bg-white min-h-dvh dark:bg-stone-900 pb-10"
      >
        {/* <div className="relative aspect-693/200">
          <Image
            src="/banners/register_banner.jpg"
            alt="banner"
            fill
            className="object-cover"
          />
        </div> */}

        <div className=" text-lg font-semibold flex justify-center items-center mt-2 text-blue-600 space-x-2 ">
          <Link href="/auth/login">লগইন</Link>
          <p className="text-dark dark:text-light">|</p>
          <Link
            className="text-orange-700 border-b-2 border-orange-600"
            href="/auth/register"
          >
            রেজিস্টার
          </Link>
        </div>

        <div className="w-[90%] max-w-88 md:w-[70%] mx-auto my-5 space-y-2 md:space-y-4">
          {/* Username */}
          <div className="flex flex-col relative">
            <label htmlFor="username" className="relative">
              ব্যবহারকারীর নাম{" "}
              <span className="text-red-600 font-semibold text-lg">*</span>
              <CircleQuestionMark
                className="absolute text-lg right-0 top-0 cursor-pointer"
                onClick={() => setShowUsernameTooltip(!showUsernameTooltip)}
              />
            </label>
            {showUsernameTooltip && (
              <span className="bg-black/70 dark:bg-white/70 py-0.5 px-2 rounded-sm text-sm text-white dark:text-black absolute right-6 top-0 z-10">
                কমপক্ষে ৬ থেকে ১১টি অক্ষর থাকতে হবে
              </span>
            )}
            <input
              ref={usernameRef}
              id="username"
              type="text"
              placeholder="এখানে ইউজারনেম পূরণ করুন"
              className="px-2 py-1 border outline-amber-400 border-gray-800 rounded-lg text-gray-800 dark:text-white dark:border-white text-lg"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col relative">
            <label htmlFor="phoneNumber" className="relative">
              মোবাইল নম্বর{" "}
              <span className="text-red-600 font-semibold text-lg">*</span>
            </label>
            <div className="flex space-x-2">
              <input
                id="countryCode"
                type="text"
                value="+880"
                className="px-2 border w-16 outline-amber-400 border-gray-800 rounded-lg text-gray-800 dark:text-white dark:border-white text-lg"
                readOnly
              />
              <input
                ref={phoneRef}
                id="phoneNumber"
                type="number"
                placeholder="13637XXXX"
                className="grow px-2 py-1 w-full border outline-amber-400 border-gray-800 rounded-lg text-gray-800 dark:text-white dark:border-white text-lg"
                onWheel={(e) => e.currentTarget.blur()}
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col relative">
            <label htmlFor="password" className="relative">
              পাসওয়ার্ড{" "}
              <span className="text-red-600 font-semibold text-lg">*</span>
              <CircleQuestionMark
                className="absolute text-lg right-0 top-0 cursor-pointer"
                onClick={() => setShowPasswordTooltip(!showPasswordTooltip)}
              />
            </label>
            {showPasswordTooltip && (
              <span className="bg-black/70 dark:bg-white/70 py-0.5 px-2 rounded-sm text-sm text-white dark:text-black absolute right-6 top-0 z-10">
                কমপক্ষে ৬ থেকে ১৪টি অক্ষর থাকতে হবে
              </span>
            )}
            <div className="relative w-full">
              <input
                ref={passwordRef}
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="এখানে পাসওয়ার্ড পূরণ করুন"
                className="px-2 py-1 border w-full outline-amber-400 border-gray-800 rounded-lg text-gray-800 dark:text-white dark:border-white text-lg"
              />
              <Eye
                onClick={() => {
                  setShowPassword(!showPassword);
                  passwordRef.current?.focus();
                }}
                className="absolute cursor-pointer right-1 text-2xl bottom-1/2 translate-y-1/2"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col relative">
            <label htmlFor="confirmPassword" className="relative">
              পাসওয়ার্ড নিশ্চিত করুন{" "}
              <span className="text-red-600 font-semibold text-lg">*</span>
            </label>
            <div className="relative w-full">
              <input
                ref={confirmPasswordRef}
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="এখানে পাসওয়ার্ড নিশ্চিত করুন"
                className="px-2 py-1 border w-full outline-amber-400 border-gray-800 rounded-lg text-gray-800 dark:text-white dark:border-white text-lg"
              />
              <Eye
                onClick={() => {
                  setShowConfirmPassword(!showConfirmPassword);
                  confirmPasswordRef.current?.focus();
                }}
                className="absolute cursor-pointer right-1 text-2xl bottom-1/2 translate-y-1/2"
              />
            </div>
          </div>

          {/* Referral */}
          <div className="flex flex-col relative">
            <label htmlFor="referral" className="relative">
              রেফারেল কোড
            </label>
            <div className="relative w-full">
              <input
                ref={referralRef}
                id="referral"
                type="text"
                placeholder="( ঐচ্ছিক )"
                className="px-2 py-1 border w-full outline-amber-400 border-gray-800 rounded-lg text-gray-800 dark:text-white dark:border-white text-lg"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-4 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition"
          >
            নিবন্ধন
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
