"use client";

import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface FileSystemItem {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileSystemItem[];
  size?: number;
  extension?: string;
}

interface FileExplorerProps {
  data: FileSystemItem[];
  className?: string;
  onFileClick?: (item: FileSystemItem) => void;
  onFolderClick?: (item: FileSystemItem) => void;
  showSearch?: boolean;
}

// 文件类型图标映射
const getFileIcon = (extension: string = '') => {
  const iconMap: { [key: string]: string } = {
    js: '🟨',
    ts: '🔷',
    tsx: '⚛️',
    jsx: '⚛️',
    vue: '💚',
    json: '📋',
    md: '📝',
    html: '🌐',
    css: '🎨',
    scss: '🎨',
    less: '🎨',
    png: '🖼️',
    jpg: '🖼️',
    jpeg: '🖼️',
    gif: '🖼️',
    svg: '🎭',
    pdf: '📄',
    txt: '📄',
    yml: '⚙️',
    yaml: '⚙️',
    lock: '🔒',
    gitignore: '👁️‍🗨️',
  };
  
  return iconMap[extension.toLowerCase()] || '📄';
};

// 递归组件用于渲染文件树
interface FileTreeItemProps {
  item: FileSystemItem;
  level: number;
  onFileClick?: (item: FileSystemItem) => void;
  onFolderClick?: (item: FileSystemItem) => void;
  searchTerm: string;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({ 
  item, 
  level, 
  onFileClick, 
  onFolderClick,
  searchTerm 
}) => {
  const [isExpanded, setIsExpanded] = useState(level < 2); // 默认展开前两层
  const indentWidth = level * 20;

  // 搜索高亮
  const isHighlighted = searchTerm && item.name.toLowerCase().includes(searchTerm.toLowerCase());
  
  // 如果有搜索词，只显示匹配的项目
  const shouldShow = !searchTerm || isHighlighted || 
    (item.children && item.children.some(child => 
      child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (child.children && hasMatchingChildren(child, searchTerm))
    ));

  if (!shouldShow) return null;

  const handleClick = () => {
    if (item.type === 'folder') {
      setIsExpanded(!isExpanded);
      onFolderClick?.(item);
    } else {
      onFileClick?.(item);
    }
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer rounded transition-colors",
          isHighlighted && "bg-yellow-100 hover:bg-yellow-200"
        )}
        style={{ paddingLeft: `${indentWidth + 8}px` }}
        onClick={handleClick}
      >
        {item.type === 'folder' && (
          <div className="mr-1 text-gray-500">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        )}
        
        <div className="mr-2 text-lg">
          {item.type === 'folder' ? (
            isExpanded ? <FolderOpen className="h-4 w-4 text-blue-500" /> : <Folder className="h-4 w-4 text-blue-600" />
          ) : (
            <span>{getFileIcon(item.extension)}</span>
          )}
        </div>
        
        <span className={cn(
          "text-sm flex-1 truncate",
          item.type === 'folder' ? "font-medium text-gray-800" : "text-gray-700",
          isHighlighted && "font-semibold"
        )}>
          {item.name}
        </span>
        
        {item.type === 'file' && item.size && (
          <span className="text-xs text-gray-500 ml-2">
            {formatFileSize(item.size)}
          </span>
        )}
      </div>
      
      {item.type === 'folder' && item.children && isExpanded && (
        <div>
          {item.children.map((child, index) => (
            <FileTreeItem
              key={`${child.path}-${index}`}
              item={child}
              level={level + 1}
              onFileClick={onFileClick}
              onFolderClick={onFolderClick}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// 辅助函数：检查子项是否有匹配的内容
const hasMatchingChildren = (item: FileSystemItem, searchTerm: string): boolean => {
  if (!item.children) return false;
  return item.children.some(child => 
    child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (child.children && hasMatchingChildren(child, searchTerm))
  );
};

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const FileExplorer: React.FC<FileExplorerProps> = ({
  data,
  className,
  onFileClick,
  onFolderClick,
  showSearch = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleFileClick = (item: FileSystemItem) => {
    console.log('File clicked:', item);
    onFileClick?.(item);
  };

  const handleFolderClick = (item: FileSystemItem) => {
    console.log('Folder clicked:', item);
    onFolderClick?.(item);
  };

  return (
    <div className={cn("bg-white border border-gray-200 rounded-lg overflow-hidden", className)}>
      {showSearch && (
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="搜索文件和文件夹..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
        </div>
      )}
      
      <div className="p-2 max-h-96 overflow-y-auto">
        {data.map((item, index) => (
          <FileTreeItem
            key={`${item.path}-${index}`}
            item={item}
            level={0}
            onFileClick={handleFileClick}
            onFolderClick={handleFolderClick}
            searchTerm={searchTerm}
          />
        ))}
      </div>
    </div>
  );
};

// 导出文件系统数据类型
export type { FileSystemItem };