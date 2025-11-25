import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

const CALLBACK_TOKEN = process.env.SLOT_CITY_CALLBACK_TOKEN; // keep in .env

export async function POST(req) {
  const token = req.headers.get("callback-token");
  if (token !== CALLBACK_TOKEN) {
    return NextResponse.json({ result: 100, status: "ERROR" });
  }

  const body = await req.json();
  const { command, data, check } = body;
  const checks = check.split(",");
  console.log(command, checks);
  const [user, betRecord] = await Promise.all([
    prisma.user.findUnique({ where: { phone_number: data.account } }),
    prisma.gameTransaction.findUnique({
      where: { trans_id: String(data.trans_id) },
    }),
  ]);

  try {
    // Validate checks
    for (const c of checks) {
      const num = parseInt(c);
      switch (num) {
        case 21: // user verify
          // user = await prisma.user.findUnique({
          //   where: { phone_number: data.account },
          // });
          if (!user) return NextResponse.json({ result: 21, status: "ERROR" });
          break;

        case 22: // user active check
          // Assuming active means not banned
          if (user.status && user.status !== "Active")
            return NextResponse.json({ result: 22, status: "ERROR" });
          break;
        case 31: // balance check
          if (user.balance < data.amount)
            return NextResponse.json({
              result: 31,
              status: "ERROR",
              data: { balance: user.balance },
            });
          break;

        case 41:
        case 42:
          // betRecord = await prisma.gameTransaction.findUnique({
          //   where: { trans_id: String(data.trans_id) },
          // });
          if (num === 41 && betRecord)
            return NextResponse.json({
              result: 41,
              status: "ERROR",
              data: { balance: user.balance },
            });
          if (num === 42 && !betRecord)
            return NextResponse.json({
              result: 42,
              status: "ERROR",
              data: { balance: user.balance },
            });
          break;
      }
    }

    // COMMAND HANDLING
    switch (command) {
      case "authenticate":
        return NextResponse.json({
          result: 0,
          status: "OK",
          data: { account: user.id, balance: user.balance },
        });

      case "balance":
        return NextResponse.json({
          result: 0,
          status: "OK",
          data: { balance: user.balance },
        });

      case "bet":
        // await prisma.gameTransaction.create({
        //   data: {
        //     trans_id: String(data.trans_id),
        //     user_id: user.id,
        //     type: "BET",
        //     amount: data.amount,
        //     game_code: data.game_code,
        //   },
        // });
        // await prisma.user.update({
        //   where: { id: user.id },
        //   data: { balance: { decrement: data.amount } },
        // });
        console.log("bet command received");
        await prisma.$transaction([
          prisma.gameTransaction.create({
            data: {
              trans_id: String(data.trans_id),
              user_id: user.id,
              type: "BET",
              amount: data.amount,
              game_code: data.game_code,
            },
          }),
          prisma.user.update({
            where: { id: user.id },
            data: { balance: { decrement: data.amount } },
          }),
        ]);

        console.log("bet command handled in prisma");
        return NextResponse.json({
          result: 0,
          status: "OK",
          data: { balance: user.balance - data.amount },
        });

      case "win":
        await prisma.$transaction([
          prisma.gameTransaction.create({
            data: {
              trans_id: String(data.trans_id),
              user_id: user.id,
              type: "WIN",
              amount: data.amount,
              game_code: data.game_code,
            },
          }),
          prisma.user.update({
            where: { id: user.id },
            data: { balance: { increment: data.amount } },
          }),
        ]);
        return NextResponse.json({
          result: 0,
          status: "OK",
          data: { balance: user.balance + data.amount },
        });

      case "cancel":
        await prisma.gameTransaction.update({
          where: { trans_id: String(data.trans_id) },
          data: { type: "CANCEL" },
        });
        return NextResponse.json({
          result: 0,
          status: "OK",
          data: { balance: user.balance },
        });

      case "status":
        return NextResponse.json({
          result: 0,
          status: "OK",
          data: {
            trans_id: data.trans_id,
            trans_status: betRecord?.type === "CANCEL" ? "CANCELED" : "OK",
          },
        });

      default:
        return NextResponse.json({ result: 404, status: "ERROR" });
    }
  } catch (e) {
    console.error("Callback Error:", e);
    return NextResponse.json({ result: 500, status: "ERROR" });
  }
}
