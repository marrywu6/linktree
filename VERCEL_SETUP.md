# Vercel 部署配置指南

## 问题诊断和解决方案

### 问题1: GitHub登录报错 "Access Denied You do not have permission to sign in"

**原因**: GitHub OAuth 未正确配置

**解决方案**:
1. 访问 [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developments)
2. 创建新的 OAuth App 或配置现有的应用
3. 设置以下参数:
   - **Homepage URL**: `https://linktree-eight-jade.vercel.app`
   - **Authorization callback URL**: `https://linktree-eight-jade.vercel.app/api/auth/callback/github`

### 问题2: Setup API 报错 "获取设置状态失败"

**原因**: 数据库连接失败或环境变量未配置

### 问题3: 管理员账户创建失败

**原因**: 数据库配置问题

## 必需的环境变量配置

在 Vercel 控制台中设置以下环境变量：

### 数据库配置 (必需)
```
DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"
```

**推荐使用**:
- [Neon](https://neon.tech) - 免费 PostgreSQL
- [Supabase](https://supabase.com) - 免费 PostgreSQL
- [PlanetScale](https://planetscale.com) - MySQL

### NextAuth 配置 (必需)
```
NEXTAUTH_URL="https://linktree-eight-jade.vercel.app"
NEXTAUTH_SECRET="your-super-secret-jwt-signing-key-minimum-32-characters"
```

**生成 SECRET 的方法**:
```bash
openssl rand -base64 32
```

### GitHub OAuth 配置 (可选)
```
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
```

## 详细配置步骤

### 1. 数据库设置

#### 使用 Neon (推荐):
1. 访问 [neon.tech](https://neon.tech) 并注册账户
2. 创建新项目
3. 获取连接字符串，格式类似:
   ```
   postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
4. 在 Vercel 中设置 `DATABASE_URL`

### 2. NextAuth 设置

1. 在 Vercel 控制台访问你的项目
2. 进入 **Settings** > **Environment Variables**
3. 添加以下变量:
   - `NEXTAUTH_URL`: 你的 Vercel 域名
   - `NEXTAUTH_SECRET`: 使用上述命令生成的密钥

### 3. GitHub OAuth 设置 (如果需要)

1. 访问 [GitHub OAuth Apps](https://github.com/settings/developments)
2. 点击 **New OAuth App**
3. 填写:
   - **Application name**: Linktree
   - **Homepage URL**: `https://linktree-eight-jade.vercel.app`
   - **Authorization callback URL**: `https://linktree-eight-jade.vercel.app/api/auth/callback/github`
4. 获取 **Client ID** 和 **Client Secret**
5. 在 Vercel 中添加:
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`

## 部署后的验证

### 1. 重新部署
环境变量修改后，需要重新部署项目:
```bash
# 重新部署 Vercel 项目
vercel --prod
```

### 2. 测试连接
访问以下地址测试配置:
- **数据库连接**: `https://linktree-eight-jade.vercel.app/api/setup`
- **GitHub登录**: `https://linktree-eight-jade.vercel.app/login`
- **管理员设置**: `https://linktree-eight-jade.vercel.app/setup`

### 3. 常见错误及解决方案

#### 数据库连接错误
- **错误**: "P1001: Can't reach database server"
- **解决**: 检查 DATABASE_URL 是否正确，确认数据库服务正在运行

#### NextAuth 错误
- **错误**: "NEXTAUTH_SECRET is required"
- **解决**: 确保 NEXTAUTH_SECRET 已正确设置且长度足够

#### GitHub OAuth 错误
- **错误**: "Access Denied"
- **解决**: 检查 GitHub OAuth App 的回调 URL 是否正确

## 故障排除

如果问题仍然存在:

1. 检查 Vercel 函数日志
2. 确认所有环境变量已正确设置
3. 验证数据库连接字符串
4. 检查 GitHub OAuth 配置

## 联系支持

如果按照上述步骤仍然无法解决问题，请提供:
- Vercel 部署日志
- 具体的错误信息
- 环境变量配置截图（隐藏敏感信息）