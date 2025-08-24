import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// 获取用户的所有收藏
export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    // 获取当前会话
    const session = await getServerSession(authOptions);
    
    // 检查用户是否有权限访问
    if (!session || (session.user.id !== params.userId && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // 获取用户的所有收藏关联
    const userCollections = await prisma.userCollection.findMany({
      where: {
        userId: params.userId
      },
      include: {
        collection: true
      }
    });
    
    // 返回收藏列表
    const collections = userCollections.map(uc => ({
      ...uc.collection,
      isOwner: uc.isOwner,
      canEdit: uc.canEdit
    }));
    
    return NextResponse.json(collections);
  } catch (error) {
    console.error("Get user collections error:", error);
    return NextResponse.json({ error: "Failed to get user collections" }, { status: 500 });
  }
}

// 为用户添加收藏
export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    // 获取当前会话
    const session = await getServerSession(authOptions);
    
    // 检查用户是否有权限访问
    if (!session || (session.user.id !== params.userId && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { collectionId, isOwner = false, canEdit = false } = await request.json();
    
    // 检查关联是否已存在
    const existing = await prisma.userCollection.findUnique({
      where: {
        userId_collectionId: {
          userId: params.userId,
          collectionId: collectionId
        }
      }
    });
    
    if (existing) {
      return NextResponse.json({ error: "Collection already associated with user" }, { status: 400 });
    }
    
    // 创建用户收藏关联
    const userCollection = await prisma.userCollection.create({
      data: {
        userId: params.userId,
        collectionId: collectionId,
        isOwner: isOwner,
        canEdit: canEdit
      }
    });
    
    return NextResponse.json(userCollection);
  } catch (error) {
    console.error("Add collection to user error:", error);
    return NextResponse.json({ error: "Failed to add collection to user" }, { status: 500 });
  }
}

// 更新用户收藏关联
export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    // 获取当前会话
    const session = await getServerSession(authOptions);
    
    // 检查用户是否有权限访问
    if (!session || (session.user.id !== params.userId && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { collectionId, isOwner, canEdit } = await request.json();
    
    // 更新用户收藏关联
    const userCollection = await prisma.userCollection.update({
      where: {
        userId_collectionId: {
          userId: params.userId,
          collectionId: collectionId
        }
      },
      data: {
        isOwner,
        canEdit
      }
    });
    
    return NextResponse.json(userCollection);
  } catch (error) {
    console.error("Update user collection error:", error);
    return NextResponse.json({ error: "Failed to update user collection" }, { status: 500 });
  }
}

// 删除用户收藏关联
export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    // 获取当前会话
    const session = await getServerSession(authOptions);
    
    // 检查用户是否有权限访问
    if (!session || (session.user.id !== params.userId && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');
    
    if (!collectionId) {
      return NextResponse.json({ error: "Collection ID is required" }, { status: 400 });
    }
    
    // 删除用户收藏关联
    await prisma.userCollection.delete({
      where: {
        userId_collectionId: {
          userId: params.userId,
          collectionId: collectionId
        }
      }
    });
    
    return NextResponse.json({ message: "Collection removed from user" });
  } catch (error) {
    console.error("Remove collection from user error:", error);
    return NextResponse.json({ error: "Failed to remove collection from user" }, { status: 500 });
  }
}