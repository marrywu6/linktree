import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ip, userAgent, path } = body;
    
    // 简单的日志记录（在实际应用中可能需要存储到数据库或日志文件）
    console.log(`[访问日志] IP: ${ip} | UA: ${userAgent} | Path: ${path} | Time: ${new Date().toISOString()}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Access log error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}