import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

const OKPAY_API_KEY = process.env.OKPAY_API_KEY;
const OKPAY_MERCHANT_ID = process.env.OKPAY_MERCHANT_ID;

function verifySign(body, apiKey) {
  const filtered = Object.keys(body)
    .filter((k) => body[k] !== "" && body[k] !== undefined && k !== "sign")
    .sort()
    .map((k) => `${k}=${body[k]}`)
    .join("&");

  const stringSignTemp = `${filtered}&key=${apiKey}`;
  const expectedSign = crypto
    .createHash("md5")
    .update(stringSignTemp, "utf8")
    .digest("hex")
    .toLowerCase();
  console.log("CREATE-PAYOUT WEBHOOK stringToVerify:", stringSignTemp);
  console.log(
    "CREATE-PAYOUT WEBHOOK expected:",
    expectedSign,
    "received:",
    body.sign
  );
  return expectedSign === body.sign;
}

export async function POST(req) {
  try {
    const text = await req.text();
    const params = new URLSearchParams(text);
    const body = Object.fromEntries(params);

    console.log("CREATE-PAYOUT Webhook body:", body);

    if (body?.mchId !== OKPAY_MERCHANT_ID) {
      console.error("Invalid mchId", body?.mchId);
      return NextResponse.json(
        { code: 400, message: "Invalid mchId" },
        { status: 400 }
      );
    }

    if (!verifySign(body, OKPAY_API_KEY)) {
      console.error("Invalid sign on payout webhook");
      return NextResponse.json(
        { code: 400, message: "Invalid sign" },
        { status: 400 }
      );
    }

    // parse attach (expected like userId_trxId)
    const [userIdStr, trxIdStr] = (body.attach || "").split("_");
    const userId = Number(userIdStr);
    const trxId = Number(trxIdStr);

    if (!trxId) {
      console.error("Invalid attach format", body.attach);
      return NextResponse.json(
        { code: 400, message: "Invalid attach" },
        { status: 400 }
      );
    }

    // status: 1 success, 2 failed, 0 pending
    if (body?.status === "1") {
      const trx = await prisma.transaction.findUnique({ where: { id: trxId } });
      if (trx && trx.status !== "completed") {
        await prisma.$transaction([
          prisma.transaction.update({
            where: { id: trxId },
            data: {
              status: "completed",
              trx_id: String(
                body.transaction_Id || body.transaction_id || body.transactionId
              ),
            },
          }),
        ]);
      }
    } else if (body?.status === "2") {
      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: trxId },
          data: { status: "cancelled" },
        }),
        prisma.user.update({
          where: { id: userId },
          data: { balance: { increment: Number(body.money) } },
        }),
      ]);
    } else if (body?.status === "0") {
      await prisma.transaction.update({
        where: { id: trxId },
        data: { status: "pending" },
      });
    }

    return new Response("success", { status: 200 });
  } catch (error) {
    console.error("CREATE-PAYOUT webhook error:", error);
    return NextResponse.json(
      { code: 500, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
