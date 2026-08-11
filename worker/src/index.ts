/**
 * Photo Admin Worker
 * 
 * 功能:
 * 1. 密码验证
 * 2. 登录限流（失败延迟 + IP 锁定 + Turnstile）
 * 3. 图片上传到 R2
 * 4. JSON 更新（index.json 和 albums.json）
 */

export interface Env {
  PHOTOS_BUCKET: R2Bucket
  RATE_LIMIT: KVNamespace
  ADMIN_PASSWORD: string
  R2_BASE_URL: string
  TURNSTILE_SECRET: string
  TURNSTILE_SITE_KEY: string
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

// 获取客户端 IP
function getClientIP(request: Request): string {
  const cf = request.cf as any
  return cf?.ip || request.headers.get('x-forwarded-for') || 'unknown'
}

// 限流配置
const RATE_LIMIT_CONFIG = {
  MAX_ATTEMPTS: 3,           // 最大尝试次数（之后需要 Turnstile）
  LOCKOUT_ATTEMPTS: 5,       // 锁定前的最大尝试次数
  LOCKOUT_DURATION: 900,     // 锁定时长（秒）15分钟
  BASE_DELAY: 1000,          // 基础延迟（毫秒）
  MAX_DELAY: 30000,          // 最大延迟（毫秒）30秒
}

// 获取限流状态
async function getRateLimitState(env: Env, ip: string): Promise<{
  attempts: number
  lockedUntil: number
  requireTurnstile: boolean
}> {
  const key = `rate_limit:${ip}`
  const data = await env.RATE_LIMIT.get(key, 'json') as any
  
  if (!data) {
    return { attempts: 0, lockedUntil: 0, requireTurnstile: false }
  }
  
  const attempts = data.attempts || 0
  const lockedUntil = data.lockedUntil || 0
  const now = Date.now()
  
  // 如果锁定已过期，重置状态
  if (lockedUntil > 0 && lockedUntil < now) {
    return { attempts: 0, lockedUntil: 0, requireTurnstile: false }
  }
  
  return {
    attempts,
    lockedUntil,
    // 3 次后需要 Turnstile
    requireTurnstile: attempts >= RATE_LIMIT_CONFIG.MAX_ATTEMPTS && attempts < RATE_LIMIT_CONFIG.LOCKOUT_ATTEMPTS,
  }
}

// 更新限流状态
async function updateRateLimitState(env: Env, ip: string, success: boolean): Promise<void> {
  const key = `rate_limit:${ip}`
  const current = await getRateLimitState(env, ip)
  
  if (success) {
    // 成功后清除记录
    await env.RATE_LIMIT.delete(key)
    return
  }
  
  // 失败后增加计数
  const newAttempts = current.attempts + 1
  
  // 5 次后才锁定
  const lockedUntil = newAttempts >= RATE_LIMIT_CONFIG.LOCKOUT_ATTEMPTS 
    ? Date.now() + RATE_LIMIT_CONFIG.LOCKOUT_DURATION * 1000 
    : 0
  
  await env.RATE_LIMIT.put(key, JSON.stringify({
    attempts: newAttempts,
    lockedUntil,
    lastAttempt: Date.now(),
  }), {
    expirationTtl: RATE_LIMIT_CONFIG.LOCKOUT_DURATION,
  })
}

// 计算延迟时间
function getDelay(attempts: number): number {
  const delay = RATE_LIMIT_CONFIG.BASE_DELAY * Math.pow(2, attempts - 1)
  return Math.min(delay, RATE_LIMIT_CONFIG.MAX_DELAY)
}

// 验证 Turnstile
async function verifyTurnstile(token: string, ip: string, env: Env): Promise<boolean> {
  const formData = new FormData()
  formData.append('secret', env.TURNSTILE_SECRET)
  formData.append('response', token)
  formData.append('remoteip', ip)
  
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData,
  })
  
  const result = await response.json() as any
  return result.success === true
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
      if (path === '/api/rate-limit' && request.method === 'GET') {
        return handleGetRateLimit(request, env)
      }
      
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

      // Blog APIs
      if (path === '/api/blogs' && request.method === 'GET') {
        return handleListBlogs(request, env)
      }

      if (path === '/api/blogs/post' && request.method === 'GET') {
        return handleGetBlogPost(request, env)
      }

      if (path === '/api/blogs/post' && request.method === 'PUT') {
        return handlePutBlogPost(request, env)
      }

      if (path === '/api/blogs/post' && request.method === 'DELETE') {
        return handleDeleteBlogPost(request, env)
      }

      if (path === '/api/blogs/upload-image' && request.method === 'POST') {
        return handleBlogImageUpload(request, env)
      }

      // Car pages (public, no auth)
      if (path === '/api/car-pages' && request.method === 'POST') {
        return handleCreateCarPage(request, env)
      }

      if (path.startsWith('/api/car-pages/') && request.method === 'GET') {
        const slug = path.replace('/api/car-pages/', '')
        return handleGetCarPage(slug, env)
      }

      return errorResponse('Not Found', 404)
    } catch (error) {
      console.error('Worker error:', error)
      return errorResponse('Internal Server Error', 500)
    }
  },
}

/**
 * 获取限流状态
 */
async function handleGetRateLimit(request: Request, env: Env): Promise<Response> {
  const ip = getClientIP(request)
  const state = await getRateLimitState(env, ip)
  
  // 检查是否锁定
  const now = Date.now()
  const isLocked = state.lockedUntil > now
  
  return jsonResponse({
    attempts: state.attempts,
    requireTurnstile: state.requireTurnstile,
    isLocked,
    lockedUntil: isLocked ? state.lockedUntil : null,
    delay: isLocked ? 0 : getDelay(state.attempts),
  })
}

/**
 * 验证密码
 */
async function handleVerify(request: Request, env: Env): Promise<Response> {
  const ip = getClientIP(request)
  const state = await getRateLimitState(env, ip)
  
  // 检查是否锁定
  const now = Date.now()
  if (state.lockedUntil > now) {
    const remaining = Math.ceil((state.lockedUntil - now) / 1000)
    return errorResponse(`账户已锁定，请 ${remaining} 秒后重试`, 429)
  }
  
  // 解析请求体
  const body = await request.json() as { password?: string; turnstileToken?: string }
  const { password, turnstileToken } = body
  
  // 如果需要 Turnstile 验证
  if (state.requireTurnstile) {
    if (!turnstileToken) {
      return errorResponse('请完成人机验证', 400)
    }
    
    const turnstileValid = await verifyTurnstile(turnstileToken, ip, env)
    if (!turnstileValid) {
      return errorResponse('人机验证失败，请重试', 400)
    }
  }
  
  // 验证密码
  if (password !== env.ADMIN_PASSWORD) {
    await updateRateLimitState(env, ip, false)
    
    const newState = await getRateLimitState(env, ip)
    const delay = getDelay(newState.attempts)
    
    // 添加延迟
    await new Promise(resolve => setTimeout(resolve, delay))
    
    return jsonResponse({
      success: false,
      error: '密码错误',
      attempts: newState.attempts,
      requireTurnstile: newState.requireTurnstile,
      delay: getDelay(newState.attempts),
    }, 401)
  }
  
  // 成功，清除限流记录
  await updateRateLimitState(env, ip, true)
  
  return jsonResponse({ success: true, message: 'Verified' })
}

/**
 * 上传图片
 */
async function handleUpload(request: Request, env: Env): Promise<Response> {
  // 验证密码
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || authHeader.replace('Bearer ', '') !== env.ADMIN_PASSWORD) {
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
    await addPhotoToAlbumR2(env, albumId, metadata)
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
  if (!authHeader || authHeader.replace('Bearer ', '') !== env.ADMIN_PASSWORD) {
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
async function addPhotoToAlbumR2(env: Env, albumId: string, photo: PhotoMetadata): Promise<void> {
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
  if (!authHeader || authHeader.replace('Bearer ', '') !== env.ADMIN_PASSWORD) {
    return errorResponse('Invalid password', 401)
  }

  const body = await request.json() as { albumId: string; photo: PhotoMetadata }
  const { albumId, photo } = body

  if (!albumId || !photo) {
    return errorResponse('albumId and photo are required')
  }

  try {
    await addPhotoToAlbumR2(env, albumId, photo)
    return jsonResponse({ success: true })
  } catch (error) {
    return errorResponse((error as Error).message, 404)
  }
}

// ---------- Blog ----------

type BlogLang = 'cn' | 'en'

interface BlogIndexItem {
  slug: string
  title: string
  date: string
  description: string
  tags: string[]
  cover?: string
}

function requireAuth(request: Request, env: Env): Response | null {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || authHeader.replace('Bearer ', '') !== env.ADMIN_PASSWORD) {
    return errorResponse('Invalid password', 401)
  }
  return null
}

function normalizeLang(lang: string | null): BlogLang {
  return lang === 'en' ? 'en' : 'cn'
}

function blogIndexPath(lang: BlogLang): string {
  return `blogs/${lang}/index.json`
}

function blogPostPath(lang: BlogLang, slug: string): string {
  return `blogs/${lang}/${slug}.md`
}

function slugifyTitle(title: string, date: string): string {
  const datePrefix = (date || new Date().toISOString().slice(0, 10)).slice(0, 10)
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  return `${datePrefix}-${base || 'post'}`
}

function buildMarkdown(meta: BlogIndexItem, content: string): string {
  const tags = JSON.stringify(meta.tags || [])
  return `---
title: "${meta.title.replace(/"/g, '\\"')}"
date: "${meta.date}"
description: "${(meta.description || '').replace(/"/g, '\\"')}"
tags: ${tags}
cover: "${meta.cover || ''}"
---

${content.trim()}\n`
}

async function readBlogIndex(env: Env, lang: BlogLang): Promise<BlogIndexItem[]> {
  const object = await env.PHOTOS_BUCKET.get(blogIndexPath(lang))
  if (!object) return []
  const data = await object.json() as BlogIndexItem[] | { posts?: BlogIndexItem[] }
  if (Array.isArray(data)) return data
  return data.posts || []
}

async function writeBlogIndex(env: Env, lang: BlogLang, posts: BlogIndexItem[]): Promise<void> {
  const sorted = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  await env.PHOTOS_BUCKET.put(blogIndexPath(lang), JSON.stringify(sorted, null, 2), {
    httpMetadata: { contentType: 'application/json' },
  })
}

async function handleListBlogs(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const lang = normalizeLang(url.searchParams.get('lang'))
  const posts = await readBlogIndex(env, lang)
  return jsonResponse({ lang, posts })
}

async function handleGetBlogPost(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const lang = normalizeLang(url.searchParams.get('lang'))
  const slug = url.searchParams.get('slug')
  if (!slug) return errorResponse('slug is required')

  const object = await env.PHOTOS_BUCKET.get(blogPostPath(lang, slug))
  if (!object) return errorResponse('Post not found', 404)

  const markdown = await object.text()
  const posts = await readBlogIndex(env, lang)
  const meta = posts.find((p) => p.slug === slug) || null

  return jsonResponse({ lang, slug, meta, markdown })
}

async function handlePutBlogPost(request: Request, env: Env): Promise<Response> {
  const authError = requireAuth(request, env)
  if (authError) return authError

  const body = await request.json() as {
    lang?: string
    slug?: string
    title?: string
    date?: string
    description?: string
    tags?: string[]
    cover?: string
    content?: string
  }

  const lang = normalizeLang(body.lang || null)
  const title = (body.title || '').trim()
  const date = (body.date || '').trim()
  const content = body.content ?? ''

  if (!title || !date) {
    return errorResponse('title and date are required')
  }

  const slug = (body.slug || slugifyTitle(title, date)).trim()
  const meta: BlogIndexItem = {
    slug,
    title,
    date,
    description: body.description || '',
    tags: Array.isArray(body.tags) ? body.tags : [],
    cover: body.cover || '',
  }

  const markdown = buildMarkdown(meta, content)
  await env.PHOTOS_BUCKET.put(blogPostPath(lang, slug), markdown, {
    httpMetadata: { contentType: 'text/markdown; charset=utf-8' },
  })

  const posts = await readBlogIndex(env, lang)
  const existingIndex = posts.findIndex((p) => p.slug === slug)
  if (existingIndex >= 0) {
    posts[existingIndex] = meta
  } else {
    posts.unshift(meta)
  }
  await writeBlogIndex(env, lang, posts)

  return jsonResponse({
    success: true,
    lang,
    slug,
    url: `${env.R2_BASE_URL}/${blogPostPath(lang, slug)}`,
    meta,
  })
}

async function handleDeleteBlogPost(request: Request, env: Env): Promise<Response> {
  const authError = requireAuth(request, env)
  if (authError) return authError

  const url = new URL(request.url)
  const lang = normalizeLang(url.searchParams.get('lang'))
  const slug = url.searchParams.get('slug')
  if (!slug) return errorResponse('slug is required')

  await env.PHOTOS_BUCKET.delete(blogPostPath(lang, slug))
  const posts = (await readBlogIndex(env, lang)).filter((p) => p.slug !== slug)
  await writeBlogIndex(env, lang, posts)

  return jsonResponse({ success: true })
}

// ---------- Car Pages ----------

interface CarPageConfig {
  slug: string
  imageUrl: string          // full R2 public URL
  imagePath: string         // R2 key
  loadingSteps: string[]
  loadingDuration: number   // ms
  brand: string
  createdAt: string
}

async function handleCreateCarPage(request: Request, env: Env): Promise<Response> {
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return errorResponse('No file provided')

  const brand = (formData.get('brand') as string | null)?.trim() || 'AutoShare'
  const loadingDuration = Math.min(10000, Math.max(1000, Number(formData.get('loadingDuration')) || 3000))
  const stepsRaw = formData.get('loadingSteps') as string | null
  const loadingSteps: string[] = stepsRaw
    ? JSON.parse(stepsRaw)
    : ['正在连接车辆…', '核验权限…', '读取车辆信息…', '获取车门授权…']

  const ext = (file.name.split('.').pop() || 'webp').toLowerCase()
  const slug = Math.random().toString(36).slice(2, 9)
  const imagePath = `car-pages/${slug}/image.${ext}`

  await env.PHOTOS_BUCKET.put(imagePath, file.stream(), {
    httpMetadata: { contentType: file.type || 'image/webp' },
  })

  const config: CarPageConfig = {
    slug,
    imageUrl: `${env.R2_BASE_URL}/${imagePath}`,
    imagePath,
    loadingSteps,
    loadingDuration,
    brand,
    createdAt: new Date().toISOString(),
  }

  await env.PHOTOS_BUCKET.put(`car-pages/${slug}/config.json`, JSON.stringify(config), {
    httpMetadata: { contentType: 'application/json' },
  })

  return jsonResponse({ success: true, slug, url: `/car/${slug}` })
}

async function handleGetCarPage(slug: string, env: Env): Promise<Response> {
  if (!slug || !/^[a-z0-9]{5,12}$/.test(slug)) return errorResponse('Invalid slug', 400)

  const object = await env.PHOTOS_BUCKET.get(`car-pages/${slug}/config.json`)
  if (!object) return errorResponse('Not found', 404)

  const config = await object.json()
  return jsonResponse(config)
}

async function handleBlogImageUpload(request: Request, env: Env): Promise<Response> {
  const authError = requireAuth(request, env)
  if (authError) return authError

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return errorResponse('No file provided')

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const r2Path = `blogs/assets/${fileName}`

  await env.PHOTOS_BUCKET.put(r2Path, file.stream(), {
    httpMetadata: { contentType: file.type || 'image/jpeg' },
  })

  const url = `${env.R2_BASE_URL}/${r2Path}`
  return jsonResponse({ success: true, path: r2Path, url })
}
