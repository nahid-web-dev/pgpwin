import { prisma } from "@/app/lib/prisma";
import { comparePasswords, generateToken } from "@/app/lib/auth";
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request) {
  try {
    const { username, phone_number, password } = await request.json();

    console.log(username, phone_number, password);

    // Validate input
    if (!password) {
      return NextResponse.json(
        { message: "Phone number and password are required" },
        { status: 400 }
      );
    }

    if (!username && !phone_number) {
      return NextResponse.json(
        { message: "Phone number and password are required" },
        { status: 400 }
      );
    }

    let user;

    // Find user by phone number
    phone_number
      ? (user = await prisma.user.findFirst({
          where: { phone_number: phone_number },
        }))
      : (user = await prisma.user.findFirst({
          where: { user_code: username },
        }));

    if (!user) {
      return NextResponse.json(
        { message: "Invalid phone number or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await comparePasswords(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { message: "Invalid phone number or password" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken(user.id, user.phone_number);

    // Return success response
    const response = NextResponse.json({
      success: true,
      message: "Sign in successful",
      token,
      user: {
        id: user.id,
        phone_number: user.phone_number,
      },
    });

    // Set the token in cookies
    response.headers.set(
      "Set-Cookie",
      `auth_token=${token}; Path=/; Max-Age=${
        29 * 24 * 60 * 60
      }; SameSite=None; Secure`
    );

    return response;
  } catch (error) {
    console.error("Sign in error:", error);
    return NextResponse.json(
      { message: "An error occurred during sign in" },
      { status: 500 }
    );
  }
}
