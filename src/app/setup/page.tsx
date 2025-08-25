"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Shield, CheckCircle, AlertCircle } from "lucide-react";

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [alreadySetup, setAlreadySetup] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  // 检查是否已经初始化
  useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        const response = await fetch('/api/setup');
        const data = await response.json();

        if (data.success && data.data.isSetup) {
          setAlreadySetup(true);
        } else if (!data.success) {
          // 显示配置错误信息
          if (data.error === '数据库配置缺失') {
            setError('数据库配置缺失，请在 Vercel 中配置 DATABASE_URL 环境变量');
          } else if (data.error === '数据库连接失败') {
            setError('数据库连接失败，请检查 DATABASE_URL 配置是否正确');
          } else {
            setError(`系统配置错误: ${data.error}`);
          }
        }
      } catch (error) {
        console.error('检查设置状态失败:', error);
        setError('无法连接到服务器，请检查网络连接或稍后重试');
      } finally {
        setCheckingSetup(false);
      }
    };

    checkSetupStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 验证表单
    if (!formData.name || !formData.email || !formData.password) {
      setError("请填写所有必需字段");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("两次输入的密码不一致");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      console.log('Setup response:', { status: response.status, data });

      if (data.success) {
        setSuccess("管理员账户创建成功！正在跳转到登录页面...");
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        // 根据错误类型提供更具体的错误信息
        let errorMessage = data.error || "创建失败";

        if (data.error === '数据库配置缺失') {
          errorMessage = '数据库配置缺失，请在 Vercel 中配置 DATABASE_URL 环境变量';
        } else if (data.error === '数据库连接失败') {
          errorMessage = '数据库连接失败，请检查 DATABASE_URL 配置是否正确';
        } else if (data.error === '数据库认证失败') {
          errorMessage = '数据库认证失败，请检查数据库用户名和密码';
        } else if (data.error === '邮箱已存在') {
          errorMessage = '该邮箱已被注册，请使用其他邮箱';
        }

        setError(errorMessage);
        console.error('Setup failed:', data);
      }
    } catch (error) {
      console.error('Setup error:', error);
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">检查系统状态...</p>
        </div>
      </div>
    );
  }

  if (alreadySetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>系统已初始化</CardTitle>
            <CardDescription>
              管理员账户已存在，请直接登录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/login')} 
              className="w-full"
            >
              前往登录
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">初始化系统</CardTitle>
            <CardDescription>
              欢迎使用书签导航树！请创建管理员账户来开始使用
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">管理员姓名 *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入您的姓名"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">邮箱地址 *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">密码 *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="请输入密码（至少6位）"
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认密码 *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="请再次输入密码"
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    创建中...
                  </div>
                ) : (
                  <>
                    <User className="w-4 h-4 mr-2" />
                    创建管理员账户
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t text-center text-sm text-gray-500">
              <p>创建成功后，您将可以使用管理员权限访问所有功能</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}