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

    // Fetch all vouchers (both collected and uncollected), sorted by createdAt (latest first)
    const vouchers = await prisma.voucher.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        code: true,
        amount: true,
        message: true,
        collected: true,
        collected_at: true,
        collected_by: true,
        user: { select: { id: true, phone_number: true } },
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      vouchers,
      total: vouchers.length,
    });
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
