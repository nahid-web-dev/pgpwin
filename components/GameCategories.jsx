"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

// const slides = [
//   { image: "", name: "CASINO GAMES" },
//   { image: slide02, name: "JACKPOTS" },
//   { image: slide03, name: "SLOT GAMES" },
//   { image: slide04, name: "EXCLUSIVES" },
//   { image: slide05, name: "NEW GAMES" },
// ];

const GameCategories = ({ slides = [] }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex gap-5 overflow-x-auto scrollbar-hide px-3 py-2 my-10"
    >
      {slides?.length > 0 &&
        slides?.map((slide, index) => {
          return slide.name ? (
            <Link
              key={index}
              href={`/torrospins-provider/${slide.display_name}`}
              className=" relative w-28 aspect-video bg-black/50 dark:bg-transparent border-light dark:border-yellow-400 border-2 rounded-lg shrink-0 overflow-hidden"
            >
              <Image
                // src={`https://sc4-admin.dreamgates.net/img/${slide?.provider_id}.png`}
                src={slide.icons.icon}
                alt={index}
                className="p-2 object-contain z-10 "
                fill
              />
              {/* <h2 className="absolute w-full bottom-0 left-0 h-8 pb-1 mt-1 text-sm text-light dark:text-yellow-600 flex justify-center items-center flex-wrap px-1 line-clamp-1 ">
                {slide.display_name}
              </h2> */}
            </Link>
          ) : null;
        })}
    </motion.div>
  );
};

export default GameCategories;
