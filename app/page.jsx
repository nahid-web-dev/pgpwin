import axios from "axios";
import { Sparkles, TrendingUp } from "lucide-react";
import FirstSlider from "../components/FirstSlider";
import GameCategories from "../components/GameCategories";
import GameCard from "@/components/GameCard";
import crypto from "crypto";
import { prisma } from "./lib/prisma";

function generateUserResHash(data, SECRET_KEY) {
  let str = "";
  for (const key of Object.keys(data)) {
    if (key === "hash") continue; // ignore hash itself
    const value = data[key];
    if (typeof value === "object") continue; // ignore objects/arrays
    str += value === true ? "1" : value === false ? "0" : value || "";
  }
  str += SECRET_KEY;
  return crypto.createHash("md5").update(str).digest("hex");
}

// export function generateGameResHash(data, secretKey) {
//   // Fixed order of fields for TorroSpin API
//   const orderedKeys = [
//     "token",
//     "game_name",
//     "user_id",
//     "bank_id",
//     "currency",
//     "quit_link",
//     "device",
//     "lang",
//     "free_spin",
//     "lobby", // include only if required
//   ];

//   const str = orderedKeys
//     .map((key) => {
//       const val = data[key];
//       if (typeof val === "boolean") return val ? "1" : "0";
//       if (typeof val === "object") return ""; // ignore arrays/objects
//       return val !== undefined ? String(val) : "";
//     })
//     .join("");

//   return crypto
//     .createHash("md5")
//     .update(str + secretKey)
//     .digest("hex");
// }

export default async function AppPage() {
  const torrospinApiUrl = process.env.TORROSPIN_API_URL || "";
  const torrospinApiKey = process.env.TORROSPIN_API_KEY || "";
  const torrospinSecretKey = process.env.TORROSPIN_API_SECRET || "";

  // const allUsers = await prisma.user.findMany({});

  // console.log(allUsers);

  // for (const user of allUsers) {
  //   const userData = {
  //     casino_user_id: String(user.id),
  //     username: user.phone_number,
  //     hash: "",
  //   };

  //   userData.hash = generateUserResHash(userData, torrospinSecretKey);

  //   const addUser = await axios.post(
  //     `${torrospinApiUrl}/api/add/user`,
  //     userData,
  //     {
  //       headers: {
  //         "x-api-key": torrospinApiKey,
  //       },
  //     }
  //   );

  //   console.log("addUser :", addUser.data);
  // }

  const workingProviders = [
    "rubyplay",
    "RTG",
    "spribe",
    "Habanero",
    "GMW",
    "veliplay",
    "playngo",
    "EGT",
    "jili",
    "SimplePlay",
    "Pragmatic",
    "vivo",
    "AMARIX",
    "Blue Jack Gaming",
    "DSTPLAY",
    "Wonwon Games",
    "YEEBET LIVE",
    "PLAYSON",
    "Hacksaw Gaming",
    "BOONGO",
    "Aviatrix",
    "Gamzix",
    "BGaming",
    "Platipus",
    "SA Gaming",
  ];

  const popularGamesCatalog = await axios.get(
    `${torrospinApiUrl}/api/games/catalog`,
    {
      headers: {
        "x-api-key": torrospinApiKey,
      },
      params: {
        status: "active",
        providers: ["jili", "spribe", "Aviatrix", "BOONGO"],
        per_page: 800,
        game_type: "all",
        // search: "Super Ace",
        // provider: "spribe",
      },
    }
  );

  const popularGames = popularGamesCatalog.data?.data?.filter((i) => {
    if (
      i.game_code == "49_jili" ||
      i.game_code == "aviator_spribe" ||
      i.game_code == "77_jili" ||
      i.game_code == "plinko_spribe" ||
      i.game_code == "ax_nft_aviatrix_47059"
    ) {
      return i;
    }
    return null;
  });

  const jiliGamesCatalog = await axios.get(
    `${torrospinApiUrl}/api/games/catalog`,
    {
      headers: {
        "x-api-key": torrospinApiKey,
      },
      params: {
        status: "active",
        providers: ["jili"],
        per_page: 500,
        game_type: "all",
        // search: "Super Ace",
        // provider: "spribe",
      },
    }
  );

  const providersCatalog = await axios.get(
    `${torrospinApiUrl}/api/games/providers`,
    {
      headers: {
        "x-api-key": torrospinApiKey,
      },
      params: {
        status: "active",
        providers: workingProviders,
      },
    }
  );

  return (
    <div className="min-h-dvh">
      <div className="container mx-auto px-4 py-8">
        <FirstSlider />
        <GameCategories slides={providersCatalog?.data} />

        {/* New Games Section */}
        <div className="mb-10">
          <div className="flex items-center mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-amber-100">
                Popular Games🔥
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-5 ">
            {popularGames.map((game) => (
              <GameCard key={game.game_code} game={game} />
            ))}
          </div>
        </div>

        {/* Popular Games Section */}
        <div className="mb-10">
          <div className="flex items-center mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-orange-100">
                Jili Games🔥
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-5 ">
            {jiliGamesCatalog.data?.data.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                badgeColor="bg-orange-500"
                badgeText="HOT 🔥"
                borderColor="border-orange-200 dark:border-orange-900"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
