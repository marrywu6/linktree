# 书签导航树 - 完整配置指南

## 🚀 快速启动

### 1. 安装依赖
```bash
cd linktree
npm install
```

### 2. 数据库设置
```bash
# 初始化数据库
npx prisma db push

# 查看数据库状态
npx prisma studio
```

### 3. 启动项目
```bash
# 开发环境
npm run dev

# 生产环境
npm run build
npm start
```

## 🔐 认证系统配置

### 方式1：密码登录（推荐用于开发）

1. 访问: `http://localhost:3000/setup`
2. 创建管理员账户
3. 使用邮箱密码登录: `http://localhost:3000/login`

### 方式2：GitHub OAuth登录

#### 步骤1：创建GitHub OAuth应用
1. 访问 https://github.com/settings/developers
2. 点击 "New OAuth App" 或 "Register a new application"
3. 填写应用信息：
   - **Application name**: 书签导航树 (或任意名称)
   - **Homepage URL**: `http://localhost:3000` (开发环境)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`

#### 步骤2：配置环境变量
1. 复制 GitHub OAuth 应用的 Client ID 和 Client Secret
2. 编辑 `.env` 文件：
```env
# 必需配置
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# GitHub OAuth 配置
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
```

#### 步骤3：重启应用
```bash
# 停止当前服务 (Ctrl+C)
# 重新启动
npm run dev
```

#### 步骤4：首次登录
1. 访问 `http://localhost:3000/login`
2. 点击 "使用 GitHub 登录"
3. 第一个通过 GitHub 登录的用户将自动成为管理员

## 🔧 故障排除

### 问题1：端口冲突
如果3000端口被占用，Next.js会自动使用其他端口（如3001、3002等）。需要：
1. 记下实际使用的端口号
2. 更新 `.env` 中的 `NEXTAUTH_URL`
3. 更新 GitHub OAuth 应用的回调URL

### 问题2：GitHub OAuth "Access Denied"
常见原因和解决方案：
- **回调URL不匹配**: 确保GitHub应用中的回调URL与 `NEXTAUTH_URL` 一致
- **Client ID/Secret错误**: 重新复制粘贴，确保没有多余空格
- **环境变量未加载**: 重启开发服务器

### 问题3：数据库连接失败
```bash
# 重置数据库
npx prisma db push --force-reset

# 检查数据库文件是否存在
ls -la prisma/dev.db
```

### 问题4：前端API调用失败
1. 检查开发服务器是否正常运行
2. 检查浏览器网络面板中的请求状态
3. 查看服务器终端的错误日志

## 🌐 生产环境配置

### 1. 环境变量配置
```env
# 生产环境配置
DATABASE_URL="your_production_database_url"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secure-random-secret"

# GitHub OAuth 生产环境
GITHUB_CLIENT_ID="production_client_id"
GITHUB_CLIENT_SECRET="production_client_secret"
```

### 2. GitHub OAuth 生产环境设置
- **Homepage URL**: `https://your-domain.com`
- **Authorization callback URL**: `https://your-domain.com/api/auth/callback/github`

### 3. 数据库迁移
```bash
# 应用数据库迁移
npx prisma db push

# 生成 Prisma 客户端
npx prisma generate
```

## 📱 功能使用说明

### 管理员功能
1. **集合管理**: 创建、编辑、删除书签集合
2. **书签导入**: 支持 Chrome、Firefox、Safari 的 HTML 书签文件
3. **用户管理**: 查看和管理用户账户
4. **系统设置**: 配置系统参数

### 普通用户功能
1. **浏览书签**: 查看公开的书签集合
2. **搜索书签**: 按标题、描述、标签搜索
3. **个人收藏**: 收藏感兴趣的集合

## 🔍 API 端点测试

使用 curl 测试 API：

```bash
# 检查系统状态
curl http://localhost:3000/api/setup

# 测试集合API
curl http://localhost:3000/api/collections

# 测试认证状态
curl http://localhost:3000/api/auth/session
```

## 📞 技术支持

如果遇到问题：
1. 查看浏览器开发者工具的控制台错误
2. 查看服务器终端的错误日志
3. 确认所有环境变量正确设置
4. 重启开发服务器

常用调试命令：
```bash
# 查看Prisma生成的客户端
npx prisma generate

# 重置并同步数据库
npx prisma db push --force-reset

# 查看数据库数据
npx prisma studio

# 检查依赖
npm list --depth=0
```