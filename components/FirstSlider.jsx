"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import Image from "next/image";

const largeSlides = [
  "/new_first_slider/slide_01.jpg",
  "/new_first_slider/slide_02.jpg",
  "/new_first_slider/slide_03.jpg",
  "/new_first_slider/slide_04.jpg",
  "/new_first_slider/slide_05.jpg",
  "/new_first_slider/slide_06.jpg",
  "/new_first_slider/slide_07.jpg",
];

const mobileSlides = [
  "/new_first_slider_mobile/slide_01.jpg",
  "/new_first_slider_mobile/slide_02.jpg",
  "/new_first_slider_mobile/slide_03.jpg",
  "/new_first_slider_mobile/slide_04.jpg",
  "/new_first_slider_mobile/slide_05.jpg",
];

export default function FirstSlider() {
  const [current, setCurrent] = useState(0);

  const [slides, setSlides] = useState([]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Detect swipe direction
  const handleDragEnd = (event, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    if (offset > 100 || velocity > 500) prevSlide();
    else if (offset < -100 || velocity < -500) nextSlide();
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const screenWidth = window.innerWidth;
    if (screenWidth > 768) {
      setSlides(largeSlides);
    } else {
      setSlides(mobileSlides);
    }
  }, []);

  const data = [
    {
      yellow: "গুরুত্বপূর্ণ নোটিশ -",
      white:
        " :PGP Win শুধুমাত্র তাদের অফিসিয়াল ওয়েবসাইটের ইনবক্সের মাধ্যমে বিজয়ীদের ঘোষণা করে। কোনো তৃতীয় পক্ষের প্ল্যাটফর্ম ব্যবহার করি না। কোনো লিঙ্কে ক্লিক করবেন না।",
    },
    {
      yellow: "স্ক্যাম সতর্কতা -",
      white:
        " :আপনার অ্যাকাউন্ট সুরক্ষিত রাখতে OTP, লগইন তথ্য বা রসিদ কারো সাথে শেয়ার করবেন না। তৃতীয় পক্ষের কোনো লিঙ্কে ক্লিক করবেন না।",
    },
    {
      yellow: "PGP Win-এ স্বাগতম -",
      white: " :বাংলাদেশের #1 ক্রিকেট এক্সচেঞ্জ এবং বেটিং প্ল্যাটফর্ম",
    },
  ];

  // Convert to single long string array
  const flat = data.flatMap((item) => [
    { color: "yellow", text: item.yellow },
    { color: "white", text: item.white },
  ]);

  return (
    <>
      <div className="relative w-full mx-auto overflow-hidden shadow-lg">
        {/* Slider */}
        <motion.div
          className="flex cursor-grab active:cursor-grabbing "
          drag="x"
          onDragEnd={handleDragEnd}
          animate={{ x: `-${current * 100}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          {slides &&
            slides?.map((slide, index) => (
              <div
                key={index}
                className="relative min-w-full aspect-9/4! md:aspect-96/19! "
              >
                <Image
                  src={slide}
                  alt={`slide-${index}`}
                  className=" object-contain rounded-2xl md:rounded-none"
                  fill
                />
                {/* <div className="absolute inset-0 bg-linear-to-r from-black/60 to-transparent" /> */}
              </div>
            ))}
        </motion.div>

        {/* Left Button */}
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/70 transition"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Right Button */}
        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/70 transition"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Dots */}
      <div className="my-5 w-full flex justify-center space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-2 h-2 rounded-full transition ${
              current === index ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>

      <div className="overflow-hidden rounded-xl whitespace-nowrap bg-stone-800 py-2">
        <motion.div
          className="flex"
          animate={{ x: ["0%", "-100%"] }}
          transition={{ repeat: Infinity, duration: 80, ease: "linear" }}
          style={{ width: "max-content" }} // prevents early restart
        >
          {/* ORIGINAL full sequence */}
          <div className="flex gap-10 text-sm">
            {flat.map((part, i) => (
              <span
                key={i}
                className={
                  part.color === "yellow" ? "text-yellow-400" : "text-white"
                }
              >
                {part.text}
              </span>
            ))}
          </div>

          {/* COPY of the full sequence for looping */}
          <div className="flex gap-10 text-sm">
            {flat.map((part, i) => (
              <span
                key={`copy-${i}`}
                className={
                  part.color === "yellow" ? "text-yellow-400" : "text-white"
                }
              >
                {part.text}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="w-full aspect-8/1 my-6 relative">
        <Image
          alt="register banner"
          src="/banners/register_banner_home.jpg"
          fill
          className="object-contain"
        />
      </div>
    </>
  );
}
