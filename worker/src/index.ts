/**
 * Photo Admin Worker
 * 
 * 功能:
 * 1. 密码验证
 * 2. 图片上传到 R2
 * 3. JSON 更新（index.json 和 albums.json）
 */

export interface Env {
  PHOTOS_BUCKET: R2Bucket
  ADMIN_PASSWORD: string
  R2_BASE_URL: string
}

// CORS 头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// JSON 响应辅助函数
function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  })
}

// 错误响应
function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status)
}

// 验证密码
function verifyPassword(authHeader: string | null, env: Env): boolean {
  if (!authHeader) return false
  // 格式: Bearer <password>
  const token = authHeader.replace('Bearer ', '')
  return token === env.ADMIN_PASSWORD
}

// 照片元数据接口
interface PhotoMetadata {
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

// 相册接口
interface PhotoAlbum {
  id: string
  title: string
  description?: string
  coverImage?: string
  date: string
  location?: string
  tags?: string[]
  photos: PhotoMetadata[]
  published?: boolean
}

// 索引接口
interface PhotoIndex {
  photos: PhotoMetadata[]
  meta: {
    totalCount: number
    lastUpdated: string
    version: string
  }
}

interface AlbumIndex {
  albums: PhotoAlbum[]
  meta: {
    totalCount: number
    lastUpdated: string
    version: string
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // 处理 OPTIONS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    const url = new URL(request.url)
    const path = url.pathname

    try {
      // 路由处理
      if (path === '/api/verify' && request.method === 'POST') {
        return handleVerify(request, env)
      }
      
      if (path === '/api/upload' && request.method === 'POST') {
        return handleUpload(request, env)
      }
      
      if (path === '/api/photos' && request.method === 'GET') {
        return handleGetPhotos(env)
      }
      
      if (path === '/api/albums' && request.method === 'GET') {
        return handleGetAlbums(env)
      }
      
      if (path === '/api/albums' && request.method === 'POST') {
        return handleCreateAlbum(request, env)
      }
      
      if (path === '/api/albums/add-photo' && request.method === 'POST') {
        return handleAddPhotoToAlbum(request, env)
      }

      return errorResponse('Not Found', 404)
    } catch (error) {
      console.error('Worker error:', error)
      return errorResponse('Internal Server Error', 500)
    }
  },
}

/**
 * 验证密码
 */
async function handleVerify(request: Request, env: Env): Promise<Response> {
  const authHeader = request.headers.get('Authorization')
  
  if (!verifyPassword(authHeader, env)) {
    return errorResponse('Invalid password', 401)
  }
  
  return jsonResponse({ success: true, message: 'Verified' })
}

/**
 * 上传图片
 */
async function handleUpload(request: Request, env: Env): Promise<Response> {
  // 验证密码
  const authHeader = request.headers.get('Authorization')
  if (!verifyPassword(authHeader, env)) {
    return errorResponse('Invalid password', 401)
  }

  const formData = await request.formData()
  const file = formData.get('file') as File
  const metadataStr = formData.get('metadata') as string
  const mode = formData.get('mode') as string // 'year' | 'album'
  const albumId = formData.get('albumId') as string | null

  if (!file) {
    return errorResponse('No file provided')
  }

  if (!metadataStr) {
    return errorResponse('No metadata provided')
  }

  let metadata: PhotoMetadata
  try {
    metadata = JSON.parse(metadataStr)
  } catch {
    return errorResponse('Invalid metadata JSON')
  }

  // 生成文件路径
  const date = new Date(metadata.date)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const ext = file.name.split('.').pop() || 'jpg'
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  const fileName = `${timestamp}-${randomStr}.${ext}`
  
  // 根据模式决定路径
  let r2Path: string
  if (mode === 'album' && albumId) {
    r2Path = `albums/${albumId}/${fileName}`
  } else {
    r2Path = `shots/${year}/${month}/${fileName}`
  }

  // 上传到 R2
  await env.PHOTOS_BUCKET.put(r2Path, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
  })

  // 更新 metadata 的 path
  metadata.path = r2Path

  // 更新对应的 JSON 文件
  if (mode === 'album' && albumId) {
    await addPhotoToAlbum(env, albumId, metadata)
  } else {
    await addPhotoToIndex(env, metadata)
  }

  return jsonResponse({
    success: true,
    path: r2Path,
    url: `${env.R2_BASE_URL}/${r2Path}`,
    metadata,
  })
}

/**
 * 获取所有照片
 */
async function handleGetPhotos(env: Env): Promise<Response> {
  const object = await env.PHOTOS_BUCKET.get('photos/index.json')
  
  if (!object) {
    // 返回空的索引
    const emptyIndex: PhotoIndex = {
      photos: [],
      meta: {
        totalCount: 0,
        lastUpdated: new Date().toISOString(),
        version: '2.0.0',
      },
    }
    return jsonResponse(emptyIndex)
  }

  const data = await object.json()
  return jsonResponse(data)
}

/**
 * 获取所有相册
 */
async function handleGetAlbums(env: Env): Promise<Response> {
  const object = await env.PHOTOS_BUCKET.get('photos/albums.json')
  
  if (!object) {
    const emptyAlbums: AlbumIndex = {
      albums: [],
      meta: {
        totalCount: 0,
        lastUpdated: new Date().toISOString(),
        version: '1.0.0',
      },
    }
    return jsonResponse(emptyAlbums)
  }

  const data = await object.json()
  return jsonResponse(data)
}

/**
 * 创建新相册
 */
async function handleCreateAlbum(request: Request, env: Env): Promise<Response> {
  const authHeader = request.headers.get('Authorization')
  if (!verifyPassword(authHeader, env)) {
    return errorResponse('Invalid password', 401)
  }

  const body = await request.json()
  const { title, description, date, location, tags, published } = body as Partial<PhotoAlbum>

  if (!title || !date) {
    return errorResponse('Title and date are required')
  }

  // 生成相册 ID
  const dateStr = new Date(date).toISOString().split('T')[0]
  const slug = title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
  const id = `${dateStr}-${slug}`

  // 获取现有相册
  let albums: AlbumIndex
  const existing = await env.PHOTOS_BUCKET.get('photos/albums.json')
  
  if (existing) {
    albums = await existing.json()
  } else {
    albums = {
      albums: [],
      meta: {
        totalCount: 0,
        lastUpdated: new Date().toISOString(),
        version: '1.0.0',
      },
    }
  }

  // 检查 ID 是否已存在
  if (albums.albums.some(a => a.id === id)) {
    return errorResponse('Album with this ID already exists')
  }

  // 创建新相册
  const newAlbum: PhotoAlbum = {
    id,
    title,
    description,
    date,
    location,
    tags: tags || [],
    photos: [],
    published: published ?? true,
  }

  albums.albums.unshift(newAlbum)
  albums.meta.totalCount = albums.albums.length
  albums.meta.lastUpdated = new Date().toISOString()

  // 保存到 R2
  await env.PHOTOS_BUCKET.put('photos/albums.json', JSON.stringify(albums, null, 2), {
    httpMetadata: { contentType: 'application/json' },
  })

  return jsonResponse({ success: true, album: newAlbum })
}

/**
 * 添加照片到索引
 */
async function addPhotoToIndex(env: Env, photo: PhotoMetadata): Promise<void> {
  let index: PhotoIndex
  const existing = await env.PHOTOS_BUCKET.get('photos/index.json')
  
  if (existing) {
    index = await existing.json()
  } else {
    index = {
      photos: [],
      meta: {
        totalCount: 0,
        lastUpdated: new Date().toISOString(),
        version: '2.0.0',
      },
    }
  }

  // 添加照片到开头
  index.photos.unshift(photo)
  index.meta.totalCount = index.photos.length
  index.meta.lastUpdated = new Date().toISOString()

  // 保存
  await env.PHOTOS_BUCKET.put('photos/index.json', JSON.stringify(index, null, 2), {
    httpMetadata: { contentType: 'application/json' },
  })
}

/**
 * 添加照片到相册
 */
async function addPhotoToAlbum(env: Env, albumId: string, photo: PhotoMetadata): Promise<void> {
  const existing = await env.PHOTOS_BUCKET.get('photos/albums.json')
  
  if (!existing) {
    throw new Error('No albums found')
  }

  const albums: AlbumIndex = await existing.json()
  const album = albums.albums.find(a => a.id === albumId)

  if (!album) {
    throw new Error('Album not found')
  }

  // 添加照片到相册
  album.photos.push(photo)

  // 如果是第一张照片，设置为封面
  if (!album.coverImage && photo.path) {
    album.coverImage = photo.path
  }

  albums.meta.lastUpdated = new Date().toISOString()

  // 保存
  await env.PHOTOS_BUCKET.put('photos/albums.json', JSON.stringify(albums, null, 2), {
    httpMetadata: { contentType: 'application/json' },
  })
}

/**
 * 处理添加照片到相册的 API
 */
async function handleAddPhotoToAlbum(request: Request, env: Env): Promise<Response> {
  const authHeader = request.headers.get('Authorization')
  if (!verifyPassword(authHeader, env)) {
    return errorResponse('Invalid password', 401)
  }

  const body = await request.json() as { albumId: string; photo: PhotoMetadata }
  const { albumId, photo } = body

  if (!albumId || !photo) {
    return errorResponse('albumId and photo are required')
  }

  try {
    await addPhotoToAlbum(env, albumId, photo)
    return jsonResponse({ success: true })
  } catch (error) {
    return errorResponse((error as Error).message, 404)
  }
}
