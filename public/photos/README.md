# 照片索引目录

## 数据结构

`index.json` 包含所有照片的元数据，支持大规模照片管理。

### 格式说明

```json
{
  "photos": [
    {
      "path": "shots/2024/photo.jpg",
      "title": "照片标题",
      "date": "2024-01-01",
      "location": "拍摄地点",
      "camera": "相机型号",
      "lens": "镜头型号",
      "tags": ["标签1", "标签2"],
      "photographerNote": "摄影师备注",
      "settings": {
        "iso": "100",
        "aperture": "2.8",
        "shutter": "1/250",
        "focalLength": "35"
      }
    }
  ],
  "meta": {
    "totalCount": 100,
    "lastUpdated": "2024-01-01T00:00:00.000Z",
    "version": "2.0.0"
  }
}
```

## 字段变更

| 旧字段 | 新字段 | 说明 |
|--------|--------|------|
| `filename` | `path` | 相对路径，含目录前缀 |

## 图片 URL 生成

```typescript
const R2_BASE_URL = 'https://pub-e00c2328da0440458b54fe471887ca39.r2.dev'
const imageUrl = `${R2_BASE_URL}/${path}`
```

## 添加新照片

1. 上传图片到 R2（使用 wrangler 或 Cloudflare Dashboard）
2. 更新 `index.json`，添加照片元数据
3. 提交代码

## 分片索引（可选）

当照片数量超过 10000 张时，可以创建分片索引：

```
public/photos/
  index.json          # 主索引（可选，仅元数据）
  2024.json           # 2024 年照片
  2023.json           # 2023 年照片
  camera-nikon.json   # Nikon 相机照片
```
