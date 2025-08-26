import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.bookmark.delete({
      where: {
        id: params.id
      },
    });

    return NextResponse.json({ 
      success: true,
      message: "书签删除成功" 
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "删除书签失败" }, 
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const bookmark = await prisma.bookmark.update({
      where: {
        id: params.id,
      },
      data: {
        title: data.title,
        url: data.url,
        description: data.description,
        folderId: data.folderId,
        isFeatured: data.isFeatured,
        icon: data.icon,
      },
      include: {
        folder: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: bookmark,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "更新书签失败" }, 
      { status: 500 }
    );
  }
}

