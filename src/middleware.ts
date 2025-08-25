import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 检查是否是受保护的管理路径
  const isProtectedRoute = pathname.startsWith('/dashboard') || 
                          pathname.startsWith('/admin') ||
                          pathname.startsWith('/api/collections') ||
                          pathname.startsWith('/api/bookmarks') ||
                          pathname.startsWith('/api/folders');

  if (isProtectedRoute) {
    // 获取JWT token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    // 如果没有token，重定向到登录页
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 检查是否为管理员角色（对于敏感操作）
    if (pathname.startsWith('/admin') && token.role !== 'admin') {
      return NextResponse.json(
        { error: '权限不足，仅管理员可访问' },
        { status: 403 }
      );
    }
  }

  const response = NextResponse.next();
  
  // 获取客户端IP
  const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            request.ip ||
            'unknown';
  
  // 获取User-Agent
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // 记录访问日志（仅对非API路由）
  if (!pathname.startsWith('/api/')) {
    try {
      await fetch(`${request.nextUrl.origin}/api/access-log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ip,
          userAgent,
          path: pathname,
        }),
      });
    } catch (error) {
      console.error('Failed to record access log:', error);
    }
  }
  
  return response;
}

export const config = {
  matcher: '/:path*',
}