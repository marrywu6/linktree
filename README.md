# 📖 书签导航树 - Bookmark Navigation Tree

<div align="center">

[English](./README.md) | [简体中文](./README-zh.md)

  <h3>🌳 书签导航树 - 将浏览器书签转换为精美导航网站</h3>
  <p>几分钟内将浏览器书签创建为优雅的导航网站</p>
  
  ![书签导航树截图](./public/assets/spaces-preview.png)
</div>

## ✨ 功能特性

### 🆓 完全免费开源
- 📑 **无限导入导出** - 从任何浏览器导入书签
- 📁 **智能分类管理** - 层次化文件夹结构
- 🎨 **界面美观** - 现代化主题和布局
- 🔍 **强大搜索** - 瞬间找到所需书签
- 📱 **响应式设计** - 完美适配所有设备
- 📚 **多分类支持** - 组织不同的书签集合
- 🔒 **权限控制** - 支持公开和私密分类
- 🚀 **GitHub集成** - 支持GitHub OAuth登录
- ⚙️ **管理后台** - 完整的书签管理系统

### 💎 高级功能
- 📊 **访问统计** - 跟踪使用情况和热门链接
- 🔄 **实时同步** - 自动备份和恢复
- 🤖 **智能检测** - 链接有效性检查
- 🎯 **批量操作** - 高效管理大量书签
- 🔧 **API接口** - 支持第三方集成

## 🚀 快速开始

### 一键部署
[![部署到Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/marrywu6/linktree)

### 本地运行
```bash
# 克隆仓库
git clone https://github.com/marrywu6/linktree.git
cd linktree

# 安装依赖
npm install

# 设置环境变量
cp .env.example .env

# 初始化数据库
npm run build

# 启动开发服务器
npm run dev
```

访问 `http://localhost:3000` 查看您的书签导航树！

### 首次使用设置
1. 访问 `http://localhost:3000/setup` 创建管理员账户
2. 或使用GitHub OAuth登录（首个用户自动成为管理员）
3. 访问 `/dashboard` 管理后台开始使用

## ☁️ 部署指南

### Vercel 部署（推荐）
1. Fork 本仓库到你的GitHub
2. 在 [Vercel](https://vercel.com) 连接仓库
3. 配置环境变量：
   ```env
   DATABASE_URL="your-database-url"
   NEXTAUTH_URL="https://your-app.vercel.app"
   NEXTAUTH_SECRET="your-secret-key"
   GITHUB_CLIENT_ID="your-github-id" # 可选
   GITHUB_CLIENT_SECRET="your-github-secret" # 可选
   ```
4. 点击部署

### 本地生产环境
```bash
# 生产构建
npm run build

# 启动生产服务器
npm start
```

## 🛠️ 技术栈

- **前端框架**: Next.js 14 + React 18 + TypeScript
- **界面样式**: Tailwind CSS + shadcn/ui
- **数据库**: Prisma ORM + SQLite/PostgreSQL
- **用户认证**: NextAuth.js
- **部署平台**: Vercel、Railway、Docker
- **图标库**: Lucide React

## 📦 浏览器支持

书签导航树支持从以下浏览器导入书签：

- 🟦 **Chrome** - 书签管理器 → 导出书签
- 🟧 **Firefox** - 书签 → 管理书签 → 导入和备份 → 导出书签为HTML
- 🟩 **Safari** - 文件 → 导出书签
- 🟪 **Edge** - 收藏夹 → 管理收藏夹 → 导出收藏夹

## 🎯 主要页面

- **首页** (`/`) - 书签导航展示页面
- **管理后台** (`/dashboard`) - 书签管理中心
- **用户登录** (`/login`) - 支持邮箱和GitHub登录
- **系统初始化** (`/setup`) - 首次使用设置

## 📱 功能亮点

### 书签管理
- ✅ 批量导入浏览器书签（HTML/JSON格式）
- ✅ 可视化分类管理界面
- ✅ 拖拽排序和层级组织
- ✅ 链接有效性自动检测
- ✅ 搜索和过滤功能

### 用户体验
- ✅ 全中文界面，操作直观
- ✅ 响应式设计，移动端友好
- ✅ 现代化UI设计
- ✅ 快速搜索和导航

### 安全特性
- ✅ JWT用户认证
- ✅ 路由访问控制
- ✅ 数据加密存储
- ✅ GitHub OAuth集成

## 👥 社区与支持

- GitHub: [https://github.com/marrywu6/linktree](https://github.com/marrywu6/linktree)
- 问题反馈: [GitHub Issues](https://github.com/marrywu6/linktree/issues)
- 功能建议: 欢迎提交Pull Request

## ❤️ 贡献指南

我们欢迎各种形式的贡献：

1. 🐛 **Bug报告** - 通过Issues报告问题
2. 💡 **功能建议** - 提出新功能想法
3. 📝 **文档改进** - 完善项目文档
4. 💻 **代码贡献** - 提交Pull Request

## 📄 开源协议

本项目采用 MIT 开源协议 - 详情请查看 [LICENSE](LICENSE) 文件。

---

**如果这个项目对您有帮助，请给个⭐️支持一下！**