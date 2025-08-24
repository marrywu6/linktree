"use client";

import { Folder, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface FolderCardProps {
  name: string;
  icon?: string;
  onClick: () => void;
  bookmarkCount?: number;
}

export function FolderCard({ name, icon, onClick, bookmarkCount }: FolderCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative w-full p-4 transition-all duration-300 ease-in-out",
        "bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20",
        "border border-blue-200/60 dark:border-blue-700/40",
        "rounded-xl shadow-sm backdrop-blur-sm",
        "hover:shadow-md hover:scale-[1.02]",
        "hover:from-blue-100/90 hover:to-indigo-100/90 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30",
        "hover:border-blue-300/70 dark:hover:border-blue-600/50",
        "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
      )}
    >
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-100/30 dark:to-blue-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
      
      <div className="relative flex items-center justify-between">
        {/* 左侧图标和名称 */}
        <div className="flex items-center space-x-3 min-w-0">
          {/* 文件夹图标 */}
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-800/50 group-hover:bg-blue-200 dark:group-hover:bg-blue-700/60 transition-colors">
            {icon ? (
              <img src={icon} alt={name} className="w-6 h-6 object-contain" />
            ) : (
              <Folder className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            )}
          </div>

          {/* 文件夹信息 */}
          <div className="min-w-0 flex-1 text-left">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
              {name}
            </h3>
            {bookmarkCount !== undefined && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {bookmarkCount} {bookmarkCount === 1 ? 'bookmark' : 'bookmarks'}
              </p>
            )}
          </div>
        </div>

        {/* 右侧箭头图标 */}
        <ChevronRight 
          className={cn(
            "w-4 h-4 text-gray-400 dark:text-gray-500 transition-all duration-200 flex-shrink-0",
            "group-hover:text-blue-500 dark:group-hover:text-blue-400",
            "translate-x-0 group-hover:translate-x-0.5"
          )} 
        />
      </div>

      {/* 底部进度条装饰 */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-xl" />
    </button>
  );
}
