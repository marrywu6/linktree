import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const folders = await prisma.folder.findMany({
      include: {
        children: {
          include: {
            children: true,
            bookmarks: true,
          },
        },
        bookmarks: true,
        _count: {
          select: {
            bookmarks: true,
          },
        },
      },
      where: {
        parentId: null, // 只获取顶级文件夹
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: folders,
    });
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json(
      { success: false, error: '获取文件夹失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, parentId, icon } = await request.json();

    if (!name) {
      return NextResponse.json(
        { success: false, error: '文件夹名称不能为空' },
        { status: 400 }
      );
    }

    // 如果指定了parentId,验证父文件夹是否存在
    if (parentId) {
      const parentFolder = await prisma.folder.findUnique({
        where: { id: parentId }
      });

      if (!parentFolder) {
        return NextResponse.json(
          { success: false, error: '父文件夹不存在' },
          { status: 400 }
        );
      }
    }

    const folder = await prisma.folder.create({
      data: {
        name,
        parentId: parentId || null,
        icon,
        sortOrder: 0,
      },
    });

    return NextResponse.json({
      success: true,
      data: folder,
    });
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { success: false, error: '创建文件夹失败' },
      { status: 500 }
    );
  }
}
