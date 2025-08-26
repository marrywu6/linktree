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
  const defaultIcon = '/assets/default-icon.svg'
  
  return (
    <div 
      onClick={() => window.open(url, '_blank')}
      className={cn(
        "group cursor-pointer relative transition-all duration-300 ease-out",
        "bg-white hover:bg-gray-50",
        "border border-gray-200 hover:border-gray-300",
        "rounded-xl overflow-hidden",
        "hover:shadow-lg hover:scale-[1.02]",
        "p-4",
        isFeatured && "ring-2 ring-blue-500/20 border-blue-300"
      )}
    >
      <div className="flex items-center space-x-3">
        {/* 图标 */}
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-lg overflow-hidden shadow-sm">
            <Image
              src={imageError ? defaultIcon : (icon || defaultIcon)}
              alt={title}
              width={32}
              height={32}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          </div>
          {isFeatured && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
              <Star className="w-2 h-2 text-white fill-current" />
            </div>
          )}
        </div>

        {/* 标题 */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
        </div>

        {/* 外链图标 */}
        <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      </div>
    </div>
  )
}
