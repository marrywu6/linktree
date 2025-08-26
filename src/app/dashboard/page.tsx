"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  Plus, 
  FolderOpen, 
  Bookmark,
  Download,
  Import,
  User,
  LogOut,
  Globe
} from "lucide-react"
import { BookmarkImportDialog } from "@/components/bookmark/BookmarkImportDialog"
import CreateBookmarkDialogGlobal from "@/components/bookmark/CreateBookmarkDialogGlobal"
import Link from "next/link"

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [folders, setFolders] = useState([]);
  const [stats, setStats] = useState({
    totalBookmarks: 0,
    totalFolders: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // 获取统计数据
      const [foldersRes, bookmarksRes] = await Promise.all([
        fetch('/api/folders'),
        fetch('/api/bookmarks')
      ]);
      
      const foldersData = await foldersRes.json();
      const bookmarksData = await bookmarksRes.json();
      
      if (foldersData.success) {
        setFolders(foldersData.data);
      }
      
      if (bookmarksData.success) {
        const tempStats = {
          totalFolders: foldersData.success ? foldersData.data.length : 0,
          totalBookmarks: bookmarksData.total || 0,
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
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">
              {status === "loading" ? "验证登录状态..." : "加载数据中..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">书签管理后台</h1>
            <p className="text-gray-600">管理您的书签和文件夹</p>
          </div>
          <div className="flex items-center space-x-4">
            {session && (
              <>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{session.user?.name || session.user?.email}</span>
                  {session.user?.role === 'admin' && (
                    <Badge variant="default" className="text-xs">管理员</Badge>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  退出登录
                </Button>
              </>
            )}
            <Link href="/">
              <Button variant="outline" size="sm">
                <Globe className="h-4 w-4 mr-2" />
                查看网站
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* 快捷操作 */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Button 
            onClick={() => setShowBookmarkDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            添加书签
          </Button>
          <Button 
            onClick={() => setShowImportDialog(true)}
            variant="outline"
          >
            <Import className="h-4 w-4 mr-2" />
            导入书签
          </Button>
          <Button 
            onClick={() => setShowImportDialog(true)}
            variant="outline"
          >
            <Import className="h-4 w-4 mr-2" />
            导入书签
          </Button>
        </div>

        {/* 简化的统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                书签总数
              </CardTitle>
              <Bookmark className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalBookmarks}</div>
              <p className="text-xs text-gray-500">已保存网站</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                文件夹数量
              </CardTitle>
              <FolderOpen className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalFolders}</div>
              <p className="text-xs text-gray-500">组织分类</p>
            </CardContent>
          </Card>
        </div>

        {/* 功能卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Bookmark className="h-5 w-5 mr-2 text-blue-600" />
                书签管理
              </CardTitle>
              <CardDescription>
                添加、编辑和整理您的书签
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
                onClick={() => window.location.href = '/'}
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                查看文件夹
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Upload className="h-5 w-5 mr-2 text-green-600" />
                导入书签
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
        </div>

        {/* 文件夹概览 */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>我的文件夹</CardTitle>
            <CardDescription>您创建的书签文件夹</CardDescription>
          </CardHeader>
          <CardContent>
            {folders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {folders.slice(0, 6).map((folder: any) => (
                  <div
                    key={folder.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 truncate">
                        📁 {folder.name}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{folder._count.bookmarks} 个书签</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // 在dashboard内显示文件夹详情，而不是跳转
                          // 这里可以设置一个状态来显示文件夹详情模态框
                          console.log('显示文件夹详情:', folder.id);
                        }}
                      >
                        管理
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>还没有任何文件夹</p>
                <p className="text-sm mt-2">导入浏览器书签时将自动创建文件夹</p>
                <Button 
                  onClick={() => setShowImportDialog(true)}
                  className="mt-4"
                >
                  开始导入书签
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

        {showBookmarkDialog && (
          <CreateBookmarkDialogGlobal
            open={showBookmarkDialog}
            onOpenChange={setShowBookmarkDialog}
            onSuccess={fetchDashboardData}
          />
        )}
    </div>
  );
}