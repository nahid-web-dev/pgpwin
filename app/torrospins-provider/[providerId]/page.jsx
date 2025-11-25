import GameCard from "@/components/GameCard";
import GameCategories from "@/components/GameCategories";
import axios from "axios";

export default async function ProviderPage({ params }) {
  const { providerId } = await params;
  let games, err, providersCatalog;

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

  try {
    console.log("Provider ID:", providerId);

    const API_URL = process.env.TORROSPIN_API_URL;
    const API_KEY = process.env.TORROSPIN_API_KEY;

    const res = await axios.get(`${API_URL}/api/games/catalog`, {
      headers: {
        "x-api-key": API_KEY,
      },
      params: {
        game_type: "all",
        status: "active",
        providers: [providerId],
        per_page: 1000,
      },
    });

    providersCatalog = await axios.get(`${API_URL}/api/games/providers`, {
      headers: {
        "x-api-key": API_KEY,
      },
      params: {
        status: "active",
        providers: workingProviders,
      },
    });

    games = res.data.data;
  } catch (error) {
    err = error?.message;
    console.log(err);
  }

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-gray-900 p-4">
      <GameCategories slides={providersCatalog?.data} />
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {providerId} :
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Browse all available games for this provider.
          </p>
        </div>

        {games && (
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-5 ">
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

        {err && <div className="text-center py-6 text-red-500">{err}</div>}
      </div>
    </div>
  );
}
