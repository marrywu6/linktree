import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "100");
    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where = folderId ? { folderId } : {};

    // 使用 Promise.all 并行执行查询
    const [total, bookmarks] = await Promise.all([
      // 获取总数
      prisma.bookmark.count({ where }),
      // 获取分页数据
      prisma.bookmark.findMany({
        where,
        select: {
          id: true,
          title: true,
          url: true,
          description: true,
          icon: true,
          isFeatured: true,
          createdAt: true,
          folder: {
            select: {
              name: true,
            },
          },
        },
        skip,
        take: pageSize,
        orderBy: {
          updatedAt: "desc",
        },
      })
    ]);

    return NextResponse.json({
      success: true,
      data: bookmarks,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / pageSize)
    });

  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json(
      { success: false, error: '获取书签失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { title, url, description, icon, folderId, tags, isFeatured, sortOrder } = await request.json();

    // 验证必填字段
    if (!title || !url) {
      return NextResponse.json(
        { success: false, error: '标题和URL不能为空' },
        { status: 400 }
      );
    }

    // 创建书签的基础数据
    const bookmarkData = {
      title,
      url,
      description,
      icon,
      isFeatured: isFeatured ?? false,
      sortOrder: sortOrder ?? 0,
    };

    // 如果提供了有效的 folderId，则添加到数据中
    if (folderId && folderId !== "none") {
      // 验证文件夹是否存在
      const folder = await prisma.folder.findUnique({
        where: { id: folderId }
      });

      if (!folder) {
        return NextResponse.json(
          { success: false, error: '选择的文件夹不存在' },
          { status: 400 }
        );
      }

      Object.assign(bookmarkData, { folderId });
    }

    const bookmark = await prisma.bookmark.create({
      data: bookmarkData,
      include: {
        folder: {
          select: {
            name: true,
          },
        },
        tags: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: bookmark,
    });
  } catch (error) {
    console.error("Failed to create bookmark:", error);
    return NextResponse.json(
      { success: false, error: '创建书签失败，请检查所有字段是否正确' },
      { status: 500 }
    );
  }
}
