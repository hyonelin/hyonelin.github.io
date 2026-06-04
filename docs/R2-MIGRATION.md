# Cloudflare R2 图片存储迁移指南

## 概述

本指南帮助你将图片从 GitHub 仓库迁移到 Cloudflare R2 存储。

## 架构变更

### 之前
```
public/shots/
  ├── DSC_0058_Original.JPEG
  ├── IMG_0480.JPEG
  └── index.json (filename: "DSC_0058_Original.JPEG")
```

图片 URL: `/shots/DSC_0058_Original.JPEG`

### 之后
```
public/photos/
  └── index.json (path: "shots/DSC_0058_Original.JPEG")
```

图片 URL: `https://pub-e00c2328da0440458b54fe471887ca39.r2.dev/shots/DSC_0058_Original.JPEG`

## 前置条件

1. 安装 [wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/):
   ```bash
   npm install -g wrangler
   ```

2. 登录 Cloudflare:
   ```bash
   wrangler login
   ```

3. 创建 R2 bucket（如果还没有）:
   ```bash
   wrangler r2 bucket create photos
   ```

4. 配置 R2 公开访问（在 Cloudflare Dashboard）:
   - 进入 R2 > photos bucket > Settings
   - 启用 Public access
   - 记录 Public bucket URL（如: `https://pub-xxx.r2.dev`）

## 迁移步骤

### 步骤 1: 上传图片到 R2

```bash
# 使用迁移脚本
npm run migrate:r2

# 或手动上传
wrangler r2 object put photos/shots/IMG_0480.JPEG --file=public/shots/IMG_0480.JPEG
```

### 步骤 2: 转换 index.json 格式

```bash
npm run migrate:index
```

这会将 `public/shots/index.json` 转换为新格式并保存到 `public/photos/index.json`。

### 步骤 3: 验证图片可访问

在浏览器中打开:
```
https://pub-e00c2328da0440458b54fe471887ca39.r2.dev/shots/IMG_0480.JPEG
```

### 步骤 4: 清理本地图片（可选）

确认迁移成功后，删除本地图片文件:

```bash
npm run clean:images
```

⚠️ **警告**: 此操作不可逆，请确保已验证 R2 图片可正常访问。

## 新功能

### 1. 懒加载
图片只在进入视口时加载，提升页面性能。

### 2. 无限滚动
自动加载更多图片，无需手动翻页。

### 3. 筛选功能
- 按年份筛选
- 按相机筛选
- 按标签筛选

### 4. 支持大数据量
- 每页 30 张图片
- 支持超过 10000 张照片
- 可扩展分片索引

## 添加新照片

### 方法 1: 使用 wrangler CLI

```bash
# 上传图片
wrangler r2 object put photos/shots/2024/new-photo.jpg --file=./new-photo.jpg

# 更新 index.json
# 在 public/photos/index.json 中添加:
{
  "path": "shots/2024/new-photo.jpg",
  "title": "照片标题",
  "date": "2024-06-01",
  "camera": "iPhone 15 Pro",
  "tags": ["风景", "旅行"]
}
```

### 方法 2: 使用 Cloudflare Dashboard

1. 登录 Cloudflare Dashboard
2. 进入 R2 > photos bucket
3. 点击 Upload 上传图片
4. 更新 `public/photos/index.json`

## 目录结构建议

为了更好地组织大量图片，建议使用以下目录结构:

```
R2 Bucket (photos)
├── shots/              # 摄影作品
│   ├── 2024/           # 按年份
│   │   ├── 01/         # 按月份
│   │   └── 02/
│   └── 2023/
├── logos/              # Logo 图片
└── avatars/            # 头像图片
```

对应的 `index.json`:
```json
{
  "photos": [
    {
      "path": "shots/2024/01/photo.jpg",
      "date": "2024-01-15",
      ...
    }
  ]
}
```

## 分片索引（可选）

当照片数量超过 10000 张时，可以创建分片索引:

```json
// public/photos/index.json - 主索引
{
  "meta": {
    "totalCount": 15000,
    "version": "2.0.0"
  },
  "shards": ["2024.json", "2023.json", "2022.json"]
}

// public/photos/2024.json - 年份分片
{
  "photos": [...]
}
```

修改代码加载逻辑以支持分片。

## 回滚方案

如果迁移出现问题，可以快速回滚:

1. 恢复 `Photography.tsx` 到之前的版本
2. 恢复 `index.json` 数据格式
3. 图片仍然在本地 `public/shots/` 目录

## 成本估算

Cloudflare R2 定价（截至 2024）:
- 存储: $0.015/GB/月
- Class A 操作（写入）: $4.50/百万次
- Class B 操作（读取）: $0.36/百万次

假设:
- 10000 张照片，平均每张 2MB = 20GB
- 每月 10 万次访问

月成本约: $0.30（存储）+ $0.04（读取）= **$0.34/月**

## 常见问题

### Q: 图片加载慢怎么办？
A: 考虑配置 Cloudflare CDN 缓存和加速。

### Q: 如何批量上传？
A: 使用 wrangler 批量上传脚本，或使用 S3 兼容工具（如 rclone）。

### Q: 支持图片处理吗？
A: 可以使用 Cloudflare Images 服务，或 Workers 进行图片处理。

## 相关文件

- `src/lib/photos.ts` - R2 配置和类型定义
- `src/pages/Photography.tsx` - 摄影页面
- `src/components/PhotoModal.tsx` - 照片弹窗
- `public/photos/index.json` - 照片索引数据
- `scripts/migrate-to-r2.sh` - R2 上传脚本
- `scripts/migrate-index.ts` - 索引转换脚本
- `scripts/clean-local-images.sh` - 本地清理脚本
