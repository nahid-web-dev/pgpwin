import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await getCurrentUser();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Get the current user's phone_number
    const currentUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      // select: { phone_number: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Find all users who were invited by the current user
    const referredUsers = await prisma.user.findMany({
      where: { invited_by: currentUser.phone_number },
      select: {
        id: true,
        phone_number: true,
        balance: true,
        createdAt: true,
        game_transactions: true,
      },
    });

    // Calculate total bet amount and current balance for each referred user
    const referredUsersWithStats = referredUsers.map((user) => {
      const totalBetAmount = user.game_transactions
        .filter((tx) => tx.type === "BET")
        .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

      return {
        id: user.id,
        phone_number: user.phone_number,
        current_balance: parseFloat(user.balance),
        total_bet_amount: totalBetAmount,
        joined_at: user.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      referred_users: referredUsersWithStats,
      total_referrals: referredUsersWithStats.length,
    });
  } catch (error) {
    console.error("Error fetching referred users:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
