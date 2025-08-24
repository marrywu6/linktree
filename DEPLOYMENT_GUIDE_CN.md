# 📚 LinkTree 书签管理系统部署指南

## 🚀 快速部署

### 环境要求

- **Node.js**: 18.x 或更高版本
- **包管理器**: npm、pnpm 或 yarn
- **数据库**: SQLite（开发）/ PostgreSQL（生产）
- **部署平台**: Vercel、Netlify、Railway 等

## 📋 部署前准备

### 1. 克隆项目
```bash
git clone https://github.com/your-repo/linktree.git
cd linktree
```

### 2. 安装依赖
```bash
# 使用 npm
npm install

# 使用 pnpm（推荐）
pnpm install

# 使用 yarn
yarn install
```

### 3. 环境变量配置
创建 `.env.local` 文件：

```env
# 数据库连接
DATABASE_URL="postgresql://username:password@localhost:5432/linktree"
# 开发环境使用 SQLite
# DATABASE_URL="file:./prisma/dev.db"

# NextAuth 配置
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-super-secret-key-here"

# 可选：上传服务配置
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"
```

## 🌐 部署选项

## 选项 1: Vercel 部署（推荐）

### 🎯 一键部署
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/linktree)

### 🔧 手动部署步骤

1. **连接 GitHub**
   - 登录 [Vercel Dashboard](https://vercel.com/dashboard)
   - 点击 "Add New Project"
   - 选择您的 GitHub 仓库

2. **配置环境变量**
   ```
   DATABASE_URL=your_postgresql_connection_string
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your_secret_key
   ```

3. **数据库设置**
   ```bash
   # 推送数据库结构
   npx prisma db push
   
   # 生成 Prisma 客户端
   npx prisma generate
   ```

4. **部署**
   - Vercel 会自动构建和部署
   - 访问提供的 URL 查看应用

### 📊 Vercel 配置文件 (vercel.json)
```json
{
  "framework": "nextjs",
  "buildCommand": "prisma generate && prisma db push && next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

## 选项 2: Railway 部署

### 🚂 部署步骤

1. **创建项目**
   ```bash
   # 安装 Railway CLI
   npm install -g @railway/cli
   
   # 登录并创建项目
   railway login
   railway init
   ```

2. **添加 PostgreSQL**
   ```bash
   railway add postgresql
   ```

3. **设置环境变量**
   ```bash
   railway variables set NEXTAUTH_URL=https://your-app.railway.app
   railway variables set NEXTAUTH_SECRET=your_secret_key
   ```

4. **部署**
   ```bash
   railway up
   ```

## 选项 3: 自托管 (Docker)

### 🐳 Docker 部署

1. **创建 Dockerfile**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

2. **创建 docker-compose.yml**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/pintree
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=your-secret-key
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=pintree
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

3. **运行**
```bash
docker-compose up -d
```

## 选项 4: Netlify 部署

### 📱 部署步骤

1. **配置 netlify.toml**
```toml
[build]
  publish = ".next"
  command = "prisma generate && prisma db push && npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  node_bundler = "esbuild"
```

2. **连接并部署**
   - 登录 Netlify
   - 连接 GitHub 仓库
   - 配置环境变量
   - 部署

## 🗄️ 数据库配置

### PostgreSQL（生产环境推荐）

1. **服务提供商选择**
   - [Supabase](https://supabase.com) - 免费层可用
   - [PlanetScale](https://planetscale.com) - MySQL 兼容
   - [Railway](https://railway.app) - PostgreSQL
   - [Neon](https://neon.tech) - Serverless PostgreSQL

2. **连接字符串示例**
```env
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
```

3. **初始化数据库**
```bash
# 推送 Prisma schema
npx prisma db push

# 查看数据库
npx prisma studio
```

### SQLite（开发环境）
```env
DATABASE_URL="file:./prisma/dev.db"
```

## 🔐 环境变量详解

### 必需变量
```env
# 数据库连接（必需）
DATABASE_URL="your_database_connection_string"

# NextAuth 配置（必需）
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="a-very-long-random-string"
```

### 可选变量
```env
# 上传服务（可选）
UPLOADTHING_SECRET="your_uploadthing_secret"
UPLOADTHING_APP_ID="your_uploadthing_app_id"

# 邮件服务（可选）
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="user@example.com"
EMAIL_SERVER_PASSWORD="password"
EMAIL_FROM="noreply@example.com"

# OAuth 提供商（可选）
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
```

## 🚀 生产环境优化

### 1. 性能优化
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  images: {
    domains: ['your-image-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
}

module.exports = nextConfig
```

### 2. 安全配置
```javascript
// middleware.ts
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // 中间件逻辑
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"]
}
```

### 3. 缓存策略
```javascript
// 在 API 路由中设置缓存
export async function GET() {
  const data = await fetchData()
  
  return new Response(JSON.stringify(data), {
    headers: {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'Content-Type': 'application/json',
    },
  })
}
```

## 🔍 故障排除

### 常见问题

1. **数据库连接失败**
   ```bash
   # 检查连接
   npx prisma db pull
   
   # 重新生成客户端
   npx prisma generate
   ```

2. **构建失败**
   ```bash
   # 清理缓存
   rm -rf .next
   npm run build
   ```

3. **环境变量问题**
   ```bash
   # 检查环境变量
   echo $DATABASE_URL
   ```

### 调试模式
```bash
# 启用详细日志
DEBUG=prisma:* npm run dev
```

## 📊 监控和分析

### 1. Vercel Analytics
```javascript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 2. 错误追踪
```javascript
// 集成 Sentry
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

## 🔄 CI/CD 自动化

### GitHub Actions 工作流
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📈 扩展性考虑

### 1. CDN 配置
- 使用 Vercel Edge Network 或 Cloudflare
- 优化静态资源缓存

### 2. 数据库优化
- 配置连接池
- 添加数据库索引
- 考虑读写分离

### 3. 负载均衡
```javascript
// 多实例部署配置
const cluster = require('cluster')
const numCPUs = require('os').cpus().length

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }
} else {
  require('./server.js')
}
```

## 🆘 获取帮助

- 📖 [官方文档](https://docs.pintree.io)
- 💬 [Discord 社区](https://discord.gg/pintree)
- 🐛 [GitHub Issues](https://github.com/pintree-io/pintree/issues)
- 📧 [邮箱支持](mailto:support@pintree.io)

## 🎉 部署成功！

恭喜！您的 Pintree 书签管理系统现在已成功部署。享受您的现代化书签管理体验吧！

---

<div align="center">
  <p>Made with ❤️ by the Pintree Team</p>
  <p>
    <a href="https://pintree.io">官网</a> •
    <a href="https://github.com/pintree-io/pintree">GitHub</a> •
    <a href="https://twitter.com/pintree_io">Twitter</a>
  </p>
</div>