"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Folder,
  Download,
  X 
} from "lucide-react";
import { Collection } from "@prisma/client";

interface BookmarkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete?: () => void;
}

interface ImportResult {
  totalProcessed: number;
  imported: number;
  skipped: number;
  foldersCreated: number;
  errors: string[];
}

export function BookmarkImportDialog({ 
  open, 
  onOpenChange,
  onImportComplete 
}: BookmarkImportDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [createFolders, setCreateFolders] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string>("");

  // 获取分类列表
  useEffect(() => {
    if (open) {
      fetchCollections();
    }
  }, [open]);

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/collections');
      const data = await response.json();
      if (data.success) {
        setCollections(data.data);
        if (data.data.length > 0) {
          setSelectedCollectionId(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
      setError('获取分类列表失败');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError("");
      setImportResult(null);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setError("");
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !selectedCollectionId) {
      setError('请选择文件和目标分类');
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    setError("");

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('collectionId', selectedCollectionId);
      formData.append('createFolders', createFolders.toString());

      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/bookmarks/import', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setImportProgress(100);

      const data = await response.json();

      if (data.success) {
        setImportResult(data.data);
        onImportComplete?.();
      } else {
        setError(data.error || '导入失败');
      }
    } catch (error) {
      console.error('Import error:', error);
      setError('导入过程中发生错误');
    } finally {
      setIsImporting(false);
    }
  };

  const resetDialog = () => {
    setSelectedFile(null);
    setError("");
    setImportResult(null);
    setImportProgress(0);
    setIsImporting(false);
  };

  const handleClose = () => {
    resetDialog();
    onOpenChange(false);
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.toLowerCase().split('.').pop();
    return ext === 'json' ? '📄' : '🌐';
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            导入浏览器书签
          </DialogTitle>
          <DialogDescription>
            从Chrome、Firefox、Safari等浏览器导入您的书签收藏
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 文件上传区域 */}
          {!importResult && (
            <>
              <div className="space-y-4">
                <Label>选择书签文件</Label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => document.getElementById('bookmark-file-input')?.click()}
                >
                  <input
                    id="bookmark-file-input"
                    type="file"
                    accept=".html,.htm,.json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {selectedFile ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-2xl">{getFileIcon(selectedFile.name)}</span>
                        <FileText className="h-6 w-6 text-blue-500" />
                      </div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        重新选择
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Download className="h-12 w-12 mx-auto text-gray-400" />
                      <p className="text-gray-600">点击选择文件或拖拽到此处</p>
                      <p className="text-sm text-gray-500">
                        支持 HTML (.html) 和 JSON (.json) 格式
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 导入选项 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>目标分类</Label>
                  <Select value={selectedCollectionId} onValueChange={setSelectedCollectionId}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择要导入到的分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {collections.map((collection) => (
                        <SelectItem key={collection.id} value={collection.id}>
                          {collection.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="create-folders"
                    checked={createFolders}
                    onCheckedChange={setCreateFolders}
                  />
                  <Label htmlFor="create-folders" className="flex items-center space-x-2">
                    <Folder className="h-4 w-4" />
                    <span>保持原有文件夹结构</span>
                  </Label>
                </div>
              </div>

              {/* 使用说明 */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p><strong>如何导出浏览器书签：</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><strong>Chrome:</strong> 书签管理器 → 整理 → 导出书签</li>
                      <li><strong>Firefox:</strong> 书签 → 管理书签 → 导入和备份 → 导出书签为HTML</li>
                      <li><strong>Safari:</strong> 文件 → 导出书签</li>
                      <li><strong>Edge:</strong> 收藏夹 → 管理收藏夹 → 导出收藏夹</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            </>
          )}

          {/* 导入进度 */}
          {isImporting && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="font-medium">正在导入书签...</p>
                <p className="text-sm text-gray-500">请勿关闭此窗口</p>
              </div>
              <Progress value={importProgress} className="w-full" />
            </div>
          )}

          {/* 导入结果 */}
          {importResult && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">导入完成！</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {importResult.totalProcessed}
                  </div>
                  <div className="text-sm text-gray-600">总计处理</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {importResult.imported}
                  </div>
                  <div className="text-sm text-gray-600">成功导入</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {importResult.skipped}
                  </div>
                  <div className="text-sm text-gray-600">跳过重复</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {importResult.foldersCreated}
                  </div>
                  <div className="text-sm text-gray-600">文件夹创建</div>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">部分项目导入失败：</p>
                      <ul className="text-sm space-y-1">
                        {importResult.errors.slice(0, 5).map((error, index) => (
                          <li key={index} className="text-red-600">• {error}</li>
                        ))}
                        {importResult.errors.length > 5 && (
                          <li className="text-gray-500">
                            ... 以及其他 {importResult.errors.length - 5} 个错误
                          </li>
                        )}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* 错误信息 */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            {importResult ? '完成' : '取消'}
          </Button>
          {!importResult && !isImporting && (
            <Button 
              onClick={handleImport}
              disabled={!selectedFile || !selectedCollectionId}
            >
              开始导入
            </Button>
          )}
          {importResult && (
            <Button onClick={resetDialog}>
              继续导入
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}