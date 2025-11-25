import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const current = await getCurrentUser();

    if (!current || !current.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch current user (to get phone_number)
    const user = await prisma.user.findUnique({
      where: { id: current.userId },
    });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Find referred users (their ids)
    const referred = await prisma.user.findMany({
      where: { invited_by: user.phone_number },
      select: { id: true },
    });

    const referredIds = referred.map((r) => r.id);

    // Compute today's date range (server local time)
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    // Total bet amount for referred users today (GameTransaction.type === "BET")
    let totalBetToday = 0;
    if (referredIds.length > 0) {
      const betAgg = await prisma.gameTransaction.aggregate({
        _sum: { amount: true },
        where: {
          user_id: { in: referredIds },
          type: "BET",
          createdAt: { gte: startOfDay, lt: endOfDay },
        },
      });
      totalBetToday = parseFloat((betAgg._sum.amount || 0).toString());
    }

    // Total deposit amount for referred users today (Transaction.type === "deposit", status === completed)
    let totalDepositToday = 0;
    if (referredIds.length > 0) {
      const depAgg = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          user_id: { in: referredIds },
          type: "deposit",
          status: "completed",
          createdAt: { gte: startOfDay, lt: endOfDay },
        },
      });
      totalDepositToday = parseFloat((depAgg._sum.amount || 0).toString());
    }

    // Fetch current user's commission and salary transactions (latest 50)
    const commissionTx = await prisma.transaction.findMany({
      where: { user_id: current.userId, type: "commission" },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const salaryTx = await prisma.transaction.findMany({
      where: { user_id: current.userId, type: "salary" },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const commissionsTotal = commissionTx.reduce(
      (s, t) => s + parseFloat(t.amount.toString()),
      0
    );
    const salariesTotal = salaryTx.reduce(
      (s, t) => s + parseFloat(t.amount.toString()),
      0
    );

    return NextResponse.json({
      success: true,
      referred_today: {
        total_bet: totalBetToday,
        total_deposit: totalDepositToday,
        referred_count: referredIds.length,
      },
      earnings: {
        commissions_total: commissionsTotal,
        salaries_total: salariesTotal,
        commissions: commissionTx,
        salaries: salaryTx,
      },
    });
  } catch (error) {
    console.error("Error in referral-summary route:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
