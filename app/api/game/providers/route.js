import axios from "axios";
import { NextResponse } from "next/server";

const API_URL = process.env.SLOT_CITY_API_URL;
const API_TOKEN = process.env.SLOT_CITY_API_TOKEN;

export const GET = async (req) => {
  try {
    const res = await axios.post(
      `${API_URL}/v4/game/providers`,
      {
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
