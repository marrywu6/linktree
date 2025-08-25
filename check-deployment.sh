#!/bin/bash

# Vercel 部署前检查脚本

echo "🔍 Vercel 部署前检查"
echo "===================="

# 1. 检查关键文件
echo "📁 检查关键文件..."
files=(
    "prisma/schema.prisma"
    "vercel.json" 
    ".env.production"
    "src/app/api/health/route.ts"
    "VERCEL_TROUBLESHOOTING.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file 缺失"
    fi
done

# 2. 检查 Prisma 配置
echo ""
echo "🗄️ 检查数据库配置..."
if grep -q "postgresql" prisma/schema.prisma; then
    echo "✅ PostgreSQL 已配置"
else
    echo "❌ 仍在使用 SQLite，需要切换到 PostgreSQL"
fi

# 3. 检查构建脚本
echo ""
echo "🔧 检查构建配置..."
if grep -q "vercel:build" package.json; then
    echo "✅ Vercel 构建脚本已配置"
else
    echo "❌ 缺少 vercel:build 脚本"
fi

# 4. 环境变量检查
echo ""
echo "⚙️ 需要在 Vercel 配置的环境变量："
echo "   DATABASE_URL        - PostgreSQL 连接字符串"
echo "   NEXTAUTH_URL        - 生产域名 (https://your-app.vercel.app)"
echo "   NEXTAUTH_SECRET     - 32位随机字符串"
echo "   GITHUB_CLIENT_ID    - GitHub OAuth ID (可选)"
echo "   GITHUB_CLIENT_SECRET - GitHub OAuth Secret (可选)"

# 5. GitHub OAuth 检查
echo ""
echo "🔗 GitHub OAuth 配置检查："
echo "   回调URL: https://your-app.vercel.app/api/auth/callback/github"
echo "   主页URL: https://your-app.vercel.app"

echo ""
echo "🚀 部署就绪检查完成！"
echo ""
echo "📋 下一步操作："
echo "1. 创建 PostgreSQL 数据库 (推荐 Neon.tech)"
echo "2. 在 Vercel 配置环境变量" 
echo "3. 更新 GitHub OAuth 应用设置"
echo "4. 部署并访问 /api/health 检查状态"
echo "5. 访问 /setup 创建管理员账户"