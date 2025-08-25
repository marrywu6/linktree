import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 基本环境信息
    const envInfo = {
      nodeEnv: process.env.NODE_ENV,
      isVercel: !!process.env.VERCEL,
      vercelEnv: process.env.VERCEL_ENV,
      databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing',
      nextAuthUrl: process.env.NEXTAUTH_URL || 'not set',
      nextAuthSecret: process.env.NEXTAUTH_SECRET ? 'configured' : 'missing',
      githubOAuth: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
      timestamp: new Date().toISOString()
    };

    // 测试数据库连接
    let dbStatus = 'unknown';
    let dbError = null;
    let userCount = 0;
    let tables = [];
    
    try {
      await prisma.$connect();
      
      // 检查表是否存在
      const result = await prisma.$queryRaw`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ` as any[];
      
      tables = result.map((row: any) => row.table_name);
      
      if (tables.includes('User')) {
        userCount = await prisma.user.count();
        dbStatus = 'connected_with_data';
      } else {
        dbStatus = 'connected_no_tables';
      }
      
    } catch (error) {
      dbStatus = 'connection_failed';
      dbError = error instanceof Error ? error.message : String(error);
    } finally {
      await prisma.$disconnect();
    }

    return NextResponse.json({
      success: true,
      environment: envInfo,
      database: {
        status: dbStatus,
        error: dbError,
        userCount,
        tables,
        needsMigration: !tables.includes('User')
      }
    });
    
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Health check failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// 初始化数据库表结构
export async function POST() {
  try {
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        success: false,
        error: '仅在生产环境允许此操作'
      }, { status: 403 });
    }

    await prisma.$connect();
    
    // 运行数据库推送来创建表结构
    // 注意：在生产环境中，这通常应该通过 CI/CD 管道完成
    console.log('Initializing database schema...');
    
    // 检查是否已有表结构
    const result = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ` as any[];
    
    const tables = result.map((row: any) => row.table_name);
    
    if (tables.length > 0) {
      return NextResponse.json({
        success: false,
        error: '数据库已初始化',
        tables
      });
    }

    return NextResponse.json({
      success: true,
      message: '请使用 Vercel CLI 或部署钩子运行数据库迁移',
      instructions: [
        'vercel env pull',
        'npx prisma db push',
        '或在 Vercel 仪表板配置构建命令: prisma generate && prisma db push && next build'
      ]
    });
    
  } catch (error) {
    console.error('Database init error:', error);
    return NextResponse.json({
      success: false,
      error: '数据库初始化失败',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}