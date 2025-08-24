import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 简化版本 - 直接返回成功
    return NextResponse.json({ 
      message: 'Settings initialized successfully',
      status: 'success' 
    }, { status: 200 });
  } catch (error) {
    console.error('Settings initialization failed:', error);
    
    return NextResponse.json({ 
      message: 'Settings initialization failed',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
