#!/bin/bash

# 书签导航树 - 系统诊断脚本

echo "🔧 书签导航树系统诊断 - $(date)"
echo "================================"

# 检查端口状态
echo "📡 检查端口状态..."
if curl -s "http://localhost:3000/api/setup" > /dev/null; then
    echo "✅ API 服务器正常运行 (端口 3000)"
    echo "   响应: $(curl -s "http://localhost:3000/api/setup")"
else
    echo "❌ API 服务器无响应 (端口 3000)"
fi

# 检查数据库状态
echo ""
echo "🗄️ 检查数据库状态..."
if [ -f "prisma/dev.db" ]; then
    echo "✅ 数据库文件存在: prisma/dev.db"
    
    # 检查用户数量
    USER_COUNT=$(curl -s "http://localhost:3000/api/setup" | grep -o '"userCount":[0-9]*' | cut -d':' -f2)
    echo "   用户数量: $USER_COUNT"
    
    if [ "$USER_COUNT" -gt 0 ]; then
        echo "✅ 系统已初始化"
    else
        echo "⚠️ 系统未初始化，需要创建管理员账户"
    fi
else
    echo "❌ 数据库文件不存在"
fi

# 检查环境变量
echo ""
echo "⚙️ 检查环境变量..."
if [ -f ".env" ]; then
    echo "✅ .env 文件存在"
    
    # 检查关键配置
    NEXTAUTH_URL=$(grep NEXTAUTH_URL .env | cut -d'=' -f2 | tr -d '"')
    GITHUB_CLIENT_ID=$(grep GITHUB_CLIENT_ID .env | cut -d'=' -f2 | tr -d '"')
    
    echo "   NEXTAUTH_URL: $NEXTAUTH_URL"
    
    if [ -n "$GITHUB_CLIENT_ID" ]; then
        echo "✅ GitHub OAuth 已配置"
    else
        echo "⚠️ GitHub OAuth 未配置 (仅支持密码登录)"
    fi
else
    echo "❌ .env 文件不存在"
fi

# 检查关键文件
echo ""
echo "📁 检查关键文件..."
FILES=(
    "src/app/api/setup/route.ts"
    "src/app/api/collections/route.ts" 
    "src/app/api/auth/[...nextauth]/options.ts"
    "src/app/setup/page.tsx"
    "src/app/login/page.tsx"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file 缺失"
    fi
done

# API 端点测试
echo ""
echo "🧪 API 端点测试..."
ENDPOINTS=(
    "/api/setup"
    "/api/collections"
    "/api/auth/session"
)

for endpoint in "${ENDPOINTS[@]}"; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$endpoint")
    if [ "$HTTP_CODE" -eq 200 ]; then
        echo "✅ $endpoint (HTTP $HTTP_CODE)"
    else
        echo "❌ $endpoint (HTTP $HTTP_CODE)"
    fi
done

# 进程检查
echo ""
echo "⚡ 进程检查..."
if pgrep -f "next dev" > /dev/null; then
    echo "✅ Next.js 开发服务器正在运行"
else
    echo "❌ Next.js 开发服务器未运行"
fi

echo ""
echo "🔍 如果发现问题，请执行以下命令:"
echo "  npm run dev          # 启动开发服务器"
echo "  npx prisma db push   # 同步数据库"
echo "  npx prisma studio    # 查看数据库"
echo ""
echo "✨ 访问地址:"
echo "  主页: http://localhost:3000"
echo "  登录: http://localhost:3000/login"  
echo "  设置: http://localhost:3000/setup"
echo "================================"