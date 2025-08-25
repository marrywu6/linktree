#!/bin/bash

# Linktree Vercel 部署脚本
# 用于修复配置问题后的重新部署

echo "🚀 开始重新部署 Linktree 到 Vercel..."

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ 未安装 Vercel CLI，请先安装:"
    echo "npm install -g vercel"
    exit 1
fi

# 检查是否已登录 Vercel
if ! vercel whoami &> /dev/null; then
    echo "❌ 未登录 Vercel，请先登录:"
    echo "vercel login"
    exit 1
fi

# 生成 Prisma 客户端
echo "📦 生成 Prisma 客户端..."
npx prisma generate

# 构建项目
echo "🔨 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败，请检查错误信息"
    exit 1
fi

# 部署到 Vercel
echo "🚀 部署到 Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ 部署成功！"
    echo ""
    echo "🔍 请检查以下地址是否正常工作:"
    echo "  - 主页: https://linktree-eight-jade.vercel.app"
    echo "  - 登录: https://linktree-eight-jade.vercel.app/login"
    echo "  - 设置: https://linktree-eight-jade.vercel.app/setup"
    echo "  - API状态: https://linktree-eight-jade.vercel.app/api/setup"
else
    echo "❌ 部署失败，请检查错误信息"
    exit 1
fi

echo ""
echo "📝 如果仍然遇到问题，请参考 VERCEL_SETUP.md 文件"