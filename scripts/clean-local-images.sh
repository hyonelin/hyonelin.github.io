#!/bin/bash

# ============================================
# 清理本地图片文件
# ============================================
#
# 警告：此脚本会删除本地图片文件！
# 请确保已成功迁移到 R2 并验证后再执行。
#
# 用法:
#   chmod +x scripts/clean-local-images.sh
#   ./scripts/clean-local-images.sh
#
# ============================================

set -e

echo "⚠️  警告：此操作将删除本地图片文件！"
echo ""
echo "即将删除:"
echo "  - public/shots/*.JPEG, *.jpg, *.png"
echo "  - public/shots/*.HEIC (原始文件)"
echo "  - public/logos/*.jpg, *.png, *.jpeg"
echo ""
read -p "确认已成功迁移到 R2？(yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "❌ 操作已取消"
  exit 0
fi

echo ""
echo "🗑️  开始清理..."

# 删除 shots 目录中的图片（保留 index.json 和 README.md）
if [ -d "public/shots" ]; then
  echo "  清理 public/shots/..."
  find public/shots -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.JPEG" -o -name "*.png" -o -name "*.HEIC" -o -name "*.heic" \) -exec rm -v {} \;
fi

# 删除 logos 目录中的图片
if [ -d "public/logos" ]; then
  echo "  清理 public/logos/..."
  find public/logos -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.JPEG" -o -name "*.png" -o -name "*.webp" \) -exec rm -v {} \;
fi

# 删除其他图片
echo "  清理其他图片..."
find public -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.JPEG" -o -name "*.png" -o -name "*.webp" -o -name "*.HEIC" \) \
  ! -path "public/blogs/*" \
  ! -path "public/projects/*" \
  -exec rm -v {} \;

echo ""
echo "✅ 清理完成！"
echo ""
echo "📝 提示:"
echo "  - public/shots/index.json 已保留（旧数据）"
echo "  - public/photos/index.json 包含新数据"
echo "  - 现在可以提交代码了"
