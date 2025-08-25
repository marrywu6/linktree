// 浏览器书签解析工具

interface BookmarkNode {
  title: string;
  url?: string;
  children?: BookmarkNode[];
  addDate?: number;
  iconUri?: string;
}

interface ParsedBookmark {
  title: string;
  url: string;
  icon?: string;
  addedAt?: Date;
  folder?: string;
}

// 解析Chrome/Firefox HTML格式的书签文件
export function parseBookmarksHtml(htmlContent: string): ParsedBookmark[] {
  const bookmarks: ParsedBookmark[] = [];
  
  try {
    // 服务器端需要使用JSDOM或者正则表达式解析
    // 使用正则表达式匹配书签链接
    const linkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
    const folderRegex = /<h3[^>]*>([^<]+)<\/h3>/gi;
    
    let folderPath = '默认收藏';
    let match;
    
    // 先提取文件夹结构
    const folderMatches = Array.from(htmlContent.matchAll(folderRegex));
    let currentFolderIndex = 0;
    
    // 提取所有链接
    while ((match = linkRegex.exec(htmlContent)) !== null) {
      const url = match[1];
      const title = match[2]?.trim();
      
      // 检查是否在新文件夹中
      if (currentFolderIndex < folderMatches.length) {
        const folderMatch = folderMatches[currentFolderIndex];
        if (folderMatch.index && match.index && folderMatch.index < match.index) {
          folderPath = folderMatch[1]?.trim() || '默认收藏';
          currentFolderIndex++;
        }
      }
      
      if (url && title && !url.startsWith('javascript:')) {
        bookmarks.push({
          title,
          url,
          folder: folderPath,
        });
      }
    }
    
  } catch (error) {
    console.error('Error parsing HTML bookmarks:', error);
    throw new Error('无法解析书签文件，请确保文件格式正确');
  }

  return bookmarks;
}

// 解析JSON格式的书签文件（Chrome书签导出）
export function parseBookmarksJson(jsonContent: string): ParsedBookmark[] {
  const bookmarks: ParsedBookmark[] = [];
  
  try {
    const data = JSON.parse(jsonContent);
    
    // Chrome书签JSON格式解析
    const parseNode = (node: any, folderPath = ''): void => {
      if (node.type === 'url' && node.url) {
        bookmarks.push({
          title: node.name || node.title || '未命名书签',
          url: node.url,
          addedAt: node.date_added ? new Date(parseInt(node.date_added) / 1000) : undefined,
          folder: folderPath || '默认收藏',
        });
      } else if (node.type === 'folder' && node.children) {
        const currentPath = folderPath ? `${folderPath}/${node.name}` : node.name;
        node.children.forEach((child: any) => parseNode(child, currentPath));
      }
    };

    // 解析书签栏
    if (data.roots) {
      Object.keys(data.roots).forEach(rootKey => {
        const root = data.roots[rootKey];
        if (root.children) {
          root.children.forEach((child: any) => parseNode(child, root.name || rootKey));
        }
      });
    } else if (Array.isArray(data)) {
      // 其他格式的JSON
      data.forEach((item: any) => parseNode(item));
    }
    
  } catch (error) {
    console.error('Error parsing JSON bookmarks:', error);
    throw new Error('无法解析JSON书签文件，请确保文件格式正确');
  }

  return bookmarks;
}

// 自动检测文件类型并解析
export function parseBookmarksFile(content: string, filename: string): ParsedBookmark[] {
  const extension = filename.toLowerCase().split('.').pop();
  
  if (extension === 'json') {
    return parseBookmarksJson(content);
  } else if (extension === 'html' || extension === 'htm') {
    return parseBookmarksHtml(content);
  } else {
    // 尝试自动检测
    const trimmedContent = content.trim();
    if (trimmedContent.startsWith('{') || trimmedContent.startsWith('[')) {
      return parseBookmarksJson(content);
    } else if (trimmedContent.toLowerCase().includes('<!doctype') || trimmedContent.toLowerCase().includes('<html')) {
      return parseBookmarksHtml(content);
    } else {
      throw new Error('无法识别文件格式，请上传HTML或JSON格式的书签文件');
    }
  }
}

// 验证和清理书签URL
export function validateBookmarkUrl(url: string): string | null {
  try {
    // 过滤掉不需要的协议
    const excludeProtocols = ['javascript:', 'data:', 'mailto:', 'tel:', 'file:'];
    if (excludeProtocols.some(protocol => url.toLowerCase().startsWith(protocol))) {
      return null;
    }

    // 确保URL有协议
    if (!url.match(/^https?:\/\//i)) {
      url = 'https://' + url;
    }

    // 验证URL格式
    const urlObj = new URL(url);
    return urlObj.href;
  } catch {
    return null;
  }
}

// 清理书签标题
export function cleanBookmarkTitle(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, ' ')  // 合并多个空格
    .substring(0, 200);    // 限制长度
}

// 生成文件夹层级结构
export function organizeBookmarksByFolder(bookmarks: ParsedBookmark[]): Record<string, ParsedBookmark[]> {
  const organized: Record<string, ParsedBookmark[]> = {};
  
  bookmarks.forEach(bookmark => {
    const folder = bookmark.folder || '默认收藏';
    if (!organized[folder]) {
      organized[folder] = [];
    }
    organized[folder].push(bookmark);
  });
  
  return organized;
}