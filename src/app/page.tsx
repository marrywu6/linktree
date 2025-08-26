"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SearchBar } from "@/components/search/SearchBar";
import { Button } from "@/components/ui/button";
import { Settings, Sparkles, Grid, List, Search, Menu, ChevronRight, ChevronDown, File, FolderOpen, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

function SearchParamsComponent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [hydrated, setHydrated] = useState(false);
  const [folderId, setFolderId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showSearch, setShowSearch] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // 处理 hydration
  useEffect(() => {
    setHydrated(true);
    const folderIdFromUrl = searchParams.get("folderId");
    setSelectedFolderId(folderIdFromUrl);
    setFolderId(folderIdFromUrl);
  }, [searchParams]);

  const handleFolderClick = useCallback(async (folderId: string | null) => {
    if (!hydrated) return;
    
    setSelectedFolderId(folderId);
    setBookmarksLoading(true);
    
    try {
      const bookmarksUrl = folderId 
        ? `/api/bookmarks?folderId=${folderId}`
        : '/api/bookmarks';
        
      const bookmarksResponse = await fetch(bookmarksUrl);
      const bookmarksData = await bookmarksResponse.json();
      
      if (bookmarksData.success) {
        setBookmarks(bookmarksData.data || []);
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setBookmarksLoading(false);
    }
    
    const currentSearchParams = new URLSearchParams(searchParams.toString());
    folderId ? currentSearchParams.set("folderId", folderId) : currentSearchParams.delete("folderId");
    window.history.replaceState(null, '', `${pathname}?${currentSearchParams.toString()}`);
  }, [hydrated, searchParams, pathname]);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const foldersResponse = await fetch('/api/folders');
        const foldersData = await foldersResponse.json();
        
        if (foldersData.success) {
          setFolders(foldersData.data);
          // 默认展开所有顶级文件夹
          const topLevelFolders = foldersData.data.filter((f: any) => !f.parentId);
          setExpandedFolders(new Set(topLevelFolders.map((f: any) => f.id)));
        }
        
        const bookmarksUrl = selectedFolderId 
          ? `/api/bookmarks?folderId=${selectedFolderId}`
          : '/api/bookmarks';
          
        const bookmarksResponse = await fetch(bookmarksUrl);
        const bookmarksData = await bookmarksResponse.json();
        
        if (bookmarksData.success) {
          setBookmarks(bookmarksData.data || []);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [folderId, selectedFolderId, refreshTrigger, hydrated]);

  // 构建文件夹树结构
  const buildFolderTree = useCallback((folders: any[]) => {
    const folderMap = new Map();
    const rootFolders: any[] = [];

    // 创建文件夹映射
    folders.forEach(folder => {
      folderMap.set(folder.id, { ...folder, children: [] });
    });

    // 构建树结构
    folders.forEach(folder => {
      const folderNode = folderMap.get(folder.id);
      if (folder.parentId && folderMap.has(folder.parentId)) {
        folderMap.get(folder.parentId).children.push(folderNode);
      } else {
        rootFolders.push(folderNode);
      }
    });

    return rootFolders;
  }, []);

  // 渲染文件夹树节点
  const renderFolderNode = useCallback((folder: any, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const hasChildren = folder.children && folder.children.length > 0;
    const indentWidth = level * 16;

    return (
      <div key={folder.id}>
        <div
          className={cn(
            "flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer transition-colors text-sm",
            isSelected && "bg-blue-100 text-blue-700 font-medium"
          )}
          style={{ paddingLeft: `${indentWidth + 8}px` }}
          onClick={() => handleFolderClick(folder.id)}
        >
          {hasChildren && (
            <button
              className="mr-1 p-0.5 hover:bg-gray-200 rounded"
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(folder.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 text-gray-500" />
              ) : (
                <ChevronRight className="h-3 w-3 text-gray-500" />
              )}
            </button>
          )}
          
          {!hasChildren && <div className="w-4 mr-1" />}
          
          <div className="mr-2">
            {hasChildren ? (
              isExpanded ? (
                <FolderOpen className="h-4 w-4 text-blue-500" />
              ) : (
                <Folder className="h-4 w-4 text-blue-600" />
              )
            ) : (
              <Folder className="h-4 w-4 text-gray-500" />
            )}
          </div>
          
          <span className="truncate flex-1">{folder.name}</span>
          
          {folder._count?.bookmarks > 0 && (
            <span className="text-xs text-gray-400 ml-1">
              {folder._count.bookmarks}
            </span>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {folder.children.map((child: any) => renderFolderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  }, [expandedFolders, selectedFolderId, handleFolderClick, toggleFolder]);

  // 获取文件图标
  const getBookmarkIcon = (bookmark: any) => {
    if (bookmark.icon) {
      return (
        <img 
          src={bookmark.icon} 
          alt=""
          className="w-4 h-4 object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            if (e.currentTarget.nextElementSibling) {
              (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'inline-block';
            }
          }}
        />
      );
    }
    return <File className="h-4 w-4 text-gray-400" />;
  };

  const folderTree = buildFolderTree(folders);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Title */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">书</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900 hidden sm:block">我的书签</h1>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearch(!showSearch)}
                className={cn("hidden sm:flex", showSearch && "bg-blue-50 text-blue-600")}
              >
                <Search className="h-4 w-4 mr-2" />
                搜索
              </Button>
              
              <div className="hidden sm:flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-7 px-2"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-7 px-2"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Settings className="h-4 w-4 mr-2" />
                  管理
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="border-t border-gray-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <SearchBar />
            </div>
          </div>
        )}
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* 左侧文件浏览器风格的导航 */}
        <aside className={cn(
          "w-80 bg-white border-r border-gray-200 overflow-hidden flex flex-col",
          sidebarOpen ? "block" : "hidden lg:flex"
        )}>
          {/* 资源管理器标题 */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">资源管理器</h2>
          </div>
          
          {/* 文件夹树 */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              {/* 根目录 - 全部书签 */}
              <div
                className={cn(
                  "flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer transition-colors text-sm rounded",
                  selectedFolderId === null && "bg-blue-100 text-blue-700 font-medium"
                )}
                onClick={() => handleFolderClick(null)}
              >
                <div className="w-4 mr-1" />
                <Folder className="h-4 w-4 text-blue-600 mr-2" />
                <span className="truncate flex-1">全部书签</span>
                <span className="text-xs text-gray-400 ml-1">
                  {bookmarks.length}
                </span>
              </div>
              
              {/* 文件夹树结构 */}
              {folderTree.map(folder => renderFolderNode(folder, 0))}
              
              {folders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Folder className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">暂无文件夹</p>
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm" className="mt-2">
                      导入书签
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* 右侧书签内容区域 */}
        <main className="flex-1 overflow-hidden bg-white">
          {/* 内容头部 */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedFolderId 
                    ? folders.find(f => f.id === selectedFolderId)?.name || "未知文件夹"
                    : "全部书签"
                  }
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {bookmarksLoading ? "加载中..." : `${bookmarks.length} 个书签`}
                </p>
              </div>
            </div>
          </div>

          {/* 书签内容 */}
          <div className="flex-1 overflow-y-auto p-6">
            {bookmarksLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">加载书签中...</span>
                </div>
              </div>
            ) : bookmarks.length > 0 ? (
              <div className="space-y-1">
                {bookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    onClick={() => window.open(bookmark.url, '_blank')}
                    className="flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer transition-colors rounded group"
                  >
                    <div className="mr-3 flex-shrink-0">
                      {getBookmarkIcon(bookmark)}
                      <File className="h-4 w-4 text-gray-400 hidden" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {bookmark.title}
                      </p>
                      {bookmark.description && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {bookmark.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {bookmark.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </p>
                    </div>

                    {/* 外链图标 */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64">
                <Sparkles className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedFolderId ? "此文件夹为空" : "欢迎使用书签管理"}
                </h3>
                <p className="text-gray-600 mb-6 text-center max-w-md">
                  {selectedFolderId 
                    ? "这个文件夹还没有书签，您可以导入或手动添加书签。"
                    : "开始导入您的浏览器书签，按文件夹整理您的网站收藏。"
                  }
                </p>
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    {selectedFolderId ? "添加书签" : "开始使用"}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 font-medium">加载中...</p>
          </div>
        </div>
      </div>
    }>
      <SearchParamsComponent />
    </Suspense>
  );
}