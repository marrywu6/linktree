"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface CreateCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateCollectionDialog({ 
  open, 
  onOpenChange,
  onSuccess
}: CreateCollectionDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    isPublic: true,
    viewStyle: "list",
    sortStyle: "alpha",
    sortOrder: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "创建成功",
          description: `集合 "${formData.name}" 已成功创建。`,
        });

        // 重置表单
        setFormData({
          name: "",
          description: "",
          icon: "",
          isPublic: true,
          viewStyle: "list", 
          sortStyle: "alpha",
          sortOrder: 0
        });

        onOpenChange(false);
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          variant: "destructive",
          title: "创建失败",
          description: data.error || "创建集合时发生错误",
        });
      }
    } catch (error) {
      console.error('创建集合错误:', error);
      toast({
        variant: "destructive", 
        title: "创建失败",
        description: "网络错误，请重试",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>创建新集合</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">集合名称 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="输入集合名称"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="输入集合描述（可选）"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">图标URL</Label>
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) => setFormData({...formData, icon: e.target.value})}
              placeholder="输入图标URL（可选）"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) => setFormData({...formData, isPublic: checked})}
            />
            <Label htmlFor="isPublic">公开集合</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>显示样式</Label>
              <Select
                value={formData.viewStyle}
                onValueChange={(value) => setFormData({...formData, viewStyle: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="list">列表</SelectItem>
                  <SelectItem value="grid">网格</SelectItem>
                  <SelectItem value="card">卡片</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>排序方式</Label>
              <Select
                value={formData.sortStyle}
                onValueChange={(value) => setFormData({...formData, sortStyle: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alpha">按名称</SelectItem>
                  <SelectItem value="time">按时间</SelectItem>
                  <SelectItem value="manual">手动</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "创建中..." : "创建集合"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}