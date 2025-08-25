import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    // 测试数据库连接
    await prisma.$connect();
    
    // 检查是否已有用户
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return NextResponse.json(
        { success: false, error: '系统已经初始化，无法重复创建管理员账户' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: '邮箱和密码不能为空' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: '密码长度至少为6位' },
        { status: 400 }
      );
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12);

    // 创建管理员用户
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || '管理员',
        role: 'admin',
        hasLifetimeAccess: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: '管理员账户创建成功！',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Setup error:', error);
    
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    const errorDetails = {
      message: errorMessage,
      code: (error as any)?.code,
      meta: (error as any)?.meta,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(
      { 
        success: false, 
        error: '创建管理员账户失败',
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 获取系统设置状态
export async function GET() {
  try {
    // 首先测试数据库连接
    await prisma.$connect();
    
    const userCount = await prisma.user.count();
    const isSetup = userCount > 0;

    return NextResponse.json({
      success: true,
      data: {
        isSetup,
        userCount,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get setup status error:', error);
    
    // 返回更详细的错误信息用于调试
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    const errorDetails = {
      message: errorMessage,
      code: (error as any)?.code,
      meta: (error as any)?.meta,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(
      { 
        success: false, 
        error: '获取设置状态失败',
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}