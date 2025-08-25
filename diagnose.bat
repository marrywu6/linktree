@echo off
chcp 65001 >nul
echo 🔧 书签导航树系统诊断 - %date% %time%
echo ================================

REM 检查端口状态
echo 📡 检查端口状态...
curl -s "http://localhost:3000/api/setup" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ API 服务器正常运行 ^(端口 3000^)
    echo    响应: 
    curl -s "http://localhost:3000/api/setup"
) else (
    echo ❌ API 服务器无响应 ^(端口 3000^)
)

echo.
echo 🗄️ 检查数据库状态...
if exist "prisma\dev.db" (
    echo ✅ 数据库文件存在: prisma\dev.db
) else (
    echo ❌ 数据库文件不存在
)

echo.
echo ⚙️ 检查环境变量...
if exist ".env" (
    echo ✅ .env 文件存在
    findstr "NEXTAUTH_URL" .env
    findstr "GITHUB_CLIENT_ID" .env
) else (
    echo ❌ .env 文件不存在
)

echo.
echo 📁 检查关键文件...
set files[0]=src\app\api\setup\route.ts
set files[1]=src\app\api\collections\route.ts
set files[2]=src\app\api\auth\[...nextauth]\options.ts
set files[3]=src\app\setup\page.tsx
set files[4]=src\app\login\page.tsx

for /l %%i in (0,1,4) do (
    call set file=%%files[%%i]%%
    call set file=%%file%%
    if exist "%%file%%" (
        echo ✅ %%file%%
    ) else (
        echo ❌ %%file%% 缺失
    )
)

echo.
echo 🧪 API 端点测试...
curl -s -o nul -w "HTTP %%{http_code}" "http://localhost:3000/api/setup"
echo  - /api/setup
curl -s -o nul -w "HTTP %%{http_code}" "http://localhost:3000/api/collections" 
echo  - /api/collections
curl -s -o nul -w "HTTP %%{http_code}" "http://localhost:3000/api/auth/session"
echo  - /api/auth/session

echo.
echo ⚡ 进程检查...
tasklist | findstr node >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js 进程正在运行
) else (
    echo ❌ Node.js 进程未找到
)

echo.
echo 🔍 如果发现问题，请执行以下命令:
echo   npm run dev          # 启动开发服务器
echo   npx prisma db push   # 同步数据库
echo   npx prisma studio    # 查看数据库
echo.
echo ✨ 访问地址:
echo   主页: http://localhost:3000
echo   登录: http://localhost:3000/login
echo   设置: http://localhost:3000/setup
echo ================================
pause