"use client";

import axios from "axios";
import { Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginWith, setLoginWith] = useState("username"); // username or phone

  const router = useRouter();
  const pathname = usePathname();

  const usernameRef = useRef(null);
  const phoneRef = useRef(null);
  const passwordRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const username = usernameRef.current?.value.trim();
    const phone = phoneRef.current?.value.trim();
    const password = passwordRef.current?.value;

    if (loginWith === "username") {
      if (!username) return toast.error("ব্যবহারকারীর নাম অবশ্যই দিতে হবে");
    } else {
      if (!phone || phone.length !== 10)
        return toast.error("সঠিক মোবাইল নম্বর দিন (উদাহরণ: 134837XXXX)");
    }

    if (!password) return toast.error("গোপন নম্বর অবশ্যই দিতে হবে");

    try {
      const res = await axios.post("/api/user/sign-in", {
        loginWith,
        username: loginWith === "username" ? username : null,
        phone_number: loginWith === "phone" ? String(0) + String(phone) : null,
        password,
      });
      if (!res.data.success)
        return toast.error(res.data.message || "লগইন ব্যর্থ");
      toast.success("লগইন সফল হয়েছে!");
      router.push("/");
    } catch (err) {
      console.log(err);
      toast.error("কিছু ভুল হয়েছে, পরে চেষ্টা করুন");
    }
  };

  return (
    <div className="mx-auto md:my-10 w-full md:w-auto">
      <div className="md:block hidden text-center space-y-2 mb-5">
        <h2 className="text-xl font-semibold">লগ ইন করুন</h2>
        <p>আপনার অ্যাকাউন্টে প্রবেশ করতে তথ্য পূরণ করুন</p>
      </div>

      <p className="block md:hidden py-2 text-center bg-black dark:bg-white text-white dark:text-black w-full">
        লগইন করুন
      </p>

      <form
        onSubmit={handleSubmit}
        className="md:w-lg bg-white min-h-dvh dark:bg-stone-900 py-10 pt-5"
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
          <Link
            className="text-orange-700 border-b-2 border-orange-600"
            href="/auth/login"
          >
            লগইন
          </Link>
          <p className="text-dark dark:text-light">|</p>
          <Link href="/auth/register">রেজিস্টার</Link>
        </div>

        <div className="w-[90%] max-w-88 md:w-[70%] mx-auto my-5 space-y-2 md:space-y-2">
          {/* Toggle Login Method */}
          <div className="flex justify-center space-x-2 mb-4">
            <button
              type="button"
              onClick={() => setLoginWith("username")}
              className={`px-4 py-1 rounded-lg font-semibold border ${
                loginWith === "username"
                  ? "bg-amber-500 text-white border-amber-500"
                  : "bg-white dark:bg-stone-800 text-gray-800 dark:text-white border-gray-400"
              }`}
            >
              ব্যবহারকারীর নাম
            </button>
            <button
              type="button"
              onClick={() => setLoginWith("phone")}
              className={`px-4 py-1 rounded-lg font-semibold border ${
                loginWith === "phone"
                  ? "bg-amber-500 text-white border-amber-500"
                  : "bg-white dark:bg-stone-800 text-gray-800 dark:text-white border-gray-400"
              }`}
            >
              ফোন নম্বর
            </button>
          </div>

          {/* Username or Phone Input */}
          {loginWith === "username" ? (
            <div className="flex flex-col">
              <label htmlFor="username" className="relative font-semibold">
                ব্যবহারকারীর নাম <span className="text-red-600">*</span>
              </label>
              <input
                ref={usernameRef}
                id="username"
                type="text"
                placeholder="এখানে পূরণ করুন"
                className="px-2 py-1 border outline-amber-400 border-gray-800 rounded-lg text-gray-800 dark:text-white dark:border-white text-lg"
              />
              <span className="text-sm text-gray-500 mt-1">
                এটি একটি বাধ্যতামূলক ক্ষেত্র
              </span>
            </div>
          ) : (
            <div className="flex flex-col">
              <label htmlFor="phoneNumber" className="relative font-semibold">
                মোবাইল নম্বর <span className="text-red-600">*</span>
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
                  placeholder="131234XXXX"
                  className="grow px-2 py-1 w-full border outline-amber-400 border-gray-800 rounded-lg text-gray-800 dark:text-white dark:border-white text-lg"
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </div>
              <span className="text-sm text-gray-500 mt-1">
                এটি একটি বাধ্যতামূলক ক্ষেত্র
              </span>
            </div>
          )}

          {/* Password */}
          <div className="flex flex-col relative">
            <label htmlFor="password" className="relative font-semibold">
              গোপন নম্বর <span className="text-red-600">*</span>
            </label>
            <div className="relative w-full">
              <input
                ref={passwordRef}
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="এখানে পূরণ করুন"
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
            <span className="text-sm text-gray-500 mt-1">
              এটি একটি বাধ্যতামূলক ক্ষেত্র
            </span>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full mt-4 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition"
          >
            লগইন
          </button>

          {/* Links */}
          <div className="text-center text-sm mt-4 space-y-2">
            <p>
              কোনো একাউন্ট এখনও নেই?{" "}
              <Link
                href="/auth/register"
                className="text-amber-500 font-semibold"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
