import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const data = await req.json();
    console.log("Webhook received:", data);

    const { customer_reference, status, amount } = data; // amount in string like "1000.00"

    // Extract transaction ID from "ORDER_15"
    const id = parseInt(customer_reference?.replace("ORDER_", ""));
    if (!id) return new NextResponse("Invalid transaction ID", { status: 400 });

    // Find transaction + user
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!transaction)
      return new NextResponse("Transaction not found", { status: 404 });

    // Only update if payment completed and not already processed
    if (status === "completed" && transaction.status !== "completed") {
      const addAmount = Math.floor(parseFloat(amount)); // convert to int

      await prisma.$transaction([
        prisma.transaction.update({
          where: { id },
          data: { status: "completed" },
        }),
        prisma.user.update({
          where: { id: transaction.user_id },
          data: { balance: { increment: addAmount } },
        }),
      ]);

      console.log(
        `✅ Payment success: Added ₹${addAmount} to User#${transaction.user_id}`
      );
    } else {
      // Handle failed or cancelled payments
      await prisma.transaction.update({
        where: { id },
        data: { status: "cancelled" },
      });
      console.log(`❌ Payment failed/cancelled for Transaction#${id}`);
    }

    return new NextResponse("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook Error:", err);
    return new NextResponse("Error", { status: 500 });
  }
}
