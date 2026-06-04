#!/usr/bin/env node

/**
 * 将 public/shots/index.json 转换为新格式
 * 
 * 变更:
 * - filename -> path (添加 shots/ 前缀)
 * - 输出到 public/photos/index.json
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'

interface OldPhotoMetadata {
  filename: string
  title?: string
  date: string
  location?: string
  camera?: string
  lens?: string
  tags?: string[]
  photographerNote?: string
  settings?: {
    iso?: string
    aperture?: string
    shutter?: string
    focalLength?: string
  }
}

interface NewPhotoMetadata {
  path: string
  title?: string
  date: string
  location?: string
  camera?: string
  lens?: string
  tags?: string[]
  photographerNote?: string
  settings?: {
    iso?: string
    aperture?: string
    shutter?: string
    focalLength?: string
  }
}

interface PhotoIndex {
  photos: NewPhotoMetadata[]
  meta: {
    totalCount: number
    lastUpdated: string
    version: string
  }
}

function migrate() {
  const oldIndexPath = join(process.cwd(), 'public', 'shots', 'index.json')
  const newIndexPath = join(process.cwd(), 'public', 'photos', 'index.json')

  console.log('🔄 开始迁移 index.json...')
  console.log(`  源文件: ${oldIndexPath}`)
  console.log(`  目标文件: ${newIndexPath}`)

  // 读取旧数据
  if (!existsSync(oldIndexPath)) {
    console.error('❌ 源文件不存在:', oldIndexPath)
    process.exit(1)
  }

  const oldData: OldPhotoMetadata[] = JSON.parse(readFileSync(oldIndexPath, 'utf-8'))

  // 转换数据
  const newPhotos: NewPhotoMetadata[] = oldData.map((photo) => ({
    ...photo,
    path: `shots/${photo.filename}`,
  }))

  // 创建新索引
  const newIndex: PhotoIndex = {
    photos: newPhotos,
    meta: {
      totalCount: newPhotos.length,
      lastUpdated: new Date().toISOString(),
      version: '2.0.0',
    },
  }

  // 确保目录存在
  const newDir = dirname(newIndexPath)
  if (!existsSync(newDir)) {
    mkdirSync(newDir, { recursive: true })
  }

  // 写入新文件
  writeFileSync(newIndexPath, JSON.stringify(newIndex, null, 2), 'utf-8')

  console.log(`✅ 迁移完成！共 ${newPhotos.length} 张照片`)
  console.log(`📄 新文件已创建: ${newIndexPath}`)
}

migrate()
