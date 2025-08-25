"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BookmarkGrid } from "@/components/bookmark/BookmarkGrid";

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
  }, [collectionSlug, refreshTrigger]);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">书签树</h1>
          <p className="text-gray-600">将您的书签转换为一个美观的导航网站</p>
        </div>

        {/* Search Section */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              {useAISearch ? (
                <AISearchBar />
              ) : (
                <SearchBar />
              )}
            </div>
            <Button
              onClick={() => setUseAISearch(!useAISearch)}
              variant={useAISearch ? "default" : "outline"}
              size="icon"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">书签集合</h2>
              <div className="space-y-2">
                {collections.map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => routeToFolderInCollection(collection)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedCollectionId === collection.id
                        ? "bg-blue-100 text-blue-700"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {collection.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bookmarks Grid */}
          <div className="lg:col-span-3">
            {selectedCollectionId && (
              <BookmarkGrid
                collectionId={selectedCollectionId}
                currentFolderId={currentFolderId}
                collectionName={collectionName}
                collectionSlug={collections.find(c => c.id === selectedCollectionId)?.slug}
                refreshTrigger={refreshTrigger}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <SidebarProvider>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }>
        <SearchParamsComponent />
      </Suspense>
    </SidebarProvider>
  );
}