"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  FolderPlus, 
  Download, 
  Upload, 
  Search,
  Grid3X3,
  List,
  SortAsc,
  Filter,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface QuickActionsBarProps {
  onAddBookmark?: () => void;
  onAddFolder?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  sortBy?: 'name' | 'date' | 'url';
  onSortChange?: (sortBy: 'name' | 'date' | 'url') => void;
  showSearch?: boolean;
  onToggleSearch?: () => void;
}

export function QuickActionsBar({
  onAddBookmark,
  onAddFolder,
  onImport,
  onExport,
  viewMode = 'grid',
  onViewModeChange,
  sortBy = 'name',
  onSortChange,
  showSearch = false,
  onToggleSearch,
}: QuickActionsBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* 左侧主要操作 */}
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={onAddBookmark}
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            添加书签
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={onAddFolder}
            className="hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-700"
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            新建文件夹
          </Button>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

          {/* 导入导出 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="hover:bg-gray-100 dark:hover:bg-gray-800">
                <Upload className="w-4 h-4 mr-2" />
                导入/导出
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={onImport} className="flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                导入书签
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExport} className="flex items-center">
                <Download className="w-4 h-4 mr-2" />
                导出书签
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 右侧工具栏 */}
        <div className="flex items-center space-x-1">
          {/* 搜索切换 */}
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleSearch}
            className={cn(
              "hover:bg-gray-100 dark:hover:bg-gray-800",
              showSearch && "bg-gray-100 dark:bg-gray-800 text-primary"
            )}
          >
            <Search className="w-4 h-4" />
          </Button>

          {/* 视图模式切换 */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              onClick={() => onViewModeChange?.('grid')}
              className={cn(
                "h-8 w-8 p-0",
                viewMode === 'grid' 
                  ? "bg-white dark:bg-gray-700 shadow-sm" 
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              onClick={() => onViewModeChange?.('list')}
              className={cn(
                "h-8 w-8 p-0",
                viewMode === 'list' 
                  ? "bg-white dark:bg-gray-700 shadow-sm" 
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* 排序选项 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="hover:bg-gray-100 dark:hover:bg-gray-800">
                <SortAsc className="w-4 h-4 mr-1" />
                排序
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem 
                onClick={() => onSortChange?.('name')}
                className={cn("flex items-center", sortBy === 'name' && "bg-gray-100 dark:bg-gray-800")}
              >
                按名称
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onSortChange?.('date')}
                className={cn("flex items-center", sortBy === 'date' && "bg-gray-100 dark:bg-gray-800")}
              >
                按时间
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onSortChange?.('url')}
                className={cn("flex items-center", sortBy === 'url' && "bg-gray-100 dark:bg-gray-800")}
              >
                按URL
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 更多选项 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="hover:bg-gray-100 dark:hover:bg-gray-800">
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                筛选选项
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center">
                批量选择
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center">
                批量删除
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center">
                批量移动
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 展开的工具栏 */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span>共 126 个书签</span>
              <span>15 个文件夹</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>最后更新: 2 小时前</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}