import { FileSystemItem } from '@/components/file-explorer';

/**
 * 从文件路径数组创建文件系统树结构
 * @param paths - 文件路径数组，例如 ['src/components/App.tsx', 'src/utils/helper.js']
 * @param rootName - 根目录名称，默认为 'root'
 * @returns FileSystemItem[]
 */
export function createFileSystemTree(paths: string[], rootName: string = 'root'): FileSystemItem[] {
  const root: FileSystemItem = {
    name: rootName,
    type: 'folder',
    path: '/',
    children: []
  };

  paths.forEach(path => {
    const parts = path.split('/').filter(Boolean);
    let currentNode = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1 && part.includes('.');
      const currentPath = '/' + parts.slice(0, index + 1).join('/');
      
      if (!currentNode.children) {
        currentNode.children = [];
      }

      let existingNode = currentNode.children.find(child => child.name === part);
      
      if (!existingNode) {
        const extension = isFile ? part.split('.').pop() || '' : undefined;
        
        existingNode = {
          name: part,
          type: isFile ? 'file' : 'folder',
          path: currentPath,
          extension,
          size: isFile ? Math.floor(Math.random() * 10000) + 100 : undefined, // 模拟文件大小
          children: isFile ? undefined : []
        };
        
        currentNode.children.push(existingNode);
      }
      
      if (!isFile) {
        currentNode = existingNode;
      }
    });
  });

  return root.children || [];
}

/**
 * 从扁平的文件列表创建文件系统树
 * @param files - 文件信息数组
 * @returns FileSystemItem[]
 */
export interface FileInfo {
  path: string;
  name: string;
  size?: number;
  type?: 'file' | 'folder';
}

export function createTreeFromFileList(files: FileInfo[]): FileSystemItem[] {
  const tree: FileSystemItem[] = [];
  const nodeMap = new Map<string, FileSystemItem>();

  // 确保所有路径都以文件夹节点存在
  files.forEach(file => {
    const pathParts = file.path.split('/').filter(Boolean);
    let currentPath = '';

    pathParts.forEach((part, index) => {
      const previousPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      
      if (!nodeMap.has(currentPath)) {
        const isFile = index === pathParts.length - 1 && file.type === 'file';
        const extension = isFile ? part.split('.').pop() : undefined;
        
        const node: FileSystemItem = {
          name: part,
          type: isFile ? 'file' : 'folder',
          path: '/' + currentPath,
          extension,
          size: isFile ? file.size : undefined,
          children: isFile ? undefined : []
        };

        nodeMap.set(currentPath, node);

        // 添加到父节点或根节点
        if (previousPath) {
          const parent = nodeMap.get(previousPath);
          if (parent && parent.children) {
            parent.children.push(node);
          }
        } else {
          tree.push(node);
        }
      }
    });
  });

  return tree;
}

/**
 * 扁平化文件树为路径列表
 * @param tree - 文件系统树
 * @returns 路径字符串数组
 */
export function flattenTree(tree: FileSystemItem[]): string[] {
  const paths: string[] = [];

  function traverse(items: FileSystemItem[]) {
    items.forEach(item => {
      paths.push(item.path);
      if (item.children) {
        traverse(item.children);
      }
    });
  }

  traverse(tree);
  return paths;
}

/**
 * 搜索文件树
 * @param tree - 文件系统树
 * @param searchTerm - 搜索词
 * @returns 匹配的项目数组
 */
export function searchTree(tree: FileSystemItem[], searchTerm: string): FileSystemItem[] {
  const results: FileSystemItem[] = [];

  function search(items: FileSystemItem[]) {
    items.forEach(item => {
      if (item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        results.push(item);
      }
      if (item.children) {
        search(item.children);
      }
    });
  }

  search(tree);
  return results;
}

/**
 * 获取文件扩展名对应的语言类型
 * @param extension - 文件扩展名
 * @returns 语言类型字符串
 */
export function getLanguageFromExtension(extension: string): string {
  const languageMap: { [key: string]: string } = {
    js: 'javascript',
    ts: 'typescript',
    jsx: 'javascript',
    tsx: 'typescript',
    vue: 'vue',
    html: 'html',
    css: 'css',
    scss: 'scss',
    less: 'less',
    json: 'json',
    md: 'markdown',
    py: 'python',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    php: 'php',
    rb: 'ruby',
    go: 'go',
    rs: 'rust',
    sh: 'bash',
    yml: 'yaml',
    yaml: 'yaml',
    xml: 'xml',
    sql: 'sql',
  };

  return languageMap[extension.toLowerCase()] || 'text';
}

/**
 * 统计文件系统树的信息
 * @param tree - 文件系统树
 * @returns 统计信息对象
 */
export interface TreeStats {
  totalFiles: number;
  totalFolders: number;
  totalSize: number;
  fileTypes: { [key: string]: number };
  maxDepth: number;
}

export function getTreeStats(tree: FileSystemItem[]): TreeStats {
  const stats: TreeStats = {
    totalFiles: 0,
    totalFolders: 0,
    totalSize: 0,
    fileTypes: {},
    maxDepth: 0
  };

  function analyze(items: FileSystemItem[], depth: number = 0) {
    stats.maxDepth = Math.max(stats.maxDepth, depth);
    
    items.forEach(item => {
      if (item.type === 'file') {
        stats.totalFiles++;
        stats.totalSize += item.size || 0;
        
        if (item.extension) {
          stats.fileTypes[item.extension] = (stats.fileTypes[item.extension] || 0) + 1;
        }
      } else {
        stats.totalFolders++;
        if (item.children) {
          analyze(item.children, depth + 1);
        }
      }
    });
  }

  analyze(tree);
  return stats;
}