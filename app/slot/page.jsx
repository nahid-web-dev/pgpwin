"use client";

import { useGames } from "../hooks/useGames";
import GameCard from "@/components/GameCard";
import { motion } from "framer-motion";
import Image from "next/image";

export default function SlotPage() {
  const {
    games,
    providers,
    selectedProvider,
    setSelectedProvider,
    loading,
    error,
  } = useGames(1); // category 1 for slots

  if (error) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-gray-900 p-4 flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-gray-900 p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Slot Games
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose from our wide selection of exciting slot games
        </p>
      </div>

      {/* Provider Selection */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex gap-5 overflow-x-auto scrollbar-hide px-3 py-2 my-10"
      >
        {providers.map((provider, index) => (
          <button
            key={provider.provider_id}
            onClick={() => setSelectedProvider(provider.provider_id)}
            className={`relative w-28 aspect-6/7 border-2 rounded-lg shrink-0 overflow-hidden transition-all duration-300 ${
              selectedProvider === provider.provider_id
                ? "border-orange-500 shadow-lg shadow-orange-500/20"
                : "border-light dark:border-yellow-400"
            }`}
          >
            <Image
              src={`https://sc4-admin.dreamgates.net/img/${provider.provider_id}.png`}
              alt={provider.provider_name}
              className="p-2 object-contain z-10"
              fill
            />
            <Image
              src="/background.png"
              alt="background"
              className="pb-2 object-contain opacity-40"
              fill
            />
            <div className="absolute w-full bg-dark/40 bottom-0 left-0 h-8 pb-1 mt-1 text-sm text-light dark:text-yellow-600 flex justify-center items-center flex-wrap px-1">
              {provider.provider_name === "Pocket Games Soft"
                ? "PG Soft"
                : provider.provider_name}
            </div>
          </button>
        ))}
      </motion.div>

      {/* Games Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {games.map((game, index) => (
            <GameCard
              key={game.game_code}
              game={game}
              badgeColor="bg-orange-500"
              badgeText="SLOT"
              borderColor="border-orange-200 dark:border-orange-800"
            />
          ))}
        </div>
      )}

      {/* No Games Message */}
      {!loading && games.length === 0 && (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          No games available for this provider.
        </div>
      )}
    </div>
  );
}
