import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  parseBookmarksFile, 
  validateBookmarkUrl, 
  cleanBookmarkTitle,
  organizeBookmarksByFolder 
} from '@/lib/utils/bookmark-parser';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    return new Response('请选择要导入的文件', { status: 400 });
  }

  // 设置 Server-Sent Events 响应头
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  });

  const stream = new ReadableStream({
    async start(controller) {
      const sendProgress = (data: any) => {
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      };

      try {
        sendProgress({ type: 'progress', message: '正在解析文件...', progress: 5 });

        // 读取并解析文件
        const content = await file.text();
        const parsedBookmarks = parseBookmarksFile(content, file.name);
        
        if (parsedBookmarks.length === 0) {
          sendProgress({ type: 'error', message: '文件中没有找到有效的书签' });
          controller.close();
          return;
        }

        sendProgress({ 
          type: 'progress', 
          message: `发现 ${parsedBookmarks.length} 个书签`, 
          progress: 10 
        });

        // 组织书签数据
        const organizedBookmarks = organizeBookmarksByFolder(parsedBookmarks);
        const totalBookmarks = parsedBookmarks.length;
        
        let processedCount = 0;
        let importedCount = 0;
        let skippedCount = 0;
        let foldersCreated = 0;
        const errors: string[] = [];

        sendProgress({ 
          type: 'progress', 
          message: '开始创建文件夹结构...', 
          progress: 15 
        });

        // 创建文件夹映射
        const folderMap = new Map<string, string>();

        // 首先创建所有文件夹
        for (const [folderPath] of Object.entries(organizedBookmarks)) {
          if (folderPath !== '默认收藏') {
            const pathParts = folderPath.split('/');
            let currentPath = '';
            let parentId: string | null = null;

            for (const part of pathParts) {
              currentPath = currentPath ? `${currentPath}/${part}` : part;
              
              if (!folderMap.has(currentPath)) {
                try {
                  const existingFolder = await prisma.folder.findFirst({
                    where: {
                      name: part,
                      parentId,
                    }
                  }) as { id: string } | null;

                  if (existingFolder) {
                    folderMap.set(currentPath, existingFolder.id);
                    parentId = existingFolder.id;
                  } else {
                    const newFolder = await prisma.folder.create({
                      data: {
                        name: part,
                        parentId,
                        sortOrder: 0,
                      }
                    }) as { id: string };
                    
                    folderMap.set(currentPath, newFolder.id);
                    parentId = newFolder.id;
                    foldersCreated++;

                    sendProgress({ 
                      type: 'progress', 
                      message: `创建文件夹: ${part}`, 
                      progress: 15 + (foldersCreated * 10 / Object.keys(organizedBookmarks).length)
                    });
                  }
                } catch (error) {
                  console.error(`Error creating folder ${part}:`, error);
                  errors.push(`创建文件夹失败: ${part}`);
                }
              } else {
                parentId = folderMap.get(currentPath)!;
              }
            }
          }
        }

        sendProgress({ 
          type: 'progress', 
          message: '开始导入书签...', 
          progress: 25 
        });

        // 导入书签
        for (const [folderPath, bookmarks] of Object.entries(organizedBookmarks)) {
          const folderId = folderPath === '默认收藏' ? null : folderMap.get(folderPath);

          // 分批处理书签
          const batchSize = 20;
          for (let i = 0; i < bookmarks.length; i += batchSize) {
            const bookmarkBatch = bookmarks.slice(i, i + batchSize);
            
            try {
              await prisma.$transaction(async (tx) => {
                for (const bookmark of bookmarkBatch) {
                  try {
                    const cleanUrl = validateBookmarkUrl(bookmark.url);
                    if (!cleanUrl) {
                      skippedCount++;
                      continue;
                    }

                    const cleanTitle = cleanBookmarkTitle(bookmark.title);
                    if (!cleanTitle) {
                      skippedCount++;
                      continue;
                    }

                    // 检查是否已存在
                    const existingBookmark = await tx.bookmark.findFirst({
                      where: { url: cleanUrl }
                    }) as { id: string } | null;

                    if (existingBookmark) {
                      skippedCount++;
                    } else {
                      await tx.bookmark.create({
                        data: {
                          title: cleanTitle,
                          url: cleanUrl,
                          description: bookmark.folder !== '默认收藏' ? `来自 ${bookmark.folder}` : null,
                          icon: bookmark.icon,
                          folderId,
                          sortOrder: importedCount,
                          isFeatured: false,
                        }
                      });
                      importedCount++;
                    }

                    processedCount++;
                    
                    // 每处理5个书签发送一次进度更新
                    if (processedCount % 5 === 0) {
                      const progress = 25 + (processedCount / totalBookmarks) * 70;
                      sendProgress({ 
                        type: 'progress', 
                        message: `已处理 ${processedCount}/${totalBookmarks} 个书签`, 
                        progress: Math.round(progress),
                        stats: { processed: processedCount, imported: importedCount, skipped: skippedCount }
                      });
                    }
                  } catch (error) {
                    skippedCount++;
                    errors.push(`导入失败: ${bookmark.title}`);
                  }
                }
              }, {
                maxWait: 8000,
                timeout: 12000,
              });
            } catch (error) {
              console.error('Batch error:', error);
              skippedCount += bookmarkBatch.length;
            }
          }
        }

        // 发送完成结果
        sendProgress({
          type: 'complete',
          message: '导入完成！',
          progress: 100,
          result: {
            totalProcessed: totalBookmarks,
            imported: importedCount,
            skipped: skippedCount,
            foldersCreated,
            errors: errors.slice(0, 10)
          }
        });

      } catch (error) {
        console.error('Import error:', error);
        sendProgress({ 
          type: 'error', 
          message: error instanceof Error ? error.message : '导入失败' 
        });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, { headers });
}