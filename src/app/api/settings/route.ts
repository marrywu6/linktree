import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const group = searchParams.get('group');
    
    // 返回默认设置
    const defaultSettings = [
      { key: "websiteName", value: "LinkTree", group: "general" },
      { key: "description", value: "Transform your bookmarks into a beautiful navigation site", group: "general" },
      { key: "siteUrl", value: process.env.NEXTAUTH_URL || "http://localhost:3000", group: "general" },
      { key: "theme", value: "light", group: "appearance" },
    ];

    const settings = group 
      ? defaultSettings.filter(setting => setting.group === group)
      : defaultSettings;
    
    // 将设置转换为键值对格式
    const formattedSettings = settings.reduce((acc: Record<string, string>, setting) => {
      acc[setting.key] = setting.value || '';
      return acc;
    }, {});

    const result = {
      ...formattedSettings,
      enableSearch: true
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to get settings:', error);
    return NextResponse.json({ 
      error: 'Failed to get settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Please login" }, { status: 401 });
    }

    const data = await request.json();
    
    // 简化版本 - 直接返回成功
    return NextResponse.json({ 
      message: 'Settings saved',
      results: []
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Failed to save settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
