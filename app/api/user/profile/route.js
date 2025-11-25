import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      // select: {
      //   id: true,
      //   user_code,
      //   phone_number: true,
      //   balance: true,
      //   turn_over: true,
      //   createdAt: true,
      //   fp_id: true,
      //   ip: true,
      //   invited_by: true,
      // },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching profile" },
      { status: 500 }
    );
  }
}
