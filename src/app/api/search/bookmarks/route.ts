export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function getSearchWhereClause(query: string, folderId: string | null) {
  const baseConditions = {
    OR: [
      { title: { contains: query } },
      { description: { contains: query } },
      { url: { contains: query } }
    ]
  };

  if (folderId) {
    return {
      AND: [
        baseConditions,
        { folderId: folderId }
      ]
    };
  }

  return baseConditions;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get("q");
    const folderId = searchParams.get("folderId");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "100");
    const skip = (page - 1) * pageSize;

    if (!query) {
      return NextResponse.json({ 
        success: true,
        data: [], 
        total: 0 
      });
    }

    const whereClause = getSearchWhereClause(query, folderId);

    const [total, bookmarks] = await Promise.all([
      prisma.bookmark.count({
        where: whereClause
      }),
      prisma.bookmark.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        include: {
          folder: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
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
    console.error("Search bookmarks failed:", error);
    return NextResponse.json(
      { success: false, error: "搜索书签失败" },
      { status: 500 }
    );
  }
}
