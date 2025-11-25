import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const depositCount = await prisma.transaction.count({
      where: {
        user_id: currentUser.userId,
        type: "deposit",
      },
    });

    return NextResponse.json({ success: true, depositCount });
  } catch (error) {
    console.error("Deposit count error:", error);
    return NextResponse.json(
      {
        success: true,
        message: "An error occurred while fetching deposit count",
      },
      { status: 500 }
    );
  }
}
