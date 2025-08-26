"use client";

import { FileExplorerDemo } from '@/components/file-explorer';

export default function FileExplorerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <FileExplorerDemo />
        </div>
        
        {/* 使用说明 */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">功能特点</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">🎯 交互功能</h4>
              <ul className="space-y-1">
                <li>• 点击文件夹展开/收起</li>
                <li>• 点击文件查看详情</li>
                <li>• 实时搜索文件和文件夹</li>
                <li>• 层级缩进显示结构</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">🎨 视觉效果</h4>
              <ul className="space-y-1">
                <li>• 文件类型图标区分</li>
                <li>• 悬停高亮效果</li>
                <li>• 搜索结果高亮</li>
                <li>• 文件大小显示</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}