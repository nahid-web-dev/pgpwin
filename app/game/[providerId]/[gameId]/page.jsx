import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import axios from "axios";

export default async function GamePage({ params }) {
  // await prisma.$executeRawUnsafe(
  //   `ALTER SEQUENCE "User_id_seq" RESTART WITH 1000;`
  // );
  // console.log("✅ User ID sequence reset to start from 1000");

  const API_URL = process.env.SLOT_CITY_API_URL || "";
  const API_TOKEN = process.env.SLOT_CITY_API_TOKEN || "";
  const BASE_URL = process.env.BASE_URL || "";
  const { providerId, gameId } = await params;

  const currentUser = await getCurrentUser();

  const userCreateResponse = await axios.post(
    `${API_URL}/v4/user/create`,
    {
      name: String(currentUser.phoneNumber),
    },
    {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  const dynamicWinRatio =
    Math.floor(Math.random() * 10) < 0.5
      ? 90
      : Math.floor(Math.random() * 10) < 0.5
      ? 95
      : 85;

  const launchResponse = await axios.post(
    `${API_URL}/v4/game/game-url`,
    {
      user_code: userCreateResponse.data?.data?.user_code,
      provider_id: Number(providerId),
      game_symbol: gameId,
      lang: 1,
      return_url: BASE_URL,
      win_ratio: dynamicWinRatio,
    },
    {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  return (
    <div className="fixed top-0 left-0 w-screen h-dvh z-50">
      {launchResponse?.data?.code == 0 &&
        launchResponse?.data?.data?.game_url && (
          <iframe
            // height={600}
            // width={400}
            className=" w-screen h-dvh "
            src={launchResponse?.data?.data?.game_url}
            allow="fullscreen; autoplay; encrypted-media; clipboard-write; accelerometer; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
    </div>
  );
}
