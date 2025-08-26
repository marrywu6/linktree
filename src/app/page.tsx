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
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [collectionName, setCollectionName] = useState<string>("");
  const [collections, setCollections] = useState<Collection[]>([]);
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
    
    setCurrentFolderId(folderId);

    const fetchCollectionsAndSetDefault = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/collections');
        const data = await response.json();
        
        if (data.success) {
          setCollections(data.data);
          
          let targetCollection;
          if (collectionSlug) {
            targetCollection = data.data.find((c: Collection) => c.slug === collectionSlug);
          }
          
          if (!targetCollection && data.data.length > 0) {
            targetCollection = data.data[0];
          }
          
          if (targetCollection) {
            setSelectedCollectionId(targetCollection.id);
            setCollectionName(targetCollection.name);
          }
        }
      } catch (error) {
        console.error('Error fetching collections:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollectionsAndSetDefault();
  }, [collectionSlug, folderId, refreshTrigger, hydrated]);

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
            <p className="text-gray-600 font-medium">Loading...</p>
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
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900 hidden sm:block">Bookmarks</h1>
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
                Search
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
                  Dashboard
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
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className={cn(
            "lg:w-64 lg:flex-shrink-0",
            sidebarOpen ? "block" : "hidden lg:block"
          )}>
            <div className="sticky top-24 bg-white rounded-xl shadow-sm border border-gray-200/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Collections</h2>
                <span className="text-sm text-gray-500">{collections.length}</span>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {collections.map((collection, index) => (
                  <button
                    key={collection.id}
                    onClick={() => routeToFolderInCollection(collection)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-lg transition-all duration-200 group",
                      "hover:bg-blue-50 hover:text-blue-700",
                      selectedCollectionId === collection.id
                        ? "bg-blue-100 text-blue-700 shadow-sm"
                        : "text-gray-700 hover:shadow-sm"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium",
                        selectedCollectionId === collection.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600 group-hover:bg-blue-500 group-hover:text-white"
                      )}>
                        {collection.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{collection.name}</p>
                        {collection.description && (
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {collection.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {collections.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No collections yet</p>
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm" className="mt-2">
                      Create Collection
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {selectedCollectionId ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-6">
                <BookmarkGrid
                  collectionId={selectedCollectionId}
                  currentFolderId={currentFolderId}
                  collectionName={collectionName}
                  collectionSlug={collections.find(c => c.id === selectedCollectionId)?.slug || undefined}
                  refreshTrigger={refreshTrigger}
                />
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">🎉 Welcome to Bookmarks v2.0</h3>
                  <p className="text-gray-600 mb-6">✨ Completely redesigned - Modern interface, full features. Create your first bookmark collection and organize your favorite websites</p>
                  <Link href="/dashboard">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Get Started
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
            <p className="text-gray-600 font-medium">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <SearchParamsComponent />
    </Suspense>
  );
}