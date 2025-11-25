"use client";

import {
  Sun,
  Moon,
  User,
  VolumeX,
  Volume,
  Volume1Icon,
  Volume2Icon,
  Download,
  X,
  TextAlignJustify,
  Bell,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const [theme, setTheme] = useState();
  const [showDownApp, setShowDownApp] = useState(false);
  const [showBox, setShowBox] = useState(false);

  const pathName = usePathname();

  const toggleTheme = () => {
    if (theme === "light") {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      setTheme("light");
    }
    console.log(document.documentElement.className);
  };

  useEffect(() => {
    let deviceTheme;
    if (typeof window != "undefined") {
      // deviceTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      //   ? "light"
      //   : "dark";
      // setTheme(deviceTheme);
      const userAgent = navigator.userAgent;
      const isFromApp = userAgent.split(" ").includes("req_from_app");
      setShowDownApp(!isFromApp);
      if (pathName == "/") {
        setShowBox(!isFromApp);
      }
    }

    document.documentElement.classList.add("dark");
    setTheme("dark");

    // if (deviceTheme === "light") {
    //   document.documentElement.classList.add("dark");
    //   setTheme("dark");
    // } else {
    //   document.documentElement.classList.remove("dark");
    //   setTheme("light");
    // }
  }, []);

  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioRef = useRef(null);

  const toggleAudioPlay = () => {
    const audio = audioRef?.current;
    if (!audio) {
      return toast.error("Something went wrong");
    }
    audioRef.current.volume = 0.5;
    if (audio.paused) {
      audio.play().catch(() => toast.error("Failed to play audio"));
    } else {
      audio.pause();
    }
    setSoundEnabled(!soundEnabled);
  };

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < scrollY) {
        setPlaceNav(true);
      }
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    // Initial scroll position
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    // <nav
    //   className={`fixed h-14 left-0 backdrop-blur-md w-full ${
    //     scrollY <= 10 ? "top-0" : "-top-full"
    //   } transition-all ease-in-out duration-1000  z-50 border-b border-gray-200 dark:border-slate-400`}
    // >
    <>
      <nav
        className={` h-14 sm:h-16 lg:h-20 w-full transition-all z-30 border-b border-gray-200 dark:border-slate-400  `}
      >
        <audio src="/music.mp3" className="hidden" ref={audioRef} loop={true} />
        <div className=" mx-auto px-2 h-full">
          <div className="flex items-center justify-between gap-x-4 h-full">
            {/* <TextAlignJustify className=" text-3xl text-stone-800 md:hidden " /> */}

            {/* Logo on the left */}
            {/* <Link href="/" className="relative h-full py-1">
              <div className="relative h-full aspect-33/7! md:w-40 lg:w-60">
                <Image
                  src="/logo.gif"
                  alt="logo"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </Link> */}

            <h2 className="text-2xl text-dark dark:text-light">
              <span className="text-orange-500 tracking-wider ">PGP</span>
              <span>Win</span>
            </h2>

            {/* Theme toggle and user icon on the right */}
            <div className="flex items-center space-x-4 md:space-x-6">
              <Link
                href="/auth/login"
                className=" hidden md:block text-sm font-semibold tracking-tight px-3 py-2.5 text-foreground bg-yellow-400 rounded-lg "
              >
                লগইন করুন
              </Link>
              <Link
                href="/auth/register"
                className=" hidden md:block text-sm font-semibold tracking-tight px-3 py-2.5 text-background bg-blue-500 rounded-lg "
              >
                এখনই যোগ দিন
              </Link>

              {showDownApp && (
                <button
                  onClick={() => setShowBox(true)}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Download PGPWin APK"
                >
                  <Download />
                </button>
              )}

              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label={
                  theme === "light"
                    ? "Switch to dark mode"
                    : "Switch to light mode"
                }
              >
                {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              {/* <button
                onClick={toggleAudioPlay}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {soundEnabled ? (
                  <Volume2Icon size={20} />
                ) : (
                  <VolumeX size={20} />
                )}
              </button> */}
              <Link
                href="/notifications"
                className=" block p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Bell size={20} />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Download modal */}
      {showBox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowBox(false)}
        >
          <div
            className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowBox(false)}
              className="absolute right-3 top-3 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            <div className="p-6 text-center">
              <div className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-linear-to-br from-orange-400 to-yellow-300 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2a2 2 0 0 0-2 2v6H8l4 4 4-4h-2V4a2 2 0 0 0-2-2z" />
                  <path d="M6 18v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2H6z" />
                </svg>
              </div>

              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                Get the PGPWin App
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Download the PGPWin APK to get the best experience — faster
                loading and native features.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
                <a
                  href="/pgpwin.apk"
                  download
                  className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition"
                  onClick={() => setShowBox(false)}
                >
                  Download APK
                </a>

                <button
                  onClick={() => setShowBox(false)}
                  className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
