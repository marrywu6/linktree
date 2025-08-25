import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    // 检查必要的环境变量
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          success: false,
          error: '数据库配置缺失',
          details: '请在 Vercel 环境变量中配置 DATABASE_URL'
        },
        { status: 500 }
      );
    }

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

    // 根据错误类型提供更具体的错误信息
    let errorMessage = '创建管理员账户失败';
    let details = {};

    if (error instanceof Error) {
      const errorStr = error.message.toLowerCase();

      if (errorStr.includes('connection') || errorStr.includes('connect')) {
        errorMessage = '数据库连接失败';
        details = {
          type: 'database_connection',
          suggestion: '请检查 DATABASE_URL 配置是否正确'
        };
      } else if (errorStr.includes('authentication') || errorStr.includes('auth')) {
        errorMessage = '数据库认证失败';
        details = {
          type: 'database_auth',
          suggestion: '请检查数据库用户名和密码'
        };
      } else if (errorStr.includes('does not exist')) {
        errorMessage = '数据库不存在';
        details = {
          type: 'database_not_found',
          suggestion: '请检查数据库名称和连接地址'
        };
      } else if (errorStr.includes('unique constraint')) {
        errorMessage = '邮箱已存在';
        details = {
          type: 'duplicate_email',
          suggestion: '请使用其他邮箱地址'
        };
      }
    }

    const errorDetails = {
      message: error instanceof Error ? error.message : '未知错误',
      code: (error as any)?.code,
      meta: (error as any)?.meta,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      ...details
    };

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
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
    // 检查必要的环境变量
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          success: false,
          error: '数据库配置缺失',
          details: '请在 Vercel 环境变量中配置 DATABASE_URL'
        },
        { status: 500 }
      );
    }

    // 测试数据库连接
    await prisma.$connect();

    const userCount = await prisma.user.count();
    const isSetup = userCount > 0;

    return NextResponse.json({
      success: true,
      data: {
        isSetup,
        userCount,
        environment: process.env.NODE_ENV,
        databaseConfigured: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get setup status error:', error);

    // 根据错误类型提供更具体的错误信息
    let errorMessage = '获取设置状态失败';
    let details = {};

    if (error instanceof Error) {
      const errorStr = error.message.toLowerCase();

      if (errorStr.includes('connection') || errorStr.includes('connect')) {
        errorMessage = '数据库连接失败';
        details = {
          type: 'database_connection',
          suggestion: '请检查 DATABASE_URL 配置是否正确'
        };
      } else if (errorStr.includes('authentication') || errorStr.includes('auth')) {
        errorMessage = '数据库认证失败';
        details = {
          type: 'database_auth',
          suggestion: '请检查数据库用户名和密码'
        };
      } else if (errorStr.includes('does not exist')) {
        errorMessage = '数据库不存在';
        details = {
          type: 'database_not_found',
          suggestion: '请检查数据库名称和连接地址'
        };
      }
    }

    const errorDetails = {
      message: error instanceof Error ? error.message : '未知错误',
      code: (error as any)?.code,
      meta: (error as any)?.meta,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      ...details
    };

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}