# 个人 Portfolio 网站

基于 React + TypeScript + Vite 构建的个人作品集网站，支持 GitHub Pages 部署。

## 快速开始

```bash
npm install
npm run dev
```

## 部署到 GitHub Pages

```bash
npm run deploy
```

## 如何添加新作品

1. 在 `public/projects/` 下创建新文件夹，例如 `project-2`
2. 在文件夹中添加：
   - `info.json` - 项目信息
   - `preview.png` - 预览图片
   - `README.md` - 项目详情（Markdown）

3. 更新 `public/projects/projects.json`，添加新项目 ID

### info.json 示例

```json
{
  "id": "project-2",
  "title": "项目名称",
  "description": "项目简介",
  "image": "preview.png",
  "markdown": "README.md",
  "tags": ["React", "Node.js"]
}
```

## 自定义个人信息

编辑 `src/data/profile.ts` 修改：
- 个人简介
- 技术栈
- 联系方式
- 个人页面链接

## 项目结构

```
├── public/
│   ├── avatar.png          # 头像
│   └── projects/           # 作品文件夹
│       ├── projects.json   # 项目列表
│       └── project-1/      # 单个项目
│           ├── info.json
│           ├── preview.png
│           └── README.md
├── src/
│   ├── components/         # 组件
│   ├── pages/              # 页面
│   ├── data/               # 配置数据
│   └── types/              # TypeScript 类型
```
