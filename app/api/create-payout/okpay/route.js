import axios from "axios";
import qs from "qs";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";

const OKPAY_API_KEY = process.env.OKPAY_API_KEY;
const OKPAY_MERCHANT_ID = process.env.OKPAY_MERCHANT_ID;
const OKPAY_API_URL = process.env.OKPAY_API_URL; // e.g. https://sandbox.wpay.one

function generateSign(params, apiKey) {
  const filtered = Object.keys(params)
    .filter((k) => params[k] !== "" && params[k] !== undefined && k !== "sign")
    .sort()
    .map((k) => {
      let val = params[k];
      if (typeof val === "object") val = JSON.stringify(val);
      return `${k}=${val}`;
    })
    .join("&");

  const stringSignTemp = `${filtered}&key=${apiKey}`;
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
    const { pay_type, money, account, userName } = await req.json();

    // basic validation
    if (!pay_type || !money || !account || !userName) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // check user and balance
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user)
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );

    if (Number(user.balance) < Number(money)) {
      return NextResponse.json(
        { success: false, message: "Insufficient balance" },
        { status: 400 }
      );
    }

    // create withdraw transaction (pending)
    const [trx, usr] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          amount: Number(money),
          type: "withdraw",
          status: "pending",
          user_id: userId,
          method: pay_type,
        },
      }),

      prisma.user.update({
        where: { id: userId },
        data: {
          balance: {
            decrement: Number(money),
          },
        },
      }),
    ]);

    const attachValue = `${userId}_${trx.id}`;

    const params = {
      mchId: OKPAY_MERCHANT_ID,
      currency: "BDT",
      out_trade_no: String(trx.id),
      pay_type: pay_type,
      account: account,
      userName: userName,
      money: String(money),
      attach: attachValue,
      notify_url: `${process.env.BASE_URL}/api/create-payout/okpay/webhook`,
    };

    const sign = generateSign(params, OKPAY_API_KEY);
    const data = qs.stringify({ ...params, sign });

    console.log("CREATE-PAYOUT request body (urlencoded):", data);

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${OKPAY_API_URL}/v1/Payout`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data,
    };

    const response = await axios(config);

    console.log("CREATE-PAYOUT Response:", response.data);

    // return provider response
    if (response.data?.code === 0) {
      // optionally update trx with provider transaction id
      await prisma.transaction.update({
        where: { id: trx.id },
        data: {
          trx_id: String(
            response.data?.data?.transaction_Id ||
              response.data?.data?.transaction_Id ||
              trx.id
          ),
        },
      });
      return NextResponse.json({ success: true, data: response.data });
    }

    return NextResponse.json(
      { success: false, data: response.data },
      { status: 400 }
    );
  } catch (error) {
    console.error("CREATE-PAYOUT Error:", error?.message || error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.response?.status || 500 }
    );
  }
}
