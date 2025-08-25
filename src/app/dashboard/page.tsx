"use client";

import { AppSidebar } from "@/components/app-sidebar"
import { useState, useEffect } from "react";
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
  Import
} from "lucide-react"
import { BookmarkImportDialog } from "@/components/bookmark/BookmarkImportDialog"
import { LinkCheckDialog } from "@/components/bookmark/LinkCheckDialog"
import { CreateCollectionDialog } from "@/components/collection/CreateCollectionDialog"
import CreateBookmarkDialogGlobal from "@/components/bookmark/CreateBookmarkDialogGlobal"
import Link from "next/link"

export default function DashboardPage() {
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

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                  书签树
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>管理后台</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center space-x-2">
            <Link href="/">
              <Button variant="outline" size="sm">
                <Globe className="h-4 w-4 mr-2" />
                查看网站
              </Button>
            </Link>
          </div>
        </header>

        <div className="flex-1 space-y-6 p-6 bg-gray-50/50">
          {/* 页面标题和操作 */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">管理后台</h1>
              <p className="text-gray-600">管理您的书签、分类和设置</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => setShowBookmarkDialog(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                添加书签
              </Button>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                创建分类
              </Button>
              <Button 
                onClick={() => setShowImportDialog(true)}
                variant="outline"
              >
                <Import className="h-4 w-4 mr-2" />
                导入书签
              </Button>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  总书签数
                </CardTitle>
                <Bookmark className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.totalBookmarks}</div>
                <p className="text-xs text-gray-500">
                  个人收藏的网站
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  分类数量
                </CardTitle>
                <FolderOpen className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.totalCollections}</div>
                <p className="text-xs text-gray-500">
                  书签分类
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  文件夹
                </CardTitle>
                <FolderOpen className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.totalFolders}</div>
                <p className="text-xs text-gray-500">
                  组织结构
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  有效链接
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.validLinks}</div>
                <p className="text-xs text-gray-500">
                  可正常访问
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  失效链接
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.brokenLinks}</div>
                <p className="text-xs text-gray-500">
                  需要修复
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 快捷操作 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 导入浏览器书签 */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Upload className="h-5 w-5 mr-2 text-blue-600" />
                  导入浏览器书签
                </CardTitle>
                <CardDescription>
                  从Chrome、Firefox、Safari等浏览器导入书签
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
                      点击选择书签文件或拖拽到此处
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      支持 .html 和 .json 格式
                    </p>
                  </label>
                </div>
                <Button 
                  onClick={() => setShowImportDialog(true)}
                  className="w-full"
                  variant="outline"
                >
                  高级导入选项
                </Button>
              </CardContent>
            </Card>

            {/* 书签管理 */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Bookmark className="h-5 w-5 mr-2 text-green-600" />
                  书签管理
                </CardTitle>
                <CardDescription>
                  添加、编辑和组织您的书签
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => setShowBookmarkDialog(true)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加新书签
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  创建分类
                </Button>
                <Button variant="outline" className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  查看统计
                </Button>
              </CardContent>
            </Card>

            {/* 系统工具 */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <LinkIcon className="h-5 w-5 mr-2 text-purple-600" />
                  系统工具
                </CardTitle>
                <CardDescription>
                  链接检查、备份和其他工具
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowLinkCheckDialog(true)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  检查链接有效性
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  导出备份
                </Button>
                <Button variant="outline" className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  访问统计
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 最近的分类 */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>最近的分类</CardTitle>
              <CardDescription>
                您创建的书签分类
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
                          {collection.isPublic ? "公开" : "私密"}
                        </Badge>
                      </div>
                      {collection.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {collection.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>0 个书签</span> {/* TODO: 显示实际书签数量 */}
                        <Link href={`/?collection=${collection.slug}`}>
                          <Button variant="outline" size="sm">
                            查看
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>还没有创建任何分类</p>
                  <Button 
                    onClick={() => setShowCreateDialog(true)}
                    className="mt-4"
                  >
                    创建第一个分类
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
            onCollectionCreated={fetchDashboardData}
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
            onBookmarkCreated={fetchDashboardData}
          />
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}