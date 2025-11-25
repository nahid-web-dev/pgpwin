import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { amount, firstname, email, phone, productinfo } = body;

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        amount,
        type: "deposit",
        status: "pending",
        user_id: 1, // TODO: replace with logged-in user's ID
      },
    });

    // Create payment via AltrustPay
    const res = await fetch(
      "https://www.altrustpay.pro/api/business/create-payment-intent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ALTRUSTPAY_API_KEY,
        },
        body: JSON.stringify({
          amount: amount.toFixed(2),
          currency: "INR",
          payment_provider: "payu",
          customer_reference: `ORDER_${transaction.id}`, // your own unique order id
          productinfo: "Top-up",
          firstname: "John",
          email: "mymail@mail.com",
          phone: "9898989898",
          upi_app: "genericintent",
          s2s_client_ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
          s2s_device_info: req.headers.get("user-agent"),
          customer_webhook_url: `${process.env.BASE_URL}/api/create-payment/altrustpay/payu/webhook`,
        }),
      }
    );

    const data = await res.json();

    console.log(data);

    // Update trx_id in DB
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { trx_id: data.payment_id || null },
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Payment creation failed" },
      { status: 500 }
    );
  }
}
