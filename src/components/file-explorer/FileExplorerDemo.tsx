"use client";

import React from 'react';
import { FileExplorer, FileSystemItem } from './FileExplorer';

// 模拟您的项目结构数据
const projectData: FileSystemItem[] = [
  {
    name: 'explorer-xiaoshu-main',
    type: 'folder',
    path: '/explorer-xiaoshu-main',
    children: [
      {
        name: 'extension',
        type: 'folder',
        path: '/explorer-xiaoshu-main/extension',
        children: [
          {
            name: '_locales',
            type: 'folder',
            path: '/explorer-xiaoshu-main/extension/_locales',
            children: [
              {
                name: 'de',
                type: 'folder',
                path: '/explorer-xiaoshu-main/extension/_locales/de',
                children: [
                  {
                    name: 'messages.json',
                    type: 'file',
                    path: '/explorer-xiaoshu-main/extension/_locales/de/messages.json',
                    extension: 'json',
                    size: 1024
                  }
                ]
              },
              {
                name: 'en',
                type: 'folder',
                path: '/explorer-xiaoshu-main/extension/_locales/en',
                children: [
                  {
                    name: 'messages.json',
                    type: 'file',
                    path: '/explorer-xiaoshu-main/extension/_locales/en/messages.json',
                    extension: 'json',
                    size: 2048
                  }
                ]
              },
              {
                name: 'ja',
                type: 'folder',
                path: '/explorer-xiaoshu-main/extension/_locales/ja',
                children: [
                  {
                    name: 'messages.json',
                    type: 'file',
                    path: '/explorer-xiaoshu-main/extension/_locales/ja/messages.json',
                    extension: 'json',
                    size: 1536
                  }
                ]
              },
              {
                name: 'zh_CN',
                type: 'folder',
                path: '/explorer-xiaoshu-main/extension/_locales/zh_CN',
                children: [
                  {
                    name: 'messages.json',
                    type: 'file',
                    path: '/explorer-xiaoshu-main/extension/_locales/zh_CN/messages.json',
                    extension: 'json',
                    size: 1200
                  }
                ]
              }
            ]
          },
          {
            name: 'assets',
            type: 'folder',
            path: '/explorer-xiaoshu-main/extension/assets',
            children: [
              {
                name: 'icon.png',
                type: 'file',
                path: '/explorer-xiaoshu-main/extension/assets/icon.png',
                extension: 'png',
                size: 4096
              },
              {
                name: 'icon.svg',
                type: 'file',
                path: '/explorer-xiaoshu-main/extension/assets/icon.svg',
                extension: 'svg',
                size: 2048
              }
            ]
          }
        ]
      },
      {
        name: 'scripts',
        type: 'folder',
        path: '/explorer-xiaoshu-main/scripts',
        children: [
          {
            name: 'manifest.ts',
            type: 'file',
            path: '/explorer-xiaoshu-main/scripts/manifest.ts',
            extension: 'ts',
            size: 3072
          },
          {
            name: 'preinstall.js',
            type: 'file',
            path: '/explorer-xiaoshu-main/scripts/preinstall.js',
            extension: 'js',
            size: 512
          },
          {
            name: 'prepare.ts',
            type: 'file',
            path: '/explorer-xiaoshu-main/scripts/prepare.ts',
            extension: 'ts',
            size: 1536
          },
          {
            name: 'utils.ts',
            type: 'file',
            path: '/explorer-xiaoshu-main/scripts/utils.ts',
            extension: 'ts',
            size: 2048
          }
        ]
      },
      {
        name: 'src',
        type: 'folder',
        path: '/explorer-xiaoshu-main/src',
        children: [
          {
            name: 'background',
            type: 'folder',
            path: '/explorer-xiaoshu-main/src/background',
            children: [
              {
                name: 'libs',
                type: 'folder',
                path: '/explorer-xiaoshu-main/src/background/libs',
                children: [
                  {
                    name: 'fileCache.ts',
                    type: 'file',
                    path: '/explorer-xiaoshu-main/src/background/libs/fileCache.ts',
                    extension: 'ts',
                    size: 4096
                  }
                ]
              },
              {
                name: 'index.html',
                type: 'file',
                path: '/explorer-xiaoshu-main/src/background/index.html',
                extension: 'html',
                size: 1024
              },
              {
                name: 'contentScriptHMR.ts',
                type: 'file',
                path: '/explorer-xiaoshu-main/src/background/contentScriptHMR.ts',
                extension: 'ts',
                size: 2048
              },
              {
                name: 'main.ts',
                type: 'file',
                path: '/explorer-xiaoshu-main/src/background/main.ts',
                extension: 'ts',
                size: 3072
              }
            ]
          },
          {
            name: 'components',
            type: 'folder',
            path: '/explorer-xiaoshu-main/src/components',
            children: [
              {
                name: 'DetectDialog.vue',
                type: 'file',
                path: '/explorer-xiaoshu-main/src/components/DetectDialog.vue',
                extension: 'vue',
                size: 5120
              },
              {
                name: 'README.md',
                type: 'file',
                path: '/explorer-xiaoshu-main/src/components/README.md',
                extension: 'md',
                size: 1536
              },
              {
                name: 'StarDialog.vue',
                type: 'file',
                path: '/explorer-xiaoshu-main/src/components/StarDialog.vue',
                extension: 'vue',
                size: 4608
              }
            ]
          },
          {
            name: 'contentScripts',
            type: 'folder',
            path: '/explorer-xiaoshu-main/src/contentScripts',
            children: [
              {
                name: 'libs',
                type: 'folder',
                path: '/explorer-xiaoshu-main/src/contentScripts/libs',
                children: [
                  {
                    name: 'fileCacheBridge.ts',
                    type: 'file',
                    path: '/explorer-xiaoshu-main/src/contentScripts/libs/fileCacheBridge.ts',
                    extension: 'ts',
                    size: 2048
                  }
                ]
              },
              {
                name: 'views',
                type: 'folder',
                path: '/explorer-xiaoshu-main/src/contentScripts/views',
                children: [
                  {
                    name: 'App.vue',
                    type: 'file',
                    path: '/explorer-xiaoshu-main/src/contentScripts/views/App.vue',
                    extension: 'vue',
                    size: 6144
                  },
                  {
                    name: 'data.json',
                    type: 'file',
                    path: '/explorer-xiaoshu-main/src/contentScripts/views/data.json',
                    extension: 'json',
                    size: 3072
                  }
                ]
              },
              {
                name: 'index.ts',
                type: 'file',
                path: '/explorer-xiaoshu-main/src/contentScripts/index.ts',
                extension: 'ts',
                size: 1536
              }
            ]
          },
          {
            name: 'options',
            type: 'folder',
            path: '/explorer-xiaoshu-main/src/options',
            children: [
              {
                name: 'Options.vue',
                type: 'file',
                path: '/explorer-xiaoshu-main/src/options/Options.vue',
                extension: 'vue',
                size: 4096
              },
              {
                name: 'index.html',
                type: 'file',
                path: '/explorer-xiaoshu-main/src/options/index.html',
                extension: 'html',
                size: 1024
              },
              {
                name: 'main.ts',
                type: 'file',
                path: '/explorer-xiaoshu-main/src/options/main.ts',
                extension: 'ts',
                size: 512
              },
              {
                name: 'setting.json',
                type: 'file',
                path: '/explorer-xiaoshu-main/src/options/setting.json',
                extension: 'json',
                size: 768
              }
            ]
          },
          {
            name: 'env.ts',
            type: 'file',
            path: '/explorer-xiaoshu-main/src/env.ts',
            extension: 'ts',
            size: 256
          },
          {
            name: 'global.d.ts',
            type: 'file',
            path: '/explorer-xiaoshu-main/src/global.d.ts',
            extension: 'ts',
            size: 512
          },
          {
            name: 'manifest.ts',
            type: 'file',
            path: '/explorer-xiaoshu-main/src/manifest.ts',
            extension: 'ts',
            size: 2048
          }
        ]
      },
      {
        name: 'LICENSE',
        type: 'file',
        path: '/explorer-xiaoshu-main/LICENSE',
        extension: 'txt',
        size: 1024
      },
      {
        name: 'README.md',
        type: 'file',
        path: '/explorer-xiaoshu-main/README.md',
        extension: 'md',
        size: 4096
      },
      {
        name: 'crowdin.yml',
        type: 'file',
        path: '/explorer-xiaoshu-main/crowdin.yml',
        extension: 'yml',
        size: 256
      },
      {
        name: 'package.json',
        type: 'file',
        path: '/explorer-xiaoshu-main/package.json',
        extension: 'json',
        size: 2048
      },
      {
        name: 'pnpm-lock.yaml',
        type: 'file',
        path: '/explorer-xiaoshu-main/pnpm-lock.yaml',
        extension: 'yaml',
        size: 65536
      },
      {
        name: 'renovate.json',
        type: 'file',
        path: '/explorer-xiaoshu-main/renovate.json',
        extension: 'json',
        size: 512
      },
      {
        name: 'shim.d.ts',
        type: 'file',
        path: '/explorer-xiaoshu-main/shim.d.ts',
        extension: 'ts',
        size: 128
      },
      {
        name: 'tsconfig.json',
        type: 'file',
        path: '/explorer-xiaoshu-main/tsconfig.json',
        extension: 'json',
        size: 1024
      },
      {
        name: 'vite.config.content.ts',
        type: 'file',
        path: '/explorer-xiaoshu-main/vite.config.content.ts',
        extension: 'ts',
        size: 1536
      },
      {
        name: 'vite.config.ts',
        type: 'file',
        path: '/explorer-xiaoshu-main/vite.config.ts',
        extension: 'ts',
        size: 2048
      }
    ]
  }
];

interface FileExplorerDemoProps {
  className?: string;
}

export const FileExplorerDemo: React.FC<FileExplorerDemoProps> = ({ className }) => {
  const handleFileClick = (item: FileSystemItem) => {
    console.log('文件被点击:', item.name, item.path);
    // 这里可以添加文件预览或编辑逻辑
  };

  const handleFolderClick = (item: FileSystemItem) => {
    console.log('文件夹被点击:', item.name, item.path);
    // 这里可以添加文件夹操作逻辑
  };

  return (
    <div className={className}>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">项目文件浏览器</h2>
        <p className="text-gray-600 text-sm">
          浏览器扩展项目结构 - 点击文件夹展开/收起，点击文件查看详情
        </p>
      </div>
      
      <FileExplorer
        data={projectData}
        onFileClick={handleFileClick}
        onFolderClick={handleFolderClick}
        showSearch={true}
      />
    </div>
  );
};