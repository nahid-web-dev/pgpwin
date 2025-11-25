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

    const messages = await prisma.message.findMany({
      where: {
        OR: [{ sender: String(userId) }, { receiver: String(userId) }],
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(`Fetched ${messages.length} messages for user ${userId}`);

    return NextResponse.json(
      { success: true, data: messages },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch messages error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
