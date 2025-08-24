import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface UserUpdateData {
  hasLifetimeAccess?: boolean;
}

// 删除用户（仅管理员）
export async function DELETE(request: Request, { params }: { params: { userId: string } }) {
  try {
    const userId = params.userId;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // 删除用户
    await prisma.user.delete({
      where: {
        id: userId
      }
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

// 更新用户信息（仅管理员）
export async function PATCH(request: Request, { params }: { params: { userId: string } }) {
  try {
    const userId = params.userId;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const data: UserUpdateData = await request.json();

    // 更新用户
    const user = await prisma.user.update({
      where: {
        id: userId
      },
      data
    });

    // 返回用户信息
    return NextResponse.json(user);
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}