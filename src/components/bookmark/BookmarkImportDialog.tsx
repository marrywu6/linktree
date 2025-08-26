"use client";

import { useState, useEffect, useRef } from "react";
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
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Download,
  X 
} from "lucide-react";

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

interface ImportProgress {
  type: 'progress' | 'complete' | 'error';
  message: string;
  progress: number;
  stats?: {
    processed: number;
    imported: number;
    skipped: number;
  };
  result?: ImportResult;
}

export function BookmarkImportDialog({ 
  open, 
  onOpenChange,
  onImportComplete 
}: BookmarkImportDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importMessage, setImportMessage] = useState('');
  const [currentStats, setCurrentStats] = useState<{processed: number, imported: number, skipped: number} | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string>("");
  const eventSourceRef = useRef<EventSource | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError("");
      setImportResult(null);
      setImportProgress(0);
      setImportMessage('');
      setCurrentStats(null);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setError("");
      setImportResult(null);
      setImportProgress(0);
      setImportMessage('');
      setCurrentStats(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('请选择文件');
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    setImportMessage('准备导入...');
    setCurrentStats(null);
    setError("");

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // 创建 EventSource 连接
      const response = await fetch('/api/bookmarks/import-stream', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('导入请求失败');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data: ImportProgress = JSON.parse(line.substring(6));
                
                setImportProgress(data.progress);
                setImportMessage(data.message);
                
                if (data.stats) {
                  setCurrentStats(data.stats);
                }
                
                if (data.type === 'complete' && data.result) {
                  setImportResult(data.result);
                  onImportComplete?.();
                } else if (data.type === 'error') {
                  setError(data.message);
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e);
              }
            }
          }
        }
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
    setImportMessage('');
    setCurrentStats(null);
    setIsImporting(false);
  };

  const handleClose = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
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
          {!importResult && !isImporting && (
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
                <p className="font-medium">{importMessage}</p>
                <p className="text-sm text-gray-500">请勿关闭此窗口</p>
              </div>
              <Progress value={importProgress} className="w-full" />
              <div className="text-center text-sm text-gray-600">
                {importProgress}%
              </div>
              
              {/* 实时统计 */}
              {currentStats && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">{currentStats.processed}</div>
                    <div className="text-xs text-gray-600">已处理</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{currentStats.imported}</div>
                    <div className="text-xs text-gray-600">已导入</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-lg font-bold text-yellow-600">{currentStats.skipped}</div>
                    <div className="text-xs text-gray-600">已跳过</div>
                  </div>
                </div>
              )}
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
              disabled={!selectedFile}
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