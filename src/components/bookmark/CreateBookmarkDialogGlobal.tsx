"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Check, ChevronsUpDown, Folder } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  displayName?: string;
}

interface CreateBookmarkDialogGlobalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultFolderId?: string;
  onSuccess?: (folderId?: string) => void;
}

interface UrlInfo {
  title: string;
  description: string;
  icon: string;
  icons: string[];
  error?: string;
}

export default function CreateBookmarkDialogGlobal({
  open,
  onOpenChange,
  defaultFolderId,
  onSuccess
}: CreateBookmarkDialogGlobalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [folders, setFolders] = useState<Folder[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
    icon: "",
    folderId: defaultFolderId || "",
    isFeatured: false,
    sortOrder: 0
  });

  const [hasLoadedInfo, setHasLoadedInfo] = useState(false);
  const [availableIcons, setAvailableIcons] = useState<string[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // 修改 useEffect，当对话框关闭时重置所有状态
  useEffect(() => {
    if (!open) {
      setHasLoadedInfo(false);
      setError("");
      setFormData({
        title: "",
        url: "",
        description: "",
        icon: "",
        folderId: defaultFolderId || "",
        isFeatured: false,
        sortOrder: 0
      });
    }
  }, [open, defaultFolderId]);

  // 初始化时获取文件夹列表
  useEffect(() => {
    fetchFolders();
  }, []);

  // 当默认值改变时更新表单
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      folderId: defaultFolderId || ""
    }));
  }, [defaultFolderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          folderId: formData.folderId || null
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "创建失败");
        return;
      }

      onOpenChange(false);
      onSuccess?.(formData.folderId || undefined);
      
      // 重置表单
      setFormData({
        title: "",
        url: "",
        description: "",
        icon: "",
        folderId: defaultFolderId || "",
        isFeatured: false,
        sortOrder: 0
      });
    } catch (error) {
      console.error("Create bookmark failed:", error);
      setError("创建书签失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await fetch("/api/folders");
      const data = await response.json();
      
      if (data.success) {
        // 处理文件夹数据，添加完整路径显示
        const processedFolders = data.data.map((folder: Folder) => {
          // 简单处理，可以后续添加层级显示逻辑
          return {
            ...folder,
            displayName: folder.name
          };
        });
        
        setFolders(processedFolders);
      }
    } catch (error) {
      console.error("Failed to fetch folders:", error);
    }
  };

  // 添加 URL 验证函数
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加书签</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert>
              <AlertDescription className="text-red-600">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>文件夹</Label>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={popoverOpen}
                  className="w-full justify-between"
                >
                  {formData.folderId ? 
                    folders.find(f => f.id === formData.folderId)?.displayName || "选择文件夹" :
                    "根目录"
                  }
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="搜索文件夹..." />
                  <CommandList>
                    <CommandEmpty>未找到文件夹</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          setFormData(prev => ({ ...prev, folderId: "" }));
                          setPopoverOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            !formData.folderId ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span>📚 根目录</span>
                      </CommandItem>
                      {folders.map((folder) => (
                        <CommandItem
                          key={folder.id}
                          onSelect={() => {
                            setFormData(prev => ({ ...prev, folderId: folder.id }));
                            setPopoverOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.folderId === folder.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <Folder className="mr-2 h-4 w-4" />
                          <span>📁 {folder.displayName}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>网址</Label>
            <Input
              type="url"
              value={formData.url}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, url: e.target.value }))
              }
              placeholder="https://example.com"
              required
            />
          </div>

          {/* 仅在获取信息后显示这些字段 */}
          {hasLoadedInfo && (
            <>
              <div className="space-y-2">
                <Label>标题</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>描述</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>图标URL</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="url"
                      value={formData.icon}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, icon: e.target.value }))
                      }
                    />
                  </div>
                  {formData.icon && (
                    <div className="flex items-center">
                      <img
                        src={formData.icon}
                        alt="Icon preview"
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                {availableIcons.length > 0 && (
                  <div className="mt-2">
                    <Label className="text-sm text-gray-500">选择图标</Label>
                    <div className="grid grid-cols-6 gap-2 mt-1">
                      {availableIcons.map((iconUrl, index) => (
                        <button
                          key={index}
                          type="button"
                          className={`p-2 border rounded hover:bg-gray-100 ${
                            formData.icon === iconUrl ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, icon: iconUrl }))}
                        >
                          <img
                            src={iconUrl}
                            alt={`图标 ${index + 1}`}
                            className="w-6 h-6 object-contain mx-auto"
                            onError={(e) => {
                              (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isFeatured: checked }))
                  }
                />
                <Label htmlFor="featured">设为精选书签</Label>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setError("");
                onOpenChange(false);
              }}
            >
              取消
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              onClick={async (e) => {
                e.preventDefault();
                
                if (!formData.url) {
                  setError("请输入网址");
                  return;
                }

                if (!isValidUrl(formData.url)) {
                  setError("请输入有效的网址，例如 https://example.com");
                  return;
                }

                if (!hasLoadedInfo) {
                  try {
                    setLoading(true);
                    const response = await fetch("/api/url-info", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ url: formData.url }),
                    });
                    
                    const data: UrlInfo = await response.json();
                    
                    if (!response.ok) {
                      throw new Error(data.error || "获取网址信息失败");
                    }
                    
                    setFormData(prev => ({
                      ...prev,
                      title: data.title || prev.title,
                      description: data.description || prev.description,
                      icon: data.icon || prev.icon,
                    }));
                    setAvailableIcons(data.icons || []);
                    setHasLoadedInfo(true);
                  } catch (error) {
                    console.error("Failed to get URL information:", error);
                    setError(error instanceof Error ? error.message : "获取网址信息失败");
                  } finally {
                    setLoading(false);
                  }
                } else {
                  handleSubmit(e);
                }
              }}
            >
              {loading ? "获取中..." : (hasLoadedInfo ? "创建" : "获取信息")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
