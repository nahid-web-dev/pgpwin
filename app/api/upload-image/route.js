import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/app/lib/cloudinary";
import { getCurrentUser } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    // try to get current user id for folder organization
    const currentUser = await getCurrentUser();
    const userId = currentUser?.userId ?? currentUser?.userId ?? null;

    // create a safe file name
    const timestamp = Date.now();
    const safeName = `${timestamp}-${file.name?.replace(
      /[^a-z0-9.\-_]/gi,
      ""
    )}`;

    const url = await uploadToCloudinary(file, userId ?? "uploads", safeName);

    return NextResponse.json({ success: true, url }, { status: 200 });
  } catch (error) {
    console.error("Upload image error:", error);
    return NextResponse.json(
      { success: false, message: "Upload failed" },
      { status: 500 }
    );
  }
}
