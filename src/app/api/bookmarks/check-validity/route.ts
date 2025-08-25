import { NextRequest, NextResponse } from 'next/server';

// 检查单个URL的有效性
async function checkUrlValidity(url: string): Promise<{ valid: boolean; status: number; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

    const response = await fetch(url, {
      method: 'HEAD', // 使用HEAD请求减少带宽
      signal: controller.signal,
      headers: {
        'User-Agent': 'BookmarkTree/1.0 (+https://your-domain.com)',
      },
    });

    clearTimeout(timeoutId);

    return {
      valid: response.ok,
      status: response.status,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        valid: false,
        status: 0,
        error: error.message,
      };
    }
    return {
      valid: false,
      status: 0,
      error: 'Unknown error',
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { urls } = await request.json();
    
    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json(
        { success: false, error: 'Invalid URLs provided' },
        { status: 400 }
      );
    }

    // 批量检查URL有效性
    const results = await Promise.allSettled(
      urls.map(async (url: string) => {
        const result = await checkUrlValidity(url);
        return { url, ...result };
      })
    );

    const checkedUrls = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          url: urls[index],
          valid: false,
          status: 0,
          error: result.reason?.message || 'Check failed',
        };
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        total: urls.length,
        valid: checkedUrls.filter(r => r.valid).length,
        invalid: checkedUrls.filter(r => !r.valid).length,
        results: checkedUrls,
      }
    });

  } catch (error) {
    console.error('Error checking URL validity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check URL validity' },
      { status: 500 }
    );
  }
}

// 获取所有书签的URL进行检查
export async function GET() {
  try {
    const { prisma } = await import('@/lib/prisma');
    
    // 获取所有书签URL
    const bookmarks = await prisma.bookmark.findMany({
      select: {
        id: true,
        url: true,
        title: true,
      },
    });

    // 提取所有URL
    const urls = bookmarks.map(bookmark => bookmark.url);
    
    if (urls.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          total: 0,
          valid: 0,
          invalid: 0,
          results: [],
        }
      });
    }

    // 分批检查，避免一次性检查太多URL
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < urls.length; i += batchSize) {
      batches.push(urls.slice(i, i + batchSize));
    }

    const allResults = [];
    
    for (const batch of batches) {
      const batchResults = await Promise.allSettled(
        batch.map(async (url: string) => {
          const bookmark = bookmarks.find(b => b.url === url);
          const result = await checkUrlValidity(url);
          return { 
            id: bookmark?.id,
            title: bookmark?.title,
            url, 
            ...result 
          };
        })
      );

      const processedBatch = batchResults.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          const bookmark = bookmarks.find(b => b.url === batch[index]);
          return {
            id: bookmark?.id,
            title: bookmark?.title,
            url: batch[index],
            valid: false,
            status: 0,
            error: result.reason?.message || 'Check failed',
          };
        }
      });

      allResults.push(...processedBatch);
      
      // 添加延迟避免过快请求
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        total: urls.length,
        valid: allResults.filter(r => r.valid).length,
        invalid: allResults.filter(r => !r.valid).length,
        results: allResults,
      }
    });

  } catch (error) {
    console.error('Error checking bookmark validity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check bookmark validity' },
      { status: 500 }
    );
  }
}