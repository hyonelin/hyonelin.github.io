# 摄影作品目录

## 使用说明

将你的摄影照片放在这个文件夹中，并更新 `index.json` 文件来添加照片的元数据。

## 元数据格式

`index.json` 文件应该包含一个照片对象数组，每个对象的格式如下：

```json
{
  "filename": "photo.jpg",
  "title": "照片标题（可选）",
  "date": "2024-03-15",
  "location": "拍摄地点（可选）",
  "camera": "相机型号（可选）",
  "lens": "镜头型号（可选）",
  "settings": {
    "iso": "100",
    "aperture": "2.8",
    "shutter": "1/250",
    "focalLength": "35"
  }
}
```

## 字段说明

- `filename`: 照片文件名（必填）
- `title`: 照片标题（可选）
- `date`: 拍摄日期，格式为 YYYY-MM-DD（必填）
- `location`: 拍摄地点（可选，用于地点筛选）
- `camera`: 相机型号（可选）
- `lens`: 镜头型号（可选）
- `settings`: 拍摄参数（可选）
  - `iso`: ISO 值
  - `aperture`: 光圈值
  - `shutter`: 快门速度
  - `focalLength`: 焦距（mm）

## 功能特性

- 瀑布流布局自动适配不同尺寸的照片
- 按年份或月份分组显示
- 按拍摄地点筛选
- 鼠标悬停显示照片详细信息和拍摄参数
- 响应式设计，支持移动端浏览
