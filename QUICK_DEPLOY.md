# ⚡ LinkTree 快速部署

## 🚀 一键部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/linktree&env=DATABASE_URL,NEXTAUTH_URL,NEXTAUTH_SECRET)

## 📋 3分钟部署步骤

### 1️⃣ 准备环境变量
```bash
DATABASE_URL="postgresql://user:pass@host:5432/db"  # 数据库连接
NEXTAUTH_URL="https://your-app.vercel.app"         # 部署后的域名
NEXTAUTH_SECRET="your-super-secret-key"            # 随机密钥
```

### 2️⃣ 创建数据库
推荐免费数据库服务：
- 🟢 [Supabase](https://supabase.com) - 免费 PostgreSQL
- 🟡 [PlanetScale](https://planetscale.com) - 免费 MySQL
- 🔵 [Railway](https://railway.app) - PostgreSQL

### 3️⃣ 部署到 Vercel
1. 点击上方部署按钮
2. 连接 GitHub 账号
3. 填入环境变量
4. 点击部署

## 🔧 本地开发

```bash
# 1. 克隆项目
git clone https://github.com/your-repo/linktree.git
cd linktree

# 2. 安装依赖
npm install

# 3. 创建环境变量文件
cp .env.example .env.local

# 4. 初始化数据库
npx prisma db push

# 5. 启动开发服务器
npm run dev
```

访问 http://localhost:3000 查看应用

## 🌟 其他部署选项

| 平台 | 难度 | 免费额度 | 推荐指数 |
|------|------|----------|----------|
| Vercel | ⭐ | 充足 | ⭐⭐⭐⭐⭐ |
| Railway | ⭐⭐ | 有限 | ⭐⭐⭐⭐ |
| Netlify | ⭐⭐ | 充足 | ⭐⭐⭐ |
| Docker | ⭐⭐⭐ | 无限 | ⭐⭐⭐⭐ |

## 🆘 需要帮助？

- 📖 [完整部署指南](./DEPLOYMENT_GUIDE_CN.md)
- 💬 [加入社区讨论](https://discord.gg/linktree)
- 🐛 [报告问题](https://github.com/linktree-io/linktree/issues)

## ✅ 部署检查清单

- [ ] 环境变量配置完成
- [ ] 数据库连接正常
- [ ] 应用可以正常访问
- [ ] 书签导入功能测试
- [ ] 用户注册登录测试

---

🎉 **部署完成！** 开始管理您的书签吧！