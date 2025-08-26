import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  parseBookmarksFile, 
  validateBookmarkUrl, 
  cleanBookmarkTitle,
  organizeBookmarksByFolder 
} from '@/lib/utils/bookmark-parser';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const collectionId = formData.get('collectionId') as string;
    const createFolders = formData.get('createFolders') === 'true';
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: '请选择要导入的文件' },
        { status: 400 }
      );
    }

    if (!collectionId) {
      return NextResponse.json(
        { success: false, error: '请选择目标分类' },
        { status: 400 }
      );
    }

    // 验证分类是否存在
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId }
    });

    if (!collection) {
      return NextResponse.json(
        { success: false, error: '指定的分类不存在' },
        { status: 404 }
      );
    }

    // 读取文件内容
    const content = await file.text();
    
    // 解析书签文件
    const parsedBookmarks = parseBookmarksFile(content, file.name);
    
    if (parsedBookmarks.length === 0) {
      return NextResponse.json(
        { success: false, error: '文件中没有找到有效的书签' },
        { status: 400 }
      );
    }

    // 组织书签数据
    const organizedBookmarks = organizeBookmarksByFolder(parsedBookmarks);
    
    let importedCount = 0;
    let skippedCount = 0;
    let foldersCreated = 0;
    const errors: string[] = [];

    // 开始导入过程 - 分步处理避免长事务问题
    const folderMap = new Map<string, string>(); // 文件夹路径 -> 文件夹ID

    for (const [folderPath, bookmarks] of Object.entries(organizedBookmarks)) {
      let folderId: string | null = null;

      // 创建文件夹（如果需要且不存在）
      if (createFolders && folderPath !== '默认收藏') {
        // 处理嵌套文件夹路径
        const pathParts = folderPath.split('/');
        let currentPath = '';
        let parentId: string | null = null;

        for (const part of pathParts) {
          currentPath = currentPath ? `${currentPath}/${part}` : part;
          
          if (!folderMap.has(currentPath)) {
            try {
              // 检查文件夹是否已存在 - 不在事务中
              const existingFolder = await prisma.folder.findFirst({
                where: {
                  name: part,
                  collectionId,
                  parentId,
                }
              }) as { id: string } | null;

              if (existingFolder) {
                folderMap.set(currentPath, existingFolder.id);
                parentId = existingFolder.id;
              } else {
                // 创建新文件夹 - 不在事务中
                const newFolder = await prisma.folder.create({
                  data: {
                    name: part,
                    collectionId,
                    parentId,
                    sortOrder: 0,
                  }
                }) as { id: string };
                
                folderMap.set(currentPath, newFolder.id);
                parentId = newFolder.id;
                foldersCreated++;
              }
            } catch (folderError) {
              console.error(`Error handling folder ${part}:`, folderError);
              errors.push(`创建文件夹失败: ${part} - ${folderError instanceof Error ? folderError.message : '未知错误'}`);
              continue;
            }
          } else {
            parentId = folderMap.get(currentPath)!;
          }
        }
        
        folderId = parentId;
      }

      // 分批导入书签，每批50个
      const batchSize = 50;
      for (let i = 0; i < bookmarks.length; i += batchSize) {
        const bookmarkBatch = bookmarks.slice(i, i + batchSize);
        
        try {
          // 使用较短的事务处理每批书签
          await prisma.$transaction(async (tx) => {
            for (const bookmark of bookmarkBatch) {
              try {
                // 验证URL
                const cleanUrl = validateBookmarkUrl(bookmark.url);
                if (!cleanUrl) {
                  skippedCount++;
                  errors.push(`无效URL: ${bookmark.url}`);
                  continue;
                }

                // 清理标题
                const cleanTitle = cleanBookmarkTitle(bookmark.title);
                if (!cleanTitle) {
                  skippedCount++;
                  errors.push(`无效标题: ${bookmark.title}`);
                  continue;
                }

                // 检查是否已存在相同URL的书签
                const existingBookmark = await tx.bookmark.findFirst({
                  where: {
                    url: cleanUrl,
                    collectionId,
                  }
                }) as { id: string } | null;

                if (existingBookmark) {
                  skippedCount++;
                  continue;
                }

                // 创建书签
                await tx.bookmark.create({
                  data: {
                    title: cleanTitle,
                    url: cleanUrl,
                    description: bookmark.folder !== '默认收藏' ? `来自 ${bookmark.folder}` : null,
                    icon: bookmark.icon,
                    collectionId,
                    folderId,
                    sortOrder: importedCount,
                    isFeatured: false,
                  }
                });

                importedCount++;
              } catch (bookmarkError) {
                skippedCount++;
                errors.push(`导入失败: ${bookmark.title} - ${bookmarkError instanceof Error ? bookmarkError.message : '未知错误'}`);
              }
            }
          }, {
            maxWait: 10000, // 10秒最大等待
            timeout: 15000, // 15秒超时
          });
        } catch (batchError) {
          console.error(`Error processing batch ${i / batchSize + 1}:`, batchError);
          // 如果批处理失败，跳过这一批
          skippedCount += bookmarkBatch.length;
          errors.push(`批处理失败 (第${i / batchSize + 1}批): ${batchError instanceof Error ? batchError.message : '未知错误'}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalProcessed: parsedBookmarks.length,
        imported: importedCount,
        skipped: skippedCount,
        foldersCreated,
        errors: errors.slice(0, 10), // 只返回前10个错误
      }
    });

  } catch (error) {
    console.error('Error importing bookmarks:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '导入失败，请检查文件格式' 
      },
      { status: 500 }
    );
  }
}