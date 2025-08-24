import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // 获取客户端IP
  const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            request.ip ||
            'unknown';
  
  // 获取User-Agent
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // 获取请求路径
  const path = request.nextUrl.pathname;
  
  // 记录访问日志
  try {
    await fetch(`${request.nextUrl.origin}/api/access-log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ip,
        userAgent,
        path,
      }),
    });
  } catch (error) {
    console.error('Failed to record access log:', error);
  }
  
  return response;
}

export const config = {
  matcher: '/:path*',
}