"use client";

import Image from 'next/image'
import { useState } from 'react'
import { Folder, ExternalLink, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BookmarkCardProps {
  title: string
  url: string
  icon?: string
  description?: string
  isFeatured?: boolean
  collection?: {
    name: string
    slug: string
  }
  folder?: {
    name: string
  }
}

export function BookmarkCard({
  title,
  url,
  icon,
  description,
  isFeatured = false,
  collection,
  folder
}: BookmarkCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const defaultIcon = '/assets/default-icon.svg'
  
  // 清理 URL 显示，移除 http(s) 和尾部斜杠
  const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '')
  
  return (
    <div 
      onClick={() => window.open(url, '_blank')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group cursor-pointer relative transition-all duration-300 ease-in-out",
        "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm",
        "border border-gray-200/60 dark:border-gray-700/60",
        "rounded-xl overflow-hidden shadow-sm",
        "hover:shadow-lg hover:scale-[1.02] hover:bg-white dark:hover:bg-gray-800/90",
        "hover:border-primary/20 dark:hover:border-primary/30",
        isFeatured && "ring-2 ring-primary/20 shadow-lg border-primary/40"
      )}
    >
      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/50 dark:to-gray-800/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* 主要内容区域 */}
      <div className="relative p-4 flex items-start space-x-3">
        {/* 图标容器 */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-lg overflow-hidden shadow-sm ring-1 ring-gray-200/50 dark:ring-gray-700/50 group-hover:shadow-md transition-shadow">
            <Image
              src={imageError ? defaultIcon : (icon || defaultIcon)}
              alt={title}
              width={40}
              height={40}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
              priority={isFeatured}
            />
          </div>
          {isFeatured && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
              <Star className="w-2 h-2 text-white fill-current" />
            </div>
          )}
        </div>

        {/* 文本内容区域 */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between">
            <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate pr-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <ExternalLink 
              className={cn(
                "w-3 h-3 text-gray-400 transition-all duration-200 flex-shrink-0",
                "opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0"
              )} 
            />
          </div>
          
          {description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-500 truncate font-mono">
              {cleanUrl}
            </p>
          </div>

          {(collection || folder) && (
            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-600 pt-1 border-t border-gray-100 dark:border-gray-700/50">
              {collection && (
                <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 dark:bg-gray-700/50 rounded-full">
                  {collection.name}
                </span>
              )}
              {folder && (
                <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 dark:bg-gray-700/50 rounded-full">
                  <Folder className="w-3 h-3 mr-1" />
                  {folder.name}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 底部装饰线 */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r transition-all duration-300",
        "from-primary/0 via-primary/20 to-primary/0",
        "opacity-0 group-hover:opacity-100 scale-x-0 group-hover:scale-x-100"
      )} />
    </div>
  )
}
