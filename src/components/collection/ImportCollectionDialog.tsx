"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createFlattenBookmarks } from "@/lib/utils/import-extension-data";
import { Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Textarea } from "@/components/ui/textarea";

interface ImportCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ImportCollectionDialog({
  open,
  onOpenChange,
  onSuccess,
}: ImportCollectionDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    file: null as File | null,
  });

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles[0]) {
      setFormData((prev) => ({
        ...prev,
        file: acceptedFiles[0],
      }));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/json": [".json"],
      "text/html": [".html", ".htm"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB limit
    onError: (error) => {
      console.log(error);
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "file-too-large"
      ) {
        toast({
          variant: "destructive",
          title: "文件过大",
          description: "请选择小于10MB的JSON或HTML文件",
        });
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file || !formData.name) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a file and enter a collection name",
      });
      return;
    }

    setLoading(true);

    try {
      const fileContent = await formData.file.text();
      const jsonData = JSON.parse(fileContent);

      // Batch import logic
      let batchSize = 100; // Process 100 bookmarks per batch

      let importedCollectionId = null;
      let folderMap: { [key: string]: string }[] = [];

      const startTime = Date.now();

      if (jsonData.metadata?.exportedFrom === "Pintree") {
        batchSize = 50
        // Import folders first
        const folderLevels = Object.keys(jsonData.folders)
          .map(Number)
          .sort((a, b) => a - b);

        for (const level of folderLevels) {
          const folderBatches = jsonData.folders[level];

          for (const folderBatch of folderBatches) {
            const folderRequestData = {
              name: formData.name,
              description: formData.description,
              folders: folderBatch,
              collectionId: importedCollectionId, // Will be null for the first batch
              folderMap: folderMap, // Pass existing folder mapping
            };

            const folderResponse: any = await fetch(
              "/api/collections/import-recover-data/recover-folders",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(folderRequestData),
              }
            );

            const folderData: any = await folderResponse.json();

            if (!folderResponse.ok) {
              toast({
                variant: "destructive",
                title: "Folder Import Failed",
                description: folderData.error || "An error occurred while importing folders",
              });
              return;
            }

            // Update collectionId and folderMap
            if (!importedCollectionId) {
              importedCollectionId = folderData.collectionId;
            }
            folderMap = folderData.insideFolderMap;

            // Show folder import progress
            toast({
              title: "Folder Import Progress",
              description: `Importing folders at level ${level}: Batch ${folderBatches.indexOf(folderBatch) + 1}/${folderBatches.length}`,
            });
          }
        }

        // Batch import bookmarks 
        const totalBookmarks = jsonData.bookmarks.length;
        for (let i = 0; i < totalBookmarks; i += batchSize) {
          const batchStartTime = Date.now();
          const batchBookmarks = jsonData.bookmarks.slice(i, i + batchSize);
      
          const requestData = {
            bookmarks: batchBookmarks,
            collectionId: importedCollectionId, // Use the collection ID created when importing folders
            folderMap: folderMap, // Use folder mapping
          };
      
          const response: any = await fetch("/api/collections/import-recover-data/recover-bookmarks", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
          });
      
          const data: any = await response.json();
          const batchEndTime = Date.now();
          const batchDuration = (batchEndTime - batchStartTime) / 1000; // seconds
          const remainingBatches = Math.ceil((totalBookmarks - i - batchSize) / batchSize);
          const estimatedRemainingTime = batchDuration * remainingBatches;
      
          if (!response.ok) {
            toast({
              variant: "destructive",
              title: "Bookmark Import Failed",
              description: data.message || "Failed to import bookmark collection",
            });
            return;
          }
      
          // Show import progress
          toast({
            title: "Bookmark Import Progress",
            description: `Imported ${Math.min(i + batchSize, totalBookmarks)}/${totalBookmarks} bookmarks 
              (${batchDuration.toFixed(2)}s, estimated remaining ${estimatedRemainingTime.toFixed(2)}s)`,
          });
        } 

        // Import completed
      } else {
        const flattenedBookmarks = createFlattenBookmarks(jsonData[0].children);
        const totalBookmarks = flattenedBookmarks.length;
        for (let i = 0; i < totalBookmarks; i += batchSize) {
          const batchStartTime = Date.now();
          const batchBookmarks = flattenedBookmarks.slice(i, i + batchSize);

          const requestData = {
            name: formData.name,
            description: formData.description,
            bookmarks: batchBookmarks,
            collectionId: importedCollectionId, // Append to the same collection in subsequent batches
            folderMap: folderMap,
          };

          const response: any = await fetch("/api/collections/import", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
          });

          const data: any = await response.json();
          const batchEndTime = Date.now();
          const batchDuration = (batchEndTime - batchStartTime) / 1000; // seconds
          const remainingBatches = Math.ceil(
            (totalBookmarks - i - batchSize) / batchSize
          );
          const estimatedRemainingTime = batchDuration * remainingBatches;

          console.log(
            `Batch ${
              Math.floor(i / batchSize) + 1
            } imported, ${remainingBatches} batches remaining`,
            data
          );

          // Show import progress toast with batch time and estimated remaining time
          toast({
            title: "Import Progress",
            description: `Batch ${
              Math.floor(i / batchSize) + 1
            } imported (${batchDuration.toFixed(2)}s). 
          Estimated remaining time: ${estimatedRemainingTime.toFixed(
            2
          )}s (${remainingBatches} batches)`,
          });

          if (!response.ok) {
            toast({
              variant: "destructive",
              title: "Import Failed",
              description: data.message || "Failed to import collection",
            });
            return;
          }

          // Record the first batch's collection ID for subsequent batches
          if (i === 0) {
            importedCollectionId = data.collectionId;
          }

          if (data.insideFolderMap) {
            folderMap = [...data.insideFolderMap];
          }
        }
      }

      const totalImportTime = (Date.now() - startTime) / 1000;

      // Import completion handling
      onOpenChange(false);
      router.refresh();

      // Reset form
      setFormData({
        name: "",
        description: "",
        file: null,
      });

      toast({
        title: "Import Successful",
        description: `Collection "${
          formData.name
        }" imported successfully in ${totalImportTime.toFixed(2)}s`,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to import bookmark collection:", error);
      toast({
        variant: "destructive",
        title: "Import Failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while importing the bookmark collection",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">📚 导入书签集合</DialogTitle>
          <p className="text-sm text-muted-foreground text-center">
            支持浏览器书签HTML文件和JSON格式文件
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">📝 集合名称</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="输入集合名称，如：工作书签、学习资源等"
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">📋 描述信息</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value.slice(0, 140),
                }))
              }
              placeholder="输入集合描述（可选）"
              rows={3}
              className="resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              maxLength={140}
            />
            <div className="text-xs text-muted-foreground text-right">
              {formData.description.length}/140 字符
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file" className="text-sm font-medium">📁 选择文件</Label>
            <div
              {...getRootProps()}
              className={`
                relative border-2 border-dashed rounded-lg p-8 cursor-pointer
                transition-all duration-300 ease-in-out
                hover:border-primary/50 hover:bg-primary/5
                ${
                  isDragActive
                    ? "border-primary bg-primary/10 scale-[1.02]"
                    : "border-gray-300 dark:border-gray-600"
                }
                ${formData.file ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600" : ""}
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4 text-center">
                {formData.file ? (
                  <>
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-800/50 rounded-full flex items-center justify-center">
                      <Upload className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <span className="text-green-700 dark:text-green-300 font-medium text-sm">
                        ✅ {formData.file.name}
                      </span>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        文件大小: {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        🚀 点击上传或拖拽文件到此处
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        支持格式：JSON、HTML（最大10MB）
                      </p>
                      <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded">Chrome</span>
                        <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 rounded">Firefox</span>
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded">Safari</span>
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded">Edge</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {isDragActive && (
                <div className="absolute inset-0 bg-primary/10 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Upload className="h-12 w-12 text-primary mx-auto mb-2" />
                    <p className="text-primary font-medium">释放文件开始导入</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">💡 导入提示：</p>
              <ul className="space-y-1 text-blue-600 dark:text-blue-400">
                <li>• Chrome: 菜单 → 书签 → 书签管理器 → 导出书签</li>
                <li>• Firefox: 菜单 → 书签 → 管理所有书签 → 导入和备份 → 导出书签为HTML</li>
                <li>• Safari: 文件 → 导出书签</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-6"
            >
              取消
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.file || !formData.name}
              className="px-6 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  导入中...
                </>
              ) : (
                <>
                  🚀 开始导入
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}