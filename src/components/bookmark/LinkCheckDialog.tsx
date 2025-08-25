"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  RefreshCw,
  XCircle
} from "lucide-react";

interface LinkCheckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface LinkCheckResult {
  id?: string;
  title?: string;
  url: string;
  valid: boolean;
  status: number;
  error?: string;
}

interface CheckProgress {
  total: number;
  checked: number;
  valid: number;
  invalid: number;
  results: LinkCheckResult[];
}

export function LinkCheckDialog({ open, onOpenChange }: LinkCheckDialogProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState<CheckProgress | null>(null);
  const [error, setError] = useState<string>("");

  const handleStartCheck = async () => {
    setIsChecking(true);
    setProgress(null);
    setError("");

    try {
      const response = await fetch('/api/bookmarks/check-validity');
      const data = await response.json();

      if (data.success) {
        setProgress(data.data);
      } else {
        setError(data.error || '检查失败');
      }
    } catch (error) {
      console.error('Error checking links:', error);
      setError('检查过程中发生错误');
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-green-600";
    if (status >= 300 && status < 400) return "text-yellow-600";
    if (status >= 400 && status < 500) return "text-orange-600";
    if (status >= 500) return "text-red-600";
    return "text-gray-600";
  };

  const getStatusBadge = (result: LinkCheckResult) => {
    if (result.valid) {
      return <Badge variant="default" className="bg-green-100 text-green-700">有效</Badge>;
    } else {
      return <Badge variant="destructive">失效</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            链接有效性检查
          </DialogTitle>
          <DialogDescription>
            检查您的书签链接是否仍然有效可访问
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 开始检查 */}
          {!progress && !isChecking && (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-blue-500" />
              <h3 className="text-lg font-semibold mb-2">检查书签链接</h3>
              <p className="text-gray-600 mb-6">
                我们将检查您的所有书签链接，确认它们是否仍然可以访问
              </p>
              <Button onClick={handleStartCheck} className="px-8">
                <RefreshCw className="h-4 w-4 mr-2" />
                开始检查
              </Button>
            </div>
          )}

          {/* 检查进行中 */}
          {isChecking && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">正在检查链接...</h3>
              <p className="text-gray-600 mb-4">这可能需要几分钟时间，请耐心等待</p>
            </div>
          )}

          {/* 检查结果 */}
          {progress && (
            <div className="space-y-6">
              {/* 统计摘要 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {progress.total}
                  </div>
                  <div className="text-sm text-gray-600">总链接数</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {progress.valid}
                  </div>
                  <div className="text-sm text-gray-600">有效链接</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {progress.invalid}
                  </div>
                  <div className="text-sm text-gray-600">失效链接</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">
                    {progress.total > 0 ? ((progress.valid / progress.total) * 100).toFixed(1) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">有效率</div>
                </div>
              </div>

              {/* 详细结果列表 */}
              {progress.results.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">检查结果详情</h3>
                  
                  {/* 失效链接 */}
                  {progress.results.filter(r => !r.valid).length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-red-600 flex items-center">
                        <XCircle className="h-4 w-4 mr-2" />
                        失效链接 ({progress.results.filter(r => !r.valid).length})
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {progress.results
                          .filter(r => !r.valid)
                          .map((result, index) => (
                            <div 
                              key={index}
                              className="flex items-center justify-between p-3 border rounded-lg bg-red-50 border-red-200"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium truncate">
                                    {result.title || '未命名书签'}
                                  </span>
                                  {getStatusBadge(result)}
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                  <a 
                                    href={result.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline truncate flex items-center"
                                  >
                                    {result.url}
                                    <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                                  </a>
                                </div>
                                {result.error && (
                                  <p className="text-sm text-red-600 mt-1">
                                    错误: {result.error}
                                  </p>
                                )}
                              </div>
                              <div className="ml-4 text-right">
                                <span className={`text-sm font-mono ${getStatusColor(result.status)}`}>
                                  {result.status || 'N/A'}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* 有效链接摘要 */}
                  {progress.valid > 0 && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <strong>{progress.valid}</strong> 个链接检查正常，可以正常访问。
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* 建议操作 */}
                  {progress.invalid > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <p className="font-medium">发现 {progress.invalid} 个失效链接，建议您：</p>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>检查链接是否暂时无法访问</li>
                            <li>搜索相关内容的新链接</li>
                            <li>删除不再需要的书签</li>
                            <li>更新为正确的链接地址</li>
                          </ul>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
          {progress && (
            <Button onClick={handleStartCheck}>
              <RefreshCw className="h-4 w-4 mr-2" />
              重新检查
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}