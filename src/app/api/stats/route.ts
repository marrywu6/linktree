import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 获取统计数据
    const [
      totalBookmarks,
      totalFolders,
      // 这里可以添加更多统计查询
    ] = await Promise.all([
      prisma.bookmark.count(),
      prisma.folder.count(),
    ]);

    // TODO: 实现链接有效性检测
    // 这里可以添加定期检查书签链接有效性的逻辑
    const validLinks = totalBookmarks;  // 简化统计
    const brokenLinks = 0; // 临时值

    return NextResponse.json({
      success: true,
      data: {
        totalBookmarks,
        totalFolders,
        validLinks,
        brokenLinks,
      }
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}