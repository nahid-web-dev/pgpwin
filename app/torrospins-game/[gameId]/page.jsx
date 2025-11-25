import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import axios from "axios";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

function generateHash(data, SECRET_KEY) {
  let str = "";
  for (const key of Object.keys(data)) {
    if (key === "hash") continue; // ignore hash itself
    const value = data[key];
    if (typeof value === "object") continue; // ignore objects/arrays
    str += value === true ? "1" : value === false ? "0" : String(value) || "";
  }
  str += SECRET_KEY;
  return crypto.createHash("md5").update(str).digest("hex");
}

export default async function GamePage({ params }) {
  // await prisma.$executeRawUnsafe(
  //   `ALTER SEQUENCE "User_id_seq" RESTART WITH 1000;`
  // );
  // console.log("✅ User ID sequence reset to start from 1000");

  const API_URL = process.env.TORROSPIN_API_URL || "";
  const API_TOKEN = process.env.TORROSPIN_API_KEY || "";
  const SECRET_KEY = process.env.TORROSPIN_API_SECRET || "";
  const BASE_URL = process.env.BASE_URL || "";
  const { gameId } = await params;

  const currentUser = await getCurrentUser();

  // STEP 2: Prepare game request
  const gameData = {
    token: uuidv4(), // use API-generated user token
    game_name: gameId,
    user_id: currentUser?.userId,
    bank_id: currentUser?.userId,
    currency: "BDT",
    quit_link: BASE_URL,
    device: "mobile",
    lang: "EN",
    free_spin: 0,
    lobby: false,
  };

  // STEP 3: Generate hash
  const gameDataHash = generateHash(gameData, SECRET_KEY);

  // STEP 4: Request game launch URL
  const gameRes = await axios.post(
    `${API_URL}/api/request_link/real`,
    { ...gameData, hash: gameDataHash },
    {
      headers: {
        "x-api-key": API_TOKEN,
      },
    }
  );

  console.log("Game Launch Response:", gameRes.data);

  return (
    <div className="fixed top-0 left-0 w-screen h-dvh z-50">
      {gameRes?.data?.success && gameRes?.data?.url && (
        <iframe
          // height={600}
          // width={400}
          className=" w-screen h-dvh "
          src={gameRes?.data?.url}
          allow="fullscreen; autoplay; encrypted-media; clipboard-write; accelerometer; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  );
}
