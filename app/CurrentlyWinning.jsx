"use client";

import {
  TrendingUp,
  Dices,
  BarChart3,
  Coins,
  ClubIcon as Football,
  Gamepad2,
  Sparkles,
  Trophy,
} from "lucide-react";
import FirstSlider from "../components/FirstSlider";
import GameCategories from "../components/GameCategories";
import GameCard from "@/components/GameCard";

// Currently Winning component (isolated to prevent full page re-renders)
const CurrentlyWinning = ({ games }) => {
  const [winningData, setWinningData] = useState([]);

  // Random user names for the winning section
  const userNames = [
    "CryptoKing",
    "LuckyGamer",
    "FortuneHunter",
    "WinMaster",
    "Rakib",
    "Jay",
    "Rajib",
    "Dark",
    "GoldRush",
    "DiamondHand",
    "RocketPlayer",
    "MoonShot",
    "StarGazer",
    "WinStreak",
    "JackpotHero",
    "LuckyCharm",
    "WealthMaker",
    "FortuneWheel",
    "CasinoRoyal",
    "BetWinner",
    "GameMaster",
    "PrizeCatcher",
    "LuckyStrike",
    "MoneyMaker",
  ];

  // Generate random winning data with random delays
  useEffect(() => {
    let isMounted = true;

    const generateWinningData = () => {
      if (!isMounted) return;

      const newData = [];
      for (let i = 0; i < 8; i++) {
        const randomUser =
          userNames[Math.floor(Math.random() * userNames.length)];
        const randomGame = games[Math.floor(Math.random() * games.length)];
        const randomAmount = (Math.random() * 10000 + 100).toFixed(0);

        newData.push({
          id: Date.now() + i,
          username: randomUser,
          game: randomGame.title,
          amount: randomAmount,
          timestamp: new Date().toISOString(),
        });
      }
      setWinningData(newData);

      // Set a random delay for the next update
      const randomDelay = Math.floor(Math.random() * 5000) + 3000; // Random delay between 3s and 8s
      setTimeout(generateWinningData, randomDelay);
    };

    // Initial generation
    generateWinningData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [games]);

  return (
    <div className="mb-10">
      <div className="flex items-center mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-green-500" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-green-100">
            Live Winners
          </h2>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="w-3 h-3 bg-green-500 rounded-full"
          />
        </div>
      </div>

      <div className="bg-linear-to-br from-green-50 to-emerald-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl overflow-hidden border border-green-200 dark:border-green-800">
        <div className="bg-linear-to-r from-green-500 to-emerald-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold text-lg">🎉 Recent Big Wins</h3>
            <div className="flex items-center gap-2 text-green-100">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm">Live Updates</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {winningData.map((win, index) => (
              <motion.div
                key={win.id}
                initial={{ opacity: 0, x: -50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{
                        duration: 3,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                      className="h-10 w-10 rounded-full bg-linear-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-lg"
                    >
                      {win.username.charAt(0)}
                    </motion.div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm truncate max-w-24">
                        {win.username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {win.game}
                      </p>
                    </div>
                  </div>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                    className="text-right"
                  >
                    <div className="flex items-center gap-1">
                      <Coins className="h-4 w-4 text-yellow-500" />
                      <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                        {win.amount}tk
                      </span>
                    </div>
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                      className="text-xs text-green-500 font-medium"
                    >
                      Just won!
                    </motion.div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                  className="mt-3 h-1 bg-linear-to-r from-green-400 to-emerald-500 rounded-full"
                />
              </motion.div>
            ))}
          </div>

          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="mt-6 text-center"
          >
            <div className="inline-flex items-center gap-2 bg-linear-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              <Trophy className="h-4 w-4" />
              <span>You could be next!</span>
              <Sparkles className="h-4 w-4" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
