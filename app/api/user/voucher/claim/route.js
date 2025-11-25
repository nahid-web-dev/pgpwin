import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const current = await getCurrentUser();

    if (!current || !current.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { voucherId } = await request.json();

    if (!voucherId) {
      return NextResponse.json(
        { success: false, message: "Voucher ID is required" },
        { status: 400 }
      );
    }

    // Check if voucher exists and is unclaimed
    const voucher = await prisma.voucher.findUnique({
      where: { id: voucherId },
    });

    if (!voucher) {
      return NextResponse.json(
        { success: false, message: "Voucher not found" },
        { status: 404 }
      );
    }

    if (voucher.collected) {
      return NextResponse.json(
        { success: false, message: "Voucher already claimed" },
        { status: 400 }
      );
    }

    // Get current user to update balance and turnover
    const user = await prisma.user.findUnique({
      where: { id: current.userId },
      select: { balance: true, turn_over: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Update voucher as collected and update user balance + turnover
    const [updatedVoucher, updatedUser] = await prisma.$transaction([
      prisma.voucher.update({
        where: { id: voucherId },
        data: {
          collected: true,
          collected_at: new Date(),
          collected_by: current.userId,
        },
      }),
      prisma.user.update({
        where: { id: current.userId },
        data: {
          balance: {
            increment: voucher.amount,
          },
          turn_over: {
            increment: voucher.amount,
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Voucher claimed successfully",
      voucher: updatedVoucher,
      user: {
        balance: parseFloat(updatedUser.balance.toString()),
        turnover: parseFloat(updatedUser.turn_over.toString()),
      },
    });
  } catch (error) {
    console.error("Error claiming voucher:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
