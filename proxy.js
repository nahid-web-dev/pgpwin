// app/proxy.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET;

export default async function Proxy(req) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL(`/auth/login`, req.url));
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.headers.set("x-user-id", decoded.userId);
    return NextResponse.next();
  } catch (err) {
    console.error("Unauthorized access:", err);
    return NextResponse.redirect(
      new URL(`/auth?redirect_url${pathname}`, req.url)
    );
  }
}

// Only run this middleware on protected routes
export const config = {
  matcher: [
    "/account/:path*", // all pages under /profile
    "/wallet/:path*", // all pages under /profile
    "/game/:path",
    "/game/:path/:path",
    "/torrospins-provider/:path",
    "/torrospins-game/:path",
    "/support",
  ],
};
