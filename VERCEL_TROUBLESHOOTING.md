# 🚨 Vercel 部署问题解决清单

## 当前问题分析

根据您报告的错误：
1. **GitHub OAuth "Access Denied"** - OAuth 应用配置问题
2. **`{"success":false,"error":"获取设置状态失败"}`** - 数据库连接或表结构问题

## 🔧 立即修复步骤

### 第一步：检查部署状态
访问这个诊断端点查看详细信息：
```
https://your-app.vercel.app/api/health
```

### 第二步：修复数据库连接

#### 选项 A：快速免费方案 - Neon
1. 访问 [neon.tech](https://neon.tech) 创建免费 PostgreSQL 数据库
2. 复制连接字符串，格式类似：
   ```
   postgresql://username:password@ep-example.neon.tech/dbname
   ```
3. 在 Vercel 环境变量中设置 `DATABASE_URL`

#### 选项 B：Supabase
1. 访问 [supabase.com](https://supabase.com) 创建项目
2. 在 Settings > Database 中找到连接字符串
3. 使用 "Direct connection" 格式的 URI

### 第三步：配置 Vercel 环境变量

在 Vercel 项目设置 → Environment Variables 中添加：

| 变量名 | 示例值 | 说明 |
|--------|--------|------|
| `DATABASE_URL` | `postgresql://user:pass@host/db` | PostgreSQL 数据库连接 |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | 你的 Vercel 域名 |
| `NEXTAUTH_SECRET` | `abcd1234...` (32+字符) | 随机密钥 |
| `GITHUB_CLIENT_ID` | `Iv1.abc123...` | GitHub OAuth ID |
| `GITHUB_CLIENT_SECRET` | `ghp_abc123...` | GitHub OAuth Secret |

### 第四步：修复 GitHub OAuth

1. **更新 GitHub OAuth 应用设置**
   - 访问 https://github.com/settings/developers
   - 找到你的应用并点击编辑
   - 设置正确的回调URL：
     ```
     https://your-app-name.vercel.app/api/auth/callback/github
     ```
   - 确保 Homepage URL 也匹配：
     ```
     https://your-app-name.vercel.app
     ```

2. **检查 Client ID 和 Secret**
   - 重新复制 Client ID 和 Client Secret
   - 确保没有多余的空格或换行符
   - 在 Vercel 环境变量中更新

### 第五步：触发重新部署
1. 在 Vercel 仪表板点击 "Redeploy"
2. 或者推送一个空的 commit 到 GitHub:
   ```bash
   git commit --allow-empty -m "trigger redeploy"
   git push
   ```

## 🧪 测试部署

部署完成后按顺序测试：

1. **健康检查**
   ```
   https://your-app.vercel.app/api/health
   ```
   应该返回数据库连接状态

2. **设置状态**
   ```
   https://your-app.vercel.app/api/setup
   ```
   应该返回 `{"success":true,"data":{"isSetup":false,"userCount":0}}`

3. **创建管理员账户**
   ```
   https://your-app.vercel.app/setup
   ```
   填写表单创建管理员

4. **测试 GitHub 登录**
   ```
   https://your-app.vercel.app/login
   ```
   点击 GitHub 登录按钮

## 🔍 故障排除指南

### 如果数据库连接失败
- 检查 `DATABASE_URL` 格式是否正确
- 确认数据库服务正在运行
- 尝试在本地连接数据库测试

### 如果 GitHub OAuth 仍然失败
- 检查回调URL是否完全匹配（包括 https:// 前缀）
- 验证 Client ID 和 Secret 是否正确
- 确认 GitHub 应用状态为 Active

### 如果构建失败
- 查看 Vercel 构建日志
- 检查 `vercel.json` 配置
- 确认所有依赖都在 `package.json` 中

## 📞 获取支持

如果问题持续：

1. **查看详细错误**
   ```bash
   # 访问诊断端点
   curl https://your-app.vercel.app/api/health
   ```

2. **检查 Vercel 函数日志**
   - 在 Vercel 仪表板 → Functions 标签页
   - 查看实时请求日志

3. **本地测试**
   ```bash
   # 拉取生产环境变量
   vercel env pull
   
   # 本地运行
   npm run dev
   ```

## ⚡ 快速修复脚本

如果有访问权限，可以在 Vercel CLI 中运行：

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录并链接项目
vercel link

# 拉取环境变量
vercel env pull

# 运行数据库迁移
npx prisma db push

# 触发重新部署
vercel --prod
```

---

**重要提醒：** 
- PostgreSQL 数据库是生产环境必需的（SQLite 在 Vercel 无法工作）
- 所有环境变量必须在 Vercel 仪表板中正确配置
- GitHub OAuth 回调URL 必须与部署域名完全匹配