import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

interface UserUpdateData {
  hasLifetimeAccess?: boolean;
}

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();
    
    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: {
        email
      }
    });
    
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "user"
      }
    });
    
    // 返回用户信息（不包括密码）
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
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

// 获取所有用户（仅管理员）
export async function GET(request: Request) {
  try {
    // 这里应该添加管理员权限验证
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        hasLifetimeAccess: true,
        createdAt: true
      }
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ error: "Failed to get users" }, { status: 500 });
  }
}