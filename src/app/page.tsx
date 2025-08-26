"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { BookmarkGrid } from "@/components/bookmark/BookmarkGrid";
import { Collection } from "@prisma/client";
import { SearchBar } from "@/components/search/SearchBar";
import { Button } from "@/components/ui/button";
import { Settings, Sparkles, Grid, List, Search, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

function SearchParamsComponent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // 添加 hydrated 状态来避免 hydration 不匹配
  const [hydrated, setHydrated] = useState(false);
  const [collectionSlug, setCollectionSlug] = useState<string | null>(null);
  const [folderId, setFolderId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSearch, setShowSearch] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 处理 hydration
  useEffect(() => {
    setHydrated(true);
    setCollectionSlug(searchParams.get("collection"));
    setFolderId(searchParams.get("folderId"));
  }, [searchParams]);

  const routeToFolderInCollection = (collection: Collection, folderId?: string | null) => {
    if (!hydrated) return; // 防止在 hydration 完成前执行
    
    const currentSearchParams = new URLSearchParams(searchParams.toString());
    collection?.slug ? currentSearchParams.set("collection", collection.slug) : currentSearchParams.delete("collection");
    folderId ? currentSearchParams.set("folderId", folderId) : currentSearchParams.delete("folderId");
    router.push(`${pathname}?${currentSearchParams.toString()}`);
  }

  useEffect(() => {
    if (!hydrated) return; // 等待 hydration 完成
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // 获取集合
        const collectionsResponse = await fetch('/api/collections');
        const collectionsData = await collectionsResponse.json();
        
        if (collectionsData.success) {
          setCollections(collectionsData.data);
          
          // 选择第一个集合
          let targetCollection;
          if (collectionSlug) {
            targetCollection = collectionsData.data.find((c: any) => c.slug === collectionSlug);
          }
          
          if (!targetCollection && collectionsData.data.length > 0) {
            targetCollection = collectionsData.data[0];
          }
          
          if (targetCollection) {
            setSelectedCollectionId(targetCollection.id);
            
            // 获取该集合的文件夹
            const foldersResponse = await fetch(`/api/collections/${targetCollection.id}/folders`);
            const foldersData = await foldersResponse.json();
            
            if (foldersData.success) {
              setFolders(foldersData.data);
            }
            
            // 获取书签（全部或指定文件夹）
            const bookmarksUrl = selectedFolderId 
              ? `/api/collections/${targetCollection.id}/bookmarks?folderId=${selectedFolderId}`
              : `/api/collections/${targetCollection.id}/bookmarks`;
              
            const bookmarksResponse = await fetch(bookmarksUrl);
            const bookmarksData = await bookmarksResponse.json();
            
            if (bookmarksData.success) {
              setBookmarks(bookmarksData.data.bookmarks || []);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [collectionSlug, selectedFolderId, refreshTrigger, hydrated]);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // 在 hydration 完成前显示加载状态
  if (!hydrated || isLoading) {
    return (
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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
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
          <div className="border-t border-gray-200/50 bg-white/90 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <SearchBar />
            </div>
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* 左侧文件夹导航 */}
          <aside className={cn(
            "w-64 flex-shrink-0",
            sidebarOpen ? "block" : "hidden lg:block"
          )}>
            <div className="sticky top-24 bg-white rounded-xl shadow-sm border border-gray-200/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">文件夹分类</h2>
              </div>
              
              <div className="space-y-1">
                {/* 全部书签 */}
                <button
                  onClick={() => setSelectedFolderId(null)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg transition-colors",
                    selectedFolderId === null
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  📚 全部书签
                </button>
                
                {/* 文件夹列表 */}
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg transition-colors",
                      selectedFolderId === folder.id
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    📁 {folder.name}
                  </button>
                ))}
                
                {folders.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">暂无文件夹</p>
                    <Link href="/dashboard">
                      <Button variant="outline" size="sm" className="mt-2">
                        创建分类
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* 右侧书签展示区域 */}
          <main className="flex-1 min-w-0">
            {bookmarks.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedFolderId 
                      ? `${folders.find(f => f.id === selectedFolderId)?.name} 文件夹`
                      : "全部书签"
                    }
                  </h3>
                  <span className="text-sm text-gray-500">{bookmarks.length} 个书签</span>
                </div>
                
                {/* 书签列表 */}
                <div className="space-y-3">
                  {bookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      onClick={() => window.open(bookmark.url, '_blank')}
                      className="group cursor-pointer p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        {/* 图标 */}
                        <div className="w-12 h-12 rounded-lg overflow-hidden shadow-sm flex-shrink-0 bg-gray-100">
                          {bookmark.icon ? (
                            <img 
                              src={bookmark.icon} 
                              alt={bookmark.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                if (nextElement) {
                                  nextElement.style.display = 'flex';
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              🔗
                            </div>
                          )}
                          <div className="w-full h-full hidden items-center justify-center text-gray-400">
                            🔗
                          </div>
                        </div>
                        
                        {/* 内容 */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {bookmark.title}
                          </h4>
                          {bookmark.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {bookmark.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-2 truncate">
                            {bookmark.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                          </p>
                        </div>
                        
                        {/* 外链图标 */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">🎉 欢迎使用我的书签系统</h3>
                  <p className="text-gray-600 mb-6">✨ 现代化设计，简洁功能，开始导入您的浏览器书签，按文件夹整理您的网站收藏</p>
                  <Link href="/dashboard">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      开始使用
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </main>
        </div>
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