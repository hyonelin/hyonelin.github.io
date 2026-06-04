/**
 * Cloudflare R2 图片存储配置
 */

export const R2_BASE_URL = 'https://pub-e00c2328da0440458b54fe471887ca39.r2.dev'

/**
 * 获取图片完整 URL
 * @param path 图片相对路径
 * @returns 完整图片 URL
 */
export function getImageUrl(path: string): string {
  // 移除开头的斜杠（如果有）
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${R2_BASE_URL}/${cleanPath}`
}

/**
 * 分页配置
 */
export const PHOTO_CONFIG = {
  // 每页图片数量
  PAGE_SIZE: 30,
  // 预加载页数
  PRELOAD_PAGES: 1,
  // 懒加载阈值（像素）
  LAZY_LOAD_THRESHOLD: 200,
} as const

/**
 * 图片元数据接口
 */
export interface PhotoMetadata {
  // 图片路径（相对路径，如 "shots/2024/photo.jpg"）
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
  // 图片尺寸（可选，用于布局优化）
  width?: number
  height?: number
}

/**
 * 图片索引数据接口（支持大数据量）
 */
export interface PhotoIndex {
  // 图片列表
  photos: PhotoMetadata[]
  // 元数据
  meta: {
    totalCount: number
    lastUpdated: string
    version: string
  }
  // 索引文件（用于分片加载，可选）
  indexes?: {
    year: Record<string, string[]> // 年份 -> 图片路径列表
    camera: Record<string, string[]> // 相机 -> 图片路径列表
    tags: Record<string, string[]> // 标签 -> 图片路径列表
  }
}
