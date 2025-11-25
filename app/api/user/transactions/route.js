import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { userId } = await getCurrentUser();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // support pagination via query params
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const take = Math.max(1, Math.min(100, limit));
    const skip = Math.max(0, (Math.max(1, page) - 1) * take) || 0;

    console.log("skip", skip, "take", take);

    // total count for this user
    const total = await prisma.transaction.count({
      where: { user_id: userId },
    });

    const transactions = await prisma.transaction.findMany({
      where: { user_id: userId },
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        amount: true,
        type: true,
        trx_id: true,
        status: true,
        method: true,
        createdAt: true,
      },
    });

    console.log(
      `Fetched ${transactions.length} transactions for user ${userId}`
    );

    return NextResponse.json(
      { success: true, data: transactions, total },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch transactions error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
