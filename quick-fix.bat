@echo off
chcp 65001 >nul
echo 🚀 书签导航树快速修复脚本
echo ============================

echo 1️⃣ 停止所有 Node.js 进程...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

echo 2️⃣ 重置数据库...
call npx prisma db push --force-reset --accept-data-loss
if %errorlevel% neq 0 (
    echo ❌ 数据库重置失败
    pause
    exit /b 1
)

echo 3️⃣ 生成 Prisma 客户端...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Prisma 客户端生成失败
    pause
    exit /b 1
)

echo 4️⃣ 清理 Next.js 缓存...
rmdir /s /q .next >nul 2>&1

echo 5️⃣ 启动开发服务器...
echo ✅ 修复完成！正在启动服务器...
echo.
echo 🌐 访问地址:
echo   - 主页: http://localhost:3000
echo   - 设置管理员: http://localhost:3000/setup
echo   - 登录页面: http://localhost:3000/login
echo.
echo 📝 如需配置 GitHub 登录，请编辑 .env 文件添加:
echo   GITHUB_CLIENT_ID="你的Client ID"
echo   GITHUB_CLIENT_SECRET="你的Client Secret"
echo.

call npm run dev