import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

const OKPAY_API_KEY = process.env.OKPAY_API_KEY; // Your private key
const OKPAY_MERCHANT_ID = process.env.OKPAY_MERCHANT_ID; // Your merchant ID

// Function to verify OKPay sign
function verifySign(body, apiKey) {
  const filtered = Object.keys(body)
    .filter((k) => body[k] !== "" && body[k] !== undefined && k !== "sign")
    .sort() // ASCII lexicographic order
    .map((k) => `${k}=${body[k]}`)
    .join("&");

  const stringSignTemp = `${filtered}&key=${apiKey}`;

  const expectedSign = crypto
    .createHash("md5")
    .update(stringSignTemp, "utf8")
    .digest("hex")
    .toLowerCase();

  return expectedSign === body.sign;
}

export async function POST(req) {
  try {
    // Read raw body as text
    const text = await req.text();
    const params = new URLSearchParams(text);
    const body = Object.fromEntries(params);

    console.log("Webhook body:", body);

    // Validate merchant ID
    if (body?.mchId !== OKPAY_MERCHANT_ID) {
      console.error("Invalid merchant_id:", body?.mchId);
      return NextResponse.json(
        { code: 400, message: "Invalid merchant_id" },
        { status: 400 }
      );
    }

    // Verify the signature
    if (!verifySign(body, OKPAY_API_KEY)) {
      console.error("Invalid sign! Possible tampering detected.");
      return NextResponse.json(
        { code: 400, message: "Invalid sign" },
        { status: 400 }
      );
    }

    console.log("Webhook sign verified:", body.sign);

    const [userId, transactionId] = body.attach.split("_").map(Number);

    // Update transaction and user balance based on status
    if (body?.status === "1") {
      // Payment successful
      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: transactionId },
          data: { status: "completed" },
        }),
        prisma.user.update({
          where: { id: userId },
          data: { balance: { increment: Number(body.pay_money) } },
        }),
      ]);
    } else if (body?.status === "2") {
      // Payment failed
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: "cancelled" },
      });
    } else if (body?.status === "0") {
      // Payment pending
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: "pending" },
      });
    }

    // Respond with 'success' so OKPay stops retrying
    return new Response("success", { status: 200 });
  } catch (error) {
    console.error("Error in OKPay webhook:", error);
    return NextResponse.json(
      { code: 500, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
