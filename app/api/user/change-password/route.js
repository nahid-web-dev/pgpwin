import { prisma } from "@/app/lib/prisma";
import { getCurrentUser, comparePasswords, hashPassword } from "@/app/lib/auth";

export async function POST(request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return Response.json(
        { message: "Current password and new password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
    });

    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    // Verify current password
    const isValidPassword = await comparePasswords(
      currentPassword,
      user.password
    );
    if (!isValidPassword) {
      return Response.json(
        { message: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    return Response.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password change error:", error);
    return Response.json(
      { message: "An error occurred while changing password" },
      { status: 500 }
    );
  }
}
