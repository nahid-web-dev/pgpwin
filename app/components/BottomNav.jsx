"use client";

import {
  Home,
  Wallet,
  User,
  Cherry,
  Pizza,
  Drum,
  MessageCircleCode,
} from "lucide-react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";

export default function BottomNav() {
  const pathname = usePathname();

  //   const [user,setUser] = useState(null)
  //   const [fetchingUser,setFetchingUser]=useState(true)

  //   useEffect(() => {
  // const fetchUser = async() => {
  //   try {
  //     const profileRes = await axios.get("/api/user/profile");
  //     if(profileRes.data.success){
  //       setUser(profileRes.data.user)
  //     }
  //     setFetchingUser(false)
  //   } catch (error) {
  //     console.log(error?.message)
  //     setFetchingUser(false)
  //   }

  // }
  // fetchUser()
  //   },[])

  const navItems = [
    {
      name: "হোম",
      href: "/",
      icon: Home,
    },
    {
      name: "রেফারেল",
      href: "/referral",
      icon: Cherry,
    },
    {
      name: "ওয়ালেট",
      href: "/wallet",
      icon: Wallet,
    },
    {
      name: "হেল্প",
      href: "/support",
      icon: MessageCircleCode,
    },
    {
      name: "অ্যাকাউন্ট",
      href: "/account",
      icon: User,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md bg-light dark:bg-dark dark:text-white border-t border-gray-200 dark:border-gray-800 shadow-lg opacity-90 ">
      <div className="flex justify-around items-center h-16 px-4">
        {" "}
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex flex-col items-center justify-center w-full h-full"
            >
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`flex flex-col items-center justify-center ${
                  isActive
                    ? "text-orange-500"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <item.icon size={20} />
                <span className="text-xs mt-1">{item.name}</span>

                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-orange-500"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
