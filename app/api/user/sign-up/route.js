import { prisma } from "@/app/lib/prisma";
import { hashPassword, generateToken } from "@/app/lib/auth";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request) {
  try {
    const { username, phone_number, password, invited_by, fingerprint_id } =
      await request.json();

    // Validate input
    if (!phone_number || !username || !password) {
      return NextResponse.json(
        { message: "Phone number and password are required" },
        { status: 400 }
      );
    }

    if (phone_number == invited_by) {
      return NextResponse.json(
        {
          success: false,
          message: "You can not use your phone as invite code.",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { phone_number },
    });

    const existingUserWithSameUsername = await prisma.user.findFirst({
      where: { user_code: username },
    });

    if (existingUserWithSameUsername) {
      return NextResponse.json(
        { message: "User with this username already exists" },
        { status: 400 }
      );
    }
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this phone number already exists" },
        { status: 400 }
      );
    }

    // Get the user's IP address
    const ip = request.headers.get("x-forwarded-for") || "unknown";

    const existingUserWithSameFPAndIp = await prisma.user.findFirst({
      where: {
        fp_id: fingerprint_id,
        ip: ip,
      },
    });

    if (existingUserWithSameFPAndIp) {
      return NextResponse.json(
        { message: "You already have an account with this device." },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        phone_number: phone_number,
        user_code: username,
        password: hashedPassword,
        invited_by: invited_by,
        ip: ip,
        fp_id: fingerprint_id,
      },
    });

    const token = generateToken(newUser.id, newUser.phone_number);

    // Set cookie using NextResponse
    const response = NextResponse.json({
      success: true,
      message: "Registration Successful!",
      token,
      user: { id: newUser.id, phone_number: newUser.phone_number },
    });

    response.headers.set(
      "Set-Cookie",
      `auth_token=${token}; Path=/; Max-Age=${
        29 * 24 * 60 * 60
      }; SameSite=None; Secure`
    );

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
