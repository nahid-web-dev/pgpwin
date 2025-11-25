import { prisma } from "@/app/lib/prisma";
import { hashPassword, generateToken } from "@/app/lib/auth";
import { NextResponse } from "next/server";
import axios from "axios";
import crypto from "crypto";

export async function POST(request) {
  try {
    const { username, phone_number, password, invited_by, fingerprint_id } =
      await request.json();

    // Get clean IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    console.log(ip);

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

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        phone_number,
        user_code: username,
        password: hashedPassword,
        invited_by,
        ip,
        fp_id: fingerprint_id,
      },
    });

    function generateUserResHash(data, SECRET_KEY) {
      let str = "";
      for (const key of Object.keys(data)) {
        if (key === "hash") continue;
        const value = data[key];
        if (typeof value === "object") continue;
        str += value === true ? "1" : value === false ? "0" : value || "";
      }
      str += SECRET_KEY;
      return crypto.createHash("md5").update(str).digest("hex");
    }

    // Torrospin user registration
    const userData = {
      casino_user_id: String(newUser.id),
      username: newUser.phone_number,
      hash: "",
    };

    userData.hash = generateUserResHash(
      userData,
      process.env.TORROSPIN_API_SECRET
    );

    const addUser = await axios.post(
      `${process.env.TORROSPIN_API_URL}/api/add/user`,
      userData,
      {
        headers: {
          "x-api-key": process.env.TORROSPIN_API_KEY,
        },
      }
    );

    console.log("addUser:", addUser.data);

    const token = generateToken(newUser.id, newUser.phone_number);

    const response = NextResponse.json({
      success: true,
      message: "Registration Successful!",
      token,
      user: {
        id: newUser.id,
        phone_number: newUser.phone_number,
      },
    });

    // Correct cookie method
    response.cookies.set("auth_token", token, {
      path: "/",
      maxAge: 29 * 24 * 60 * 60,
      sameSite: "none",
      secure: true,
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
