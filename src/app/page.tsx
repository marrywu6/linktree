"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SearchBar } from "@/components/search/SearchBar";
import { Button } from "@/components/ui/button";
import { Settings, Search, Menu, ChevronRight, ChevronDown, File, FolderOpen, Folder } from "lucide-react";
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

  // 渲染文件夹树节点 - 现代化设计
  const renderFolderNode = useCallback((folder: any, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const hasChildren = folder.children && folder.children.length > 0;
    const indentWidth = level * 16;

    return (
      <div key={folder.id}>
        <div
          className={cn(
            "group flex items-center px-4 py-3 rounded-2xl cursor-pointer transition-all duration-200",
            isSelected 
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-[1.02]" 
              : "hover:bg-white/80 hover:shadow-md"
          )}
          style={{ paddingLeft: `${indentWidth + 16}px` }}
          onClick={() => handleFolderClick(folder.id)}
        >
          {hasChildren && (
            <button
              className={cn(
                "mr-2 p-1 rounded-lg transition-all duration-200",
                isSelected ? "hover:bg-white/20" : "hover:bg-gray-100"
              )}
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(folder.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className={cn(
                  "h-3 w-3",
                  isSelected ? "text-white" : "text-gray-500"
                )} />
              ) : (
                <ChevronRight className={cn(
                  "h-3 w-3",
                  isSelected ? "text-white" : "text-gray-500"
                )} />
              )}
            </button>
          )}
          
          {!hasChildren && <div className="w-5 mr-2" />}
          
          <div className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center mr-3",
            isSelected ? "bg-white/20" : "bg-gradient-to-br from-purple-100 to-indigo-200"
          )}>
            {hasChildren ? (
              isExpanded ? (
                <FolderOpen className={cn(
                  "h-4 w-4",
                  isSelected ? "text-white" : "text-purple-600"
                )} />
              ) : (
                <Folder className={cn(
                  "h-4 w-4",
                  isSelected ? "text-white" : "text-indigo-600"
                )} />
              )
            ) : (
              <Folder className={cn(
                "h-4 w-4",
                isSelected ? "text-white" : "text-gray-500"
              )} />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className={cn(
              "font-medium truncate",
              isSelected ? "text-white" : "text-gray-800"
            )}>
              {folder.name}
            </p>
            <p className={cn(
              "text-xs truncate",
              isSelected ? "text-blue-100" : "text-gray-500"
            )}>
              {folder._count?.bookmarks || 0} 个书签
            </p>
          </div>
          
          {folder._count?.bookmarks > 0 && (
            <span className={cn(
              "px-2 py-1 rounded-lg text-xs font-medium",
              isSelected 
                ? "bg-white/20 text-white" 
                : "bg-gray-100 text-gray-600"
            )}>
              {folder._count.bookmarks}
            </span>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* 现代化顶栏 */}
      <header className="backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* 品牌区域 */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-black/5 transition-colors"
              >
                <Menu className="h-5 w-5 text-gray-700" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <Folder className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    书签收藏夹
                  </h1>
                  <p className="text-sm text-gray-500 -mt-1">智能书签管理</p>
                </div>
              </div>
            </div>

            {/* 操作区域 */}
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearch(!showSearch)}
                className={cn(
                  "h-10 px-4 rounded-xl font-medium transition-all duration-200",
                  showSearch ? "bg-blue-100 text-blue-700 shadow-sm" : "hover:bg-gray-100/80"
                )}
              >
                <Search className="h-4 w-4 mr-2" />
                搜索
              </Button>
              
              <Link href="/dashboard">
                <Button 
                  size="sm" 
                  className="h-10 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  管理
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 搜索栏 */}
        {showSearch && (
          <div className="border-t border-white/20 bg-white/50 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <SearchBar />
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="flex h-[calc(100vh-5rem)]">
        {/* 左侧导航栏 - 现代化设计 */}
        <aside className={cn(
          "w-80 backdrop-blur-xl bg-white/60 border-r border-white/20 overflow-hidden flex flex-col",
          sidebarOpen ? "block" : "hidden lg:flex"
        )}>
          {/* 导航标题 */}
          <div className="p-6 border-b border-white/20">
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">
              文件夹
            </h2>
            <p className="text-xs text-gray-500 mt-1">按分类浏览您的书签</p>
          </div>
          
          {/* 文件夹列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {/* 全部书签 */}
            <div
              className={cn(
                "group flex items-center px-4 py-3 rounded-2xl cursor-pointer transition-all duration-200",
                selectedFolderId === null 
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-[1.02]" 
                  : "hover:bg-white/80 hover:shadow-md"
              )}
              onClick={() => handleFolderClick(null)}
            >
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center mr-3",
                selectedFolderId === null ? "bg-white/20" : "bg-blue-100"
              )}>
                <Folder className={cn(
                  "h-4 w-4",
                  selectedFolderId === null ? "text-white" : "text-blue-600"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium truncate",
                  selectedFolderId === null ? "text-white" : "text-gray-800"
                )}>
                  全部书签
                </p>
                <p className={cn(
                  "text-xs truncate",
                  selectedFolderId === null ? "text-blue-100" : "text-gray-500"
                )}>
                  所有收藏的网站
                </p>
              </div>
              <span className={cn(
                "px-2 py-1 rounded-lg text-xs font-medium",
                selectedFolderId === null 
                  ? "bg-white/20 text-white" 
                  : "bg-gray-100 text-gray-600"
              )}>
                {bookmarks.length}
              </span>
            </div>
            
            {/* 文件夹树 */}
            {folderTree.map(folder => renderFolderNode(folder, 0))}
            
            {folders.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Folder className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-800 mb-2">暂无文件夹</h3>
                <p className="text-xs text-gray-500">导入书签后将自动创建文件夹</p>
              </div>
            )}
          </div>
        </aside>

        {/* 主内容区域 */}
        <main className="flex-1 overflow-hidden">
          {/* 内容头部 */}
          <div className="p-6 bg-white/40 backdrop-blur-xl border-b border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedFolderId 
                    ? folders.find(f => f.id === selectedFolderId)?.name || "未知文件夹"
                    : "全部书签"
                  }
                </h2>
                <p className="text-gray-600 mt-1">
                  {bookmarksLoading ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      加载中...
                    </span>
                  ) : (
                    `共 ${bookmarks.length} 个书签`
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* 书签内容 */}
          <div className="flex-1 overflow-y-auto p-6">
            {bookmarksLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">加载书签中...</p>
                  <p className="text-sm text-gray-500 mt-1">请稍候</p>
                </div>
              </div>
            ) : bookmarks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {bookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    onClick={() => window.open(bookmark.url, '_blank')}
                    className="group bg-white/80 backdrop-blur-xl rounded-2xl p-4 cursor-pointer border border-white/20 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 hover:scale-[1.02] hover:bg-white/90"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-blue-100 group-hover:to-indigo-200 transition-all duration-300">
                        {getBookmarkIcon(bookmark)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate mb-1">
                          {bookmark.title}
                        </h3>
                        {bookmark.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {bookmark.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 truncate bg-gray-50 px-2 py-1 rounded-lg">
                          {bookmark.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        </p>
                      </div>
                    </div>

                    {/* 悬浮操作图标 */}
                    <div className="mt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <div className="text-xs text-gray-500">
                        点击访问
                      </div>
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 rounded-3xl flex items-center justify-center mb-6">
                  <File className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {selectedFolderId ? "文件夹为空" : "开始您的书签之旅"}
                </h3>
                <p className="text-gray-600 text-center max-w-md mb-6">
                  {selectedFolderId 
                    ? "这个文件夹还没有任何书签，去管理面板添加一些精彩内容吧！"
                    : "将您喜爱的网站收藏到这里，打造个人专属的网络收藏夹。"
                  }
                </p>
                <Link href="/dashboard">
                  <Button className="h-12 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200">
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