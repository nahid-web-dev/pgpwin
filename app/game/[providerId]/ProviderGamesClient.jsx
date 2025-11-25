"use client";

import { useEffect, useState } from "react";
import GameCard from "@/components/GameCard";
import { motion } from "framer-motion";

export default function ProviderGamesClient({ providerId }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("games");

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/game/games?provider_id=${providerId}&category=0`
        );
        const data = await res.json();
        console.log(data.data);
        if (data && data.data) {
          setGames(data.data);
        } else {
          setGames([]);
        }
      } catch (err) {
        console.error("Failed to load games:", err);
        setError("Failed to load games");
      } finally {
        setLoading(false);
      }
    };

    if (providerId) fetchGames();
  }, [providerId]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Games for Provider {providerId}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Browse all available games for this provider.
        </p>
      </div>

      {/* Games Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {games.map((game) => (
            <GameCard
              key={game.game_code || game.id || Math.random()}
              game={game}
              badgeColor="bg-orange-500"
              badgeText={"🔥"}
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

      {error && <div className="text-center py-6 text-red-500">{error}</div>}
    </div>
  );
}
