"use client";

import Link from "next/link";
import Image from "next/image";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useState } from "react";

// Game card component for reuse
export default function GameCard({ game, badgeColor, badgeText, borderColor }) {
  if (!game.image_url?.includes("http") || game.game_code == "427_jili") {
    return null;
  }

  return (
    <motion.div
      key={game.game_code}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={` relative ${borderColor}`}
    >
      <Link href={`/torrospins-game/${game?.game_code}`} className="block">
        <div className="relative inline-block aspect-square w-full  ">
          <Image
            src={game.image_url || "/placeholder.svg"}
            alt={game.game_name || "game"}
            className=" object-cover rounded-xl overflow-hidden"
            fill
            sizes="100%"
          />
          <div
            className={`absolute -top-1 right-0 ${badgeColor} text-white px-2 py-0.5 rounded-full text-xs font-semibold`}
          >
            {badgeText}
          </div>
        </div>
        {/* <div className="px-2 pb-2 text-center">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white truncate">
            {game.game_name}
          </h3>
        </div> */}
      </Link>

      {/* <Heart
        onClick={(e) => {
          e.stopPropagation();
        }}
        className={`absolute ${
          badgeText ? "block" : "hidden"
        } -bottom-1 left-1/2 translate-y-1/2 -translate-1/2 text-pink-500 bg-pink-500  text-2xl`}
      /> */}
    </motion.div>
  );
}
