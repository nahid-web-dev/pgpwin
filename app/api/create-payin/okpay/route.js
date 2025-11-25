import axios from "axios";
import qs from "qs";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";

const OKPAY_API_KEY = process.env.OKPAY_API_KEY; // Your private key
const OKPAY_MERCHANT_ID = process.env.OKPAY_MERCHANT_ID; // Your merchant ID
const OKPAY_API_URL = process.env.OKPAY_API_URL; // Sandbox or production host

function generateSign(params, apiKey) {
  // 1. Filter out empty or undefined values and exclude 'sign'
  const filtered = Object.keys(params)
    .filter((k) => params[k] !== "" && params[k] !== undefined && k !== "sign")
    .sort() // ASCII lexicographic order
    .map((k) => {
      // Ensure UTF-8 encoding by converting to string
      let val = params[k];
      if (typeof val === "object") {
        // Convert objects like 'attach' to JSON string
        val = JSON.stringify(val);
      }
      return `${k}=${val}`;
    })
    .join("&");

  // 2. Append the private key
  const stringSignTemp = `${filtered}&key=${apiKey}`;

  // 3. MD5 hash in UTF-8 and convert to lowercase
  const hash = crypto
    .createHash("md5")
    .update(stringSignTemp, "utf8")
    .digest("hex")
    .toLowerCase();

  return hash;
}

export async function POST(req) {
  try {
    const { userId } = await getCurrentUser();
    const { pay_type, money } = await req.json();

    const transactionData = await prisma.transaction.create({
      data: {
        amount: Number(money),
        type: "deposit",
        user_id: userId,
        method: pay_type,
      },
    });

    // Prepare parameters
    // Use a simple attach string to avoid JSON formatting differences
    const attachString = `${userId}_${transactionData.id}`;

    const params = {
      mchId: OKPAY_MERCHANT_ID,
      currency: "BDT",
      out_trade_no: String(transactionData.id),
      pay_type: pay_type,
      money: String(money),
      attach: attachString,
      notify_url: `${process.env.BASE_URL}/api/create-payin/okpay/webhook`,
      returnUrl: `${process.env.BASE_URL}/wallet`,
    };

    // Generate sign dynamically
    const sign = generateSign(params, OKPAY_API_KEY);

    console.log("Generated sign:", sign);

    // Stringify with qs
    const data = qs.stringify({ ...params, sign });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${OKPAY_API_URL}/v1/Collect`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data,
    };

    const response = await axios(config);

    await prisma.transaction.update({
      where: { id: transactionData.id },
      data: { sign: sign },
    });

    if (response.data.code == 0) {
      return NextResponse.json({
        success: true,
        message: response.data?.message || "Payin created successfully",
        url: response.data?.data?.url,
      });
    }
    return NextResponse.json({
      success: false,
      message: response.data?.message || "Failed to create payin",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.response?.status || 500 }
    );
  }
}
