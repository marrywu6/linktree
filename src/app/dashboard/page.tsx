"use client";

import { AppSidebar } from "@/components/app-sidebar"
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  Plus, 
  BarChart3, 
  Globe, 
  FolderOpen, 
  Bookmark,
  Download,
  CheckCircle,
  AlertCircle,
  Link as LinkIcon,
  Import,
  User,
  LogOut
} from "lucide-react"
import { BookmarkImportDialog } from "@/components/bookmark/BookmarkImportDialog"
import { LinkCheckDialog } from "@/components/bookmark/LinkCheckDialog"
import { CreateCollectionDialog } from "@/components/collection/CreateCollectionDialog"
import CreateBookmarkDialogGlobal from "@/components/bookmark/CreateBookmarkDialogGlobal"
import Link from "next/link"

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [collections, setCollections] = useState([]);
  const [stats, setStats] = useState({
    totalBookmarks: 0,
    totalCollections: 0,
    totalFolders: 0,
    validLinks: 0,
    brokenLinks: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
  const [showLinkCheckDialog, setShowLinkCheckDialog] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // 获取统计数据
      const [collectionsRes, statsRes] = await Promise.all([
        fetch('/api/collections'),
        fetch('/api/stats') // 需要创建这个API
      ]);
      
      const collectionsData = await collectionsRes.json();
      if (collectionsData.success) {
        setCollections(collectionsData.data);
        
        // 临时统计数据计算
        const tempStats = {
          totalCollections: collectionsData.data.length,
          totalBookmarks: 0, // TODO: 从API获取
          totalFolders: 0,   // TODO: 从API获取
          validLinks: 0,     // TODO: 从API获取
          brokenLinks: 0     // TODO: 从API获取
        };
        setStats(tempStats);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          // 处理浏览器书签文件
          const content = e.target?.result as string;
          console.log('File content:', content);
          // TODO: 解析书签文件并导入
        } catch (error) {
          console.error('Error parsing bookmarks file:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600">
                {status === "loading" ? "验证登录状态..." : "加载数据中..."}
              </p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">
                  Bookmarks
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center space-x-2">
            {session && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{session.user?.name || session.user?.email}</span>
                  {session.user?.role === 'admin' && (
                    <Badge variant="default" className="text-xs">Admin</Badge>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            )}
            <Link href="/">
              <Button variant="outline" size="sm">
                <Globe className="h-4 w-4 mr-2" />
                View Site
              </Button>
            </Link>
          </div>
        </header>

        <div className="flex-1 space-y-6 p-6 bg-gray-50/50">
          {/* 页面标题和操作 */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bookmark Dashboard</h1>
              <p className="text-gray-600">Manage your bookmarks and collections</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => setShowBookmarkDialog(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Bookmark
              </Button>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Collection
              </Button>
              <Button 
                onClick={() => setShowImportDialog(true)}
                variant="outline"
              >
                <Import className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
          </div>

          {/* 简化的统计卡片 - 只保留核心书签相关数据 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Bookmarks
                </CardTitle>
                <Bookmark className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.totalBookmarks}</div>
                <p className="text-xs text-gray-500">
                  Saved websites
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Collections
                </CardTitle>
                <FolderOpen className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.totalCollections}</div>
                <p className="text-xs text-gray-500">
                  Organized groups
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Folders
                </CardTitle>
                <FolderOpen className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.totalFolders}</div>
                <p className="text-xs text-gray-500">
                  Sub-categories
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 简化的快捷操作 - 专注书签管理 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 书签管理 */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Bookmark className="h-5 w-5 mr-2 text-blue-600" />
                  Bookmark Management
                </CardTitle>
                <CardDescription>
                  Add, edit and organize your bookmarks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => setShowBookmarkDialog(true)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Bookmark
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Create Collection
                </Button>
              </CardContent>
            </Card>

            {/* 导入工具 */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Upload className="h-5 w-5 mr-2 text-green-600" />
                  Import Bookmarks
                </CardTitle>
                <CardDescription>
                  Import from Chrome, Firefox, Safari and other browsers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept=".html,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="bookmark-file"
                  />
                  <label 
                    htmlFor="bookmark-file"
                    className="cursor-pointer"
                  >
                    <Download className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Click to select or drag bookmark file here
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Supports .html and .json formats
                    </p>
                  </label>
                </div>
                <Button 
                  onClick={() => setShowImportDialog(true)}
                  className="w-full"
                  variant="outline"
                >
                  Advanced Import Options
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Collections Overview */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Your Collections</CardTitle>
              <CardDescription>
                Bookmark collections you've created
              </CardDescription>
            </CardHeader>
            <CardContent>
              {collections.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {collections.slice(0, 6).map((collection: any) => (
                    <div
                      key={collection.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 truncate">
                          {collection.name}
                        </h3>
                        <Badge variant={collection.isPublic ? "default" : "secondary"}>
                          {collection.isPublic ? "Public" : "Private"}
                        </Badge>
                      </div>
                      {collection.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {collection.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>0 bookmarks</span>
                        <Link href={`/?collection=${collection.slug}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No collections created yet</p>
                  <Button 
                    onClick={() => setShowCreateDialog(true)}
                    className="mt-4"
                  >
                    Create Your First Collection
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 对话框 */}
        {showImportDialog && (
          <BookmarkImportDialog 
            open={showImportDialog}
            onOpenChange={setShowImportDialog}
            onImportComplete={fetchDashboardData}
          />
        )}
        
        {showCreateDialog && (
          <CreateCollectionDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            onSuccess={fetchDashboardData}
          />
        )}

        {showLinkCheckDialog && (
          <LinkCheckDialog
            open={showLinkCheckDialog}
            onOpenChange={setShowLinkCheckDialog}
          />
        )}

        {showBookmarkDialog && (
          <CreateBookmarkDialogGlobal
            open={showBookmarkDialog}
            onOpenChange={setShowBookmarkDialog}
            onSuccess={fetchDashboardData}
          />
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}