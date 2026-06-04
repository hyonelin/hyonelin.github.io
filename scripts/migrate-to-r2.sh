#!/bin/bash

# ============================================
# Cloudflare R2 图片迁移脚本
# ============================================
#
# 使用前请确保：
# 1. 已安装 wrangler CLI: npm install -g wrangler
# 2. 已登录 Cloudflare: wrangler login
# 3. 已创建 R2 bucket: wrangler r2 bucket create your-bucket-name
#
# 用法:
#   chmod +x scripts/migrate-to-r2.sh
#   ./scripts/migrate-to-r2.sh
#
# ============================================

set -e

# 配置
R2_BUCKET_NAME="photos"  # 修改为你的 bucket 名称
R2_BASE_URL="https://pub-e00c2328da0440458b54fe471887ca39.r2.dev"
PUBLIC_SHOTS_DIR="public/shots"
PUBLIC_PHOTOS_DIR="public/photos"
PUBLIC_LOGOS_DIR="public/logos"

echo "🚀 开始迁移图片到 Cloudflare R2..."

# ============================================
# 1. 上传 shots 目录图片
# ============================================
echo ""
echo "📁 处理 shots 目录..."

if [ -d "$PUBLIC_SHOTS_DIR" ]; then
  # 查找所有图片文件（排除 HEIC 和 index.json）
  find "$PUBLIC_SHOTS_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.JPEG" -o -name "*.png" -o -name "*.webp" \) | while read -r file; do
    # 获取相对路径（去掉 public/ 前缀）
    relative_path="${file#public/}"
    
    echo "  ⬆️  上传: $relative_path"
    
    # 上传到 R2
    wrangler r2 object put "$R2_BUCKET_NAME/$relative_path" --file="$file" > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
      echo "  ✅ 成功: $relative_path"
    else
      echo "  ❌ 失败: $relative_path"
    fi
  done
else
  echo "  ⚠️  目录不存在: $PUBLIC_SHOTS_DIR"
fi

# ============================================
# 2. 上传 logos 目录图片
# ============================================
echo ""
echo "📁 处理 logos 目录..."

if [ -d "$PUBLIC_LOGOS_DIR" ]; then
  find "$PUBLIC_LOGOS_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" \) | while read -r file; do
    relative_path="${file#public/}"
    
    echo "  ⬆️  上传: $relative_path"
    
    wrangler r2 object put "$R2_BUCKET_NAME/$relative_path" --file="$file" > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
      echo "  ✅ 成功: $relative_path"
    else
      echo "  ❌ 失败: $relative_path"
    fi
  done
else
  echo "  ⚠️  目录不存在: $PUBLIC_LOGOS_DIR"
fi

# ============================================
# 3. 上传其他图片文件
# ============================================
echo ""
echo "📁 处理其他图片文件..."

# 查找 public 目录下的其他图片（排除 shots, logos, blogs 目录）
find "public" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" -o -name "*.svg" \) \
  ! -path "public/shots/*" \
  ! -path "public/logos/*" \
  ! -path "public/blogs/*" \
  ! -path "public/projects/*" | while read -r file; do
  
  relative_path="${file#public/}"
  
  echo "  ⬆️  上传: $relative_path"
  
  wrangler r2 object put "$R2_BUCKET_NAME/$relative_path" --file="$file" > /dev/null 2>&1
  
  if [ $? -eq 0 ]; then
    echo "  ✅ 成功: $relative_path"
  else
    echo "  ❌ 失败: $relative_path"
  fi
done

echo ""
echo "✅ 图片迁移完成！"
echo ""
echo "📝 后续步骤:"
echo "  1. 验证图片可访问: $R2_BASE_URL/shots/IMG_0480.JPEG"
echo "  2. 更新 index.json 数据结构（运行 npm run migrate:index）"
echo "  3. 删除 public 目录下的图片文件"
echo "  4. 提交代码变更"
echo ""
