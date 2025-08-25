# 📦 Vercel 部署指南

## 🚀 快速部署步骤

### 1. 准备数据库

**选择一个 PostgreSQL 数据库提供商:**

#### 选项 A: Neon (推荐 - 免费)
1. 访问 [neon.tech](https://neon.tech)
2. 创建账户并新建数据库
3. 复制连接字符串: `postgresql://user:pass@host/dbname`

#### 选项 B: Supabase (免费)
1. 访问 [supabase.com](https://supabase.com)
2. 创建项目并获取数据库URL
3. 在设置中找到 Connection String

#### 选项 C: Railway (免费)
1. 访问 [railway.app](https://railway.app)
2. 创建 PostgreSQL 数据库
3. 获取 CONNECTION_URL

### 2. 配置 GitHub OAuth (可选)

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 创建新的 OAuth App:
   - **Application name**: 书签导航树
   - **Homepage URL**: `https://your-app-name.vercel.app`
   - **Authorization callback URL**: `https://your-app-name.vercel.app/api/auth/callback/github`
3. 保存 Client ID 和 Client Secret

### 3. 部署到 Vercel

#### 方法 A: 通过 GitHub (推荐)
1. 将代码推送到 GitHub
2. 访问 [vercel.com](https://vercel.com) 并登录
3. 点击 "New Project" 导入 GitHub 仓库
4. 配置环境变量 (见下方)
5. 点击 Deploy

#### 方法 B: 使用 Vercel CLI
```bash
npm i -g vercel
vercel --prod
```

### 4. 配置环境变量

在 Vercel 项目设置中添加以下环境变量:

| 变量名 | 值 | 说明 |
|--------|----|----- |
| `DATABASE_URL` | `postgresql://user:pass@host/db` | PostgreSQL 连接字符串 |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | 你的部署域名 |
| `NEXTAUTH_SECRET` | `random-32-char-string` | 随机密钥 |
| `GITHUB_CLIENT_ID` | `your_client_id` | GitHub OAuth ID (可选) |
| `GITHUB_CLIENT_SECRET` | `your_client_secret` | GitHub OAuth Secret (可选) |

**生成 NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 5. 初始化数据库

部署成功后，数据库需要初始化:

1. 访问 `https://your-app.vercel.app/setup`
2. 创建管理员账户
3. 开始使用！

## 🔧 常见问题解决

### 问题 1: GitHub OAuth "Access Denied"

**原因:** 回调URL配置错误

**解决方案:**
1. 检查 GitHub OAuth App 设置中的回调URL
2. 确保格式为: `https://your-app.vercel.app/api/auth/callback/github`
3. 确保 `NEXTAUTH_URL` 环境变量正确设置
4. 重新部署应用

### 问题 2: "获取设置状态失败"

**原因:** 数据库连接问题

**解决方案:**
1. 检查 `DATABASE_URL` 环境变量是否正确
2. 确认数据库服务是否正常运行
3. 检查数据库是否允许外部连接
4. 在 Vercel 函数日志中查看详细错误

### 问题 3: Build 失败

**原因:** 依赖或配置问题

**解决方案:**
1. 确保所有依赖都在 `package.json` 中
2. 检查 `vercel.json` 配置
3. 查看构建日志找到具体错误

## 🔄 更新部署

1. **自动部署:** 推送到 GitHub 主分支自动触发部署
2. **手动部署:** 在 Vercel 仪表板点击 "Redeploy"
3. **回滚:** 在 Deployments 页面选择之前的版本

## 📊 监控和维护

### Vercel 分析
- 访问量统计
- 性能监控  
- 错误追踪

### 数据库维护
```bash
# 本地迁移数据库 (开发环境)
npx prisma migrate dev

# 生产环境数据库推送
npx prisma db push
```

## 🌍 自定义域名

1. 在 Vercel 项目设置中添加域名
2. 配置 DNS 记录指向 Vercel
3. 更新环境变量中的 `NEXTAUTH_URL`
4. 更新 GitHub OAuth App 的 URLs

## 📞 故障排除

如果遇到问题：

1. **查看 Vercel 函数日志**
   - 在 Vercel 仪表板 → Functions 页面查看实时日志

2. **本地测试**
   ```bash
   npm run dev
   ```

3. **数据库连接测试**
   ```bash
   npx prisma db pull
   ```

4. **清除缓存并重新部署**
   - 在 Vercel 仪表板点击 "Redeploy"

## 📋 部署检查清单

- [ ] PostgreSQL 数据库已创建
- [ ] 所有环境变量已配置
- [ ] GitHub OAuth 应用已设置 (如果使用)
- [ ] Vercel 项目已部署成功
- [ ] 访问 `/setup` 创建管理员账户
- [ ] 功能测试通过

🎉 **部署完成！** 访问你的应用开始使用书签导航树吧！