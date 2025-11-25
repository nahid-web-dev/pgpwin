import axios from "axios";
import { NextResponse } from "next/server";

const API_URL = process.env.SLOT_CITY_API_URL;
const API_TOKEN = process.env.SLOT_CITY_API_TOKEN;

export const GET = async (req) => {
  const { searchParams } = new URL(req.url);

  const provider_id = searchParams.get("provider_id");
  const category = searchParams.get("category");

  try {
    const res = await axios.post(
      `${API_URL}/v4/game/games`,
      {
        provider_id: provider_id || 9,
        category: category || 0,
        lang: 1,
      },
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(res.data);
  } catch (error) {
    return NextResponse.json({
      code: 500,
      message: "Internal server error",
    });
  }
};
