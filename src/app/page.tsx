"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import {  useSearchParams, useRouter, usePathname } from "next/navigation";
import { WebsiteSidebar } from "@/components/website/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BookmarkGrid } from "@/components/bookmark/BookmarkGrid";
import { Header } from "@/components/website/header";

import { Footer } from "@/components/website/footer";
import { TopBanner } from "@/components/website/top-banner";
import { Advertisement } from "@/components/advertisement";

import { GetStarted } from "@/components/website/get-started";
import { BackToTop } from "@/components/website/back-to-top";

import { Collection } from "@prisma/client";
import { SearchBar } from "@/components/search/SearchBar";
import { AISearchBar } from "@/components/search/AISearchBar";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

function SearchParamsComponent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const collectionSlug = searchParams.get("collection");

  const [isLoading, setIsLoading] = useState(true);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [collectionName, setCollectionName] = useState<string>("");
  const [collections, setCollections] = useState<Collection[]>([]);
  const router = useRouter();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [useAISearch, setUseAISearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const routeToFolderInCollection = (collection: Collection, folderId?: string | null) => {
    const currentSearchParams = new URLSearchParams(searchParams.toString());
    collection?.slug ? currentSearchParams.set("collection", collection.slug) : currentSearchParams.delete("collection");
    folderId ? currentSearchParams.set("folderId", folderId) : currentSearchParams.delete("folderId");
    router.push(`${pathname}?${currentSearchParams.toString()}`);
  }

  useEffect(() => {
    const folderId = searchParams.get("folderId");
    setCurrentFolderId(folderId);

    const fetchCollectionsAndSetDefault = async () => {
      try {
        setIsLoading(true);
        // 如果用户已登录，获取所有可访问的集合；否则只获取公开集合
        const response = await fetch("/api/collections");
        const data = await response.json();
        setCollections(data);

        // set selected collection by slug
        if (collectionSlug) {
          const currentCollection = data.find(
            (c: Collection) => c.slug === collectionSlug
          );
          if (currentCollection) {
            setSelectedCollectionId(currentCollection.id);
            setCollectionName(currentCollection.name);
          }
        } else {
          const defaultCollection = data[0];
          setSelectedCollectionId(defaultCollection?.id ?? "");
          setCollectionName(defaultCollection?.name ?? "");
        }
      } catch (error) {
        console.error("获取 collections 失败:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollectionsAndSetDefault();
  }, [searchParams]);



  const handleCollectionChange = (id: string) => {
    const collection = collections.find((c) => c.id === id);
    if (!collection) return;

    setSelectedCollectionId(id);
    setCollectionName(collection.name || "");
    setCurrentFolderId(null);

    routeToFolderInCollection(collection);
  };

  const handleFolderSelect = (id: string | null) => {
    const collection = collections.find((c) => c.id === selectedCollectionId);
    if (!collection) return;

    routeToFolderInCollection(collection, id);
    setCurrentFolderId(id);
  };

  const refreshData = useCallback(async () => {
    if (selectedCollectionId) {
      try {
        setRefreshTrigger((prev) => prev + 1);
      } catch (error) {
        console.error("刷新数据失败:", error);
      }
    }
  }, [selectedCollectionId, currentFolderId]);

  const handleSearch = async (query: string, scope: 'all' | 'current') => {
    if (!query.trim()) {
      return;
    }

    // 在实际实现中，这里会处理常规搜索
    console.log("Regular search:", query, scope);
  };

  const handleAISearch = async (query: string) => {
    if (!query.trim()) {
      return;
    }

    setIsSearching(true);
    try {
      // 跳转到搜索结果页面
      router.push(`/search-results?q=${encodeURIComponent(query)}`);
    } catch (error) {
      console.error('AI Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBanner />
      {/* 顶部广告位 */}
      <Advertisement position="header" />
      <div className="flex flex-1">
        <SidebarProvider>
          {
          isLoading && !collections.length ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) :
          selectedCollectionId || collectionSlug ? (
            <>
              <WebsiteSidebar
                selectedCollectionId={selectedCollectionId}
                currentFolderId={currentFolderId}
                onCollectionChange={handleCollectionChange}
                onFolderSelect={handleFolderSelect}
              />
              <div className="flex flex-1 flex-col space-y-8">
                <Header
                  selectedCollectionId={selectedCollectionId}
                  currentFolderId={currentFolderId}
                  onBookmarkAdded={refreshData}
                />
                
                {/* 搜索栏 */}
                <div className="px-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Button
                      variant={useAISearch ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseAISearch(true)}
                      className={useAISearch ? "bg-black text-white" : ""}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Search
                    </Button>
                    <Button
                      variant={!useAISearch ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseAISearch(false)}
                      className={!useAISearch ? "bg-black text-white" : ""}
                    >
                      Regular Search
                    </Button>
                  </div>
                  
                  {useAISearch ? (
                    <AISearchBar onSearch={handleAISearch} />
                  ) : (
                    <SearchBar onSearch={handleSearch} />
                  )}
                </div>
                
                {/* 顶部广告位 */}
                <Advertisement position="content_top" />
                
                <div className="flex-1 overflow-y-auto">
                  <BookmarkGrid
                    key={`${selectedCollectionId}-${currentFolderId}`}
                    collectionId={selectedCollectionId}
                    currentFolderId={currentFolderId}
                    collectionName={collectionName}
                    collectionSlug={
                      collections.find((c) => c.id === selectedCollectionId)
                        ?.slug || ""
                    }
                    refreshTrigger={refreshTrigger}
                  />
                </div>
                
                {/* 底部广告位 */}
                <Advertisement position="content_bottom" />
                <Footer />
                {/* 底部广告位 */}
                <Advertisement position="footer" />
              </div>
              <BackToTop />
            </>
          ) : (
            <div className="flex flex-1">
              <GetStarted />
            </div>
          )}
        </SidebarProvider>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchParamsComponent />
    </Suspense>
  );
}