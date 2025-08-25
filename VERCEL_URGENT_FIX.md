# 🚨 Vercel 部署紧急修复

## 立即行动 - DATABASE_URL 配置

您的构建失败是因为缺少 `DATABASE_URL` 环境变量。请立即按以下步骤操作：

### 步骤 1: 创建免费 PostgreSQL 数据库

**推荐：Neon (完全免费)**
1. 访问 [neon.tech](https://neon.tech)
2. 注册/登录账户
3. 创建新项目
4. 复制连接字符串，格式如：
   ```
   postgresql://username:password@ep-example.neon.tech/database
   ```

**或者：Supabase**
1. 访问 [supabase.com](https://supabase.com)  
2. 创建项目
3. 在 Settings → Database 中获取连接字符串

### 步骤 2: 在 Vercel 配置环境变量

1. 登录 [Vercel 仪表板](https://vercel.com)
2. 进入你的项目
3. 点击 Settings → Environment Variables
4. 添加以下变量：

| 变量名 | 值 | 环境 |
|--------|----|----- |
| `DATABASE_URL` | `postgresql://user:pass@host/db` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Production |
| `NEXTAUTH_SECRET` | 32位随机字符串 | Production, Preview, Development |

**生成随机密钥:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 步骤 3: 触发重新部署

配置完环境变量后：
1. 在 Vercel 仪表板点击 "Redeploy"
2. 或推送新的 commit 触发部署

### 步骤 4: 验证部署

部署成功后访问：
- 健康检查: `https://your-app.vercel.app/api/health`  
- 系统设置: `https://your-app.vercel.app/setup`

## 如果仍然失败

检查环境变量格式：
- ✅ `postgresql://user:pass@host:5432/dbname`
- ✅ `postgres://user:pass@host:5432/dbname`  
- ❌ `file:./dev.db` (SQLite，不支持)
- ❌ 空值或未设置

## GitHub OAuth (可选)

如需 GitHub 登录功能：
1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 创建 OAuth 应用:
   - Homepage URL: `https://your-app.vercel.app`
   - Callback URL: `https://your-app.vercel.app/api/auth/callback/github`
3. 在 Vercel 添加环境变量:
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`

---

⚡ **紧急提醒**: 在配置环境变量前，应用无法正常工作！