# resume

一个极简风格的个人作品集网站，使用 React + TypeScript + TailwindCSS + Framer Motion 构建。

## 特性

- 🎨 极简设计风格
- 🌙 深色/浅色主题切换
- ✨ 流畅的动画效果
- 📱 响应式设计
- ⚡ 快速加载

## 开始使用

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

## 自定义内容

编辑 `src/data/resume.tsx` 文件来更新你的个人信息：

- 基本信息（姓名、简介、头像等）
- 技能列表
- 工作经历
- 教育背景
- 项目展示
- 联系方式

## 部署

### GitHub Pages

1. 推送代码到 GitHub
2. 在仓库设置中启用 GitHub Pages
3. 选择 GitHub Actions 作为部署源
4. 代码推送后会自动部署

### 其他平台

构建后的文件在 `dist` 目录，可以部署到任何静态托管服务：

- Vercel
- Netlify
- Cloudflare Pages
- 自有服务器

## 技术栈

- React 18
- TypeScript
- TailwindCSS
- Framer Motion
- Vite
- Lucide Icons
