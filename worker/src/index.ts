/**
 * Photo Admin Worker
 *
 * 功能:
 * 1. 登录限流（失败延迟 + IP 锁定 + Turnstile）
 * 2. 登录会话（短期 session）
 * 3. 二次验证（TOTP / 备用恢复码）
 * 4. 图片上传到 R2
 * 5. JSON 更新（index.json 和 albums.json）
 */

export interface Env {
  PHOTOS_BUCKET: R2Bucket
  RATE_LIMIT: KVNamespace
  ADMIN_PASSWORD: string
  ADMIN_SESSION_SECRET: string
  ADMIN_TOTP_SECRET?: string
  ADMIN_BACKUP_CODE_HASHES?: string
  R2_BASE_URL: string
  TURNSTILE_SECRET: string
  TURNSTILE_SITE_KEY: string
  ALLOWED_ORIGIN?: string
  SESSION_TTL_SECONDS?: string
}

const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 8
const SESSION_COOKIE_NAME = 'admin_session'
const SESSION_PREFIX = 'session:'
const MAX_TOTP_DRIFT_STEPS = 1

const RATE_LIMIT_CONFIG = {
  MAX_ATTEMPTS: 3,
  LOCKOUT_ATTEMPTS: 5,
  LOCKOUT_DURATION: 900,
  BASE_DELAY: 1000,
  MAX_DELAY: 30000,
}

function getAllowedOrigin(env: Env): string {
  return env.ALLOWED_ORIGIN || '*'
}

function buildCorsHeaders(request: Request, env: Env) {
  const origin = request.headers.get('Origin')
  const allowedOrigin = getAllowedOrigin(env)
  const isExplicitOrigin = allowedOrigin !== '*'
  const responseOrigin = isExplicitOrigin ? allowedOrigin : (origin || '*')

  return {
    'Access-Control-Allow-Origin': responseOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Expose-Headers': 'Set-Cookie',
    Vary: 'Origin',
  }
}

function jsonResponse(request: Request, env: Env, data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...buildCorsHeaders(request, env),
      ...extraHeaders,
    },
  })
}

function errorResponse(request: Request, env: Env, message: string, status = 400, extraHeaders: Record<string, string> = {}) {
  return jsonResponse(request, env, { error: message }, status, extraHeaders)
}

function getClientIP(request: Request): string {
  const cf = request.cf as { ip?: string } | undefined
  return cf?.ip || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

function getSessionTtlSeconds(env: Env): number {
  const parsed = Number(env.SESSION_TTL_SECONDS || `${DEFAULT_SESSION_TTL_SECONDS}`)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_SESSION_TTL_SECONDS
}

function base64UrlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const array = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let binary = ''
  for (const byte of array) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

async function sha256Hex(value: string): Promise<string> {
  const encoded = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  return toHex(new Uint8Array(digest))
}

async function hmacSha1(keyBytes: Uint8Array, messageBytes: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign'])
  const signature = await crypto.subtle.sign('HMAC', key, messageBytes)
  return new Uint8Array(signature)
}

function parseCookieHeader(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {}

  return cookieHeader.split(';').reduce<Record<string, string>>((acc, pair) => {
    const index = pair.indexOf('=')
    if (index < 0) return acc
    const key = pair.slice(0, index).trim()
    const value = pair.slice(index + 1).trim()
    acc[key] = value
    return acc
  }, {})
}

function createCookie(value: string, maxAgeSeconds: number): string {
  return [
    `${SESSION_COOKIE_NAME}=${value}`,
    'HttpOnly',
    'Secure',
    'SameSite=None',
    'Path=/',
    `Max-Age=${maxAgeSeconds}`,
  ].join('; ')
}

function clearCookie(): string {
  return `${SESSION_COOKIE_NAME}=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0`
}

async function createSession(env: Env, payload: { userId: string; method: string }) {
  const sessionId = base64UrlEncode(crypto.getRandomValues(new Uint8Array(32)))
  const tokenKey = `${SESSION_PREFIX}${sessionId}`
  const expiresAt = Date.now() + getSessionTtlSeconds(env) * 1000
  const sessionValue = {
    ...payload,
    createdAt: Date.now(),
    expiresAt,
  }

  await env.RATE_LIMIT.put(tokenKey, JSON.stringify(sessionValue), {
    expirationTtl: getSessionTtlSeconds(env),
  })

  return { sessionId, expiresAt }
}

async function getSession(env: Env, request: Request): Promise<{ sessionId: string; value: Record<string, unknown> } | null> {
  const cookies = parseCookieHeader(request.headers.get('Cookie'))
  const authHeader = request.headers.get('Authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const sessionId = cookies[SESSION_COOKIE_NAME] || bearerToken

  if (!sessionId) return null

  const raw = await env.RATE_LIMIT.get(`${SESSION_PREFIX}${sessionId}`, 'json') as Record<string, unknown> | null
  if (!raw) return null

  const expiresAt = Number(raw.expiresAt || 0)
  if (expiresAt > 0 && expiresAt < Date.now()) {
    await env.RATE_LIMIT.delete(`${SESSION_PREFIX}${sessionId}`)
    return null
  }

  return { sessionId, value: raw }
}

async function requireAuth(request: Request, env: Env): Promise<{ sessionId: string; value: Record<string, unknown> } | Response> {
  const session = await getSession(env, request)
  if (!session) {
    return errorResponse(request, env, 'Unauthorized', 401)
  }
  return session
}

async function deleteSession(env: Env, sessionId: string): Promise<void> {
  await env.RATE_LIMIT.delete(`${SESSION_PREFIX}${sessionId}`)
}

function normalizeBase32Secret(secret: string): string {
  return secret.replace(/\s+/g, '').toUpperCase().replace(/=+$/g, '')
}

function base32ToBytes(base32: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const cleaned = normalizeBase32Secret(base32)
  let bits = ''
  for (const char of cleaned) {
    const value = alphabet.indexOf(char)
    if (value < 0) {
      throw new Error('Invalid TOTP secret')
    }
    bits += value.toString(2).padStart(5, '0')
  }

  const bytes: number[] = []
  for (let index = 0; index + 8 <= bits.length; index += 8) {
    bytes.push(Number.parseInt(bits.slice(index, index + 8), 2))
  }
  return new Uint8Array(bytes)
}

function buildOtpAuthUri(secret: string, accountName: string, issuer: string): string {
  const params = new URLSearchParams({
    secret: normalizeBase32Secret(secret),
    issuer,
    algorithm: 'SHA1',
    digits: '6',
    period: '30',
  })
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?${params.toString()}`
}

async function generateTotpCode(secret: string, time = Date.now()): Promise<string> {
  const step = Math.floor(time / 30000)
  const counter = new Uint8Array(8)
  const view = new DataView(counter.buffer)
  view.setBigUint64(0, BigInt(step))

  const keyBytes = base32ToBytes(secret)
  const hash = await hmacSha1(keyBytes, counter)
  const offset = hash[hash.length - 1] & 0x0f
  const code =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff)
  const otp = (code % 1_000_000).toString().padStart(6, '0')
  return otp
}

async function verifyTotp(secret: string, token: string): Promise<boolean> {
  if (!/^\d{6}$/.test(token)) return false

  const currentStep = Math.floor(Date.now() / 30000)
  for (let offset = -MAX_TOTP_DRIFT_STEPS; offset <= MAX_TOTP_DRIFT_STEPS; offset += 1) {
    const stepTime = (currentStep + offset) * 30000
    const expected = await generateTotpCode(secret, stepTime)
    if (expected === token) return true
  }

  return false
}

async function verifyBackupCode(env: Env, code: string): Promise<boolean> {
  const hashes = parseBackupCodeHashes(env.ADMIN_BACKUP_CODE_HASHES)
  if (hashes.length === 0) return false

  const normalized = code.replace(/\s+/g, '').toUpperCase()
  const hash = await sha256Hex(normalized)
  return hashes.includes(hash)
}

function parseBackupCodeHashes(raw?: string): string[] {
  if (!raw) return []

  const trimmed = raw.trim()
  if (!trimmed) return []

  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed) as unknown
      if (Array.isArray(parsed)) {
        return parsed.map((value) => String(value).trim().toLowerCase()).filter(Boolean)
      }
    } catch {
      return []
    }
  }

  return trimmed
    .split(/[\n,]+/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
}

function getRateLimitKey(ip: string): string {
  return `rate_limit:${ip}`
}

async function getRateLimitState(env: Env, ip: string): Promise<{
  attempts: number
  lockedUntil: number
  requireTurnstile: boolean
}> {
  const data = await env.RATE_LIMIT.get(getRateLimitKey(ip), 'json') as { attempts?: number; lockedUntil?: number } | null

  if (!data) {
    return { attempts: 0, lockedUntil: 0, requireTurnstile: false }
  }

  const attempts = data.attempts || 0
  const lockedUntil = data.lockedUntil || 0
  const now = Date.now()

  if (lockedUntil > 0 && lockedUntil < now) {
    return { attempts: 0, lockedUntil: 0, requireTurnstile: false }
  }

  return {
    attempts,
    lockedUntil,
    requireTurnstile: attempts >= RATE_LIMIT_CONFIG.MAX_ATTEMPTS && attempts < RATE_LIMIT_CONFIG.LOCKOUT_ATTEMPTS,
  }
}

async function updateRateLimitState(env: Env, ip: string, success: boolean): Promise<void> {
  const key = getRateLimitKey(ip)
  const current = await getRateLimitState(env, ip)

  if (success) {
    await env.RATE_LIMIT.delete(key)
    return
  }

  const newAttempts = current.attempts + 1
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

function getDelay(attempts: number): number {
  const delay = RATE_LIMIT_CONFIG.BASE_DELAY * Math.pow(2, attempts - 1)
  return Math.min(delay, RATE_LIMIT_CONFIG.MAX_DELAY)
}

async function verifyTurnstile(token: string, ip: string, env: Env): Promise<boolean> {
  const formData = new FormData()
  formData.append('secret', env.TURNSTILE_SECRET)
  formData.append('response', token)
  formData.append('remoteip', ip)

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData,
  })

  const result = await response.json() as { success?: boolean }
  return result.success === true
}

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
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: buildCorsHeaders(request, env) })
    }

    const url = new URL(request.url)
    const path = url.pathname

    try {
      if (path === '/api/rate-limit' && request.method === 'GET') {
        return handleGetRateLimit(request, env)
      }

      if (path === '/api/auth/status' && request.method === 'GET') {
        return handleAuthStatus(request, env)
      }

      if ((path === '/api/auth/login' || path === '/api/verify') && request.method === 'POST') {
        return handleLogin(request, env)
      }

      if (path === '/api/auth/logout' && request.method === 'POST') {
        return handleLogout(request, env)
      }

      if (path === '/api/upload' && request.method === 'POST') {
        return handleUpload(request, env)
      }

      if (path === '/api/photos' && request.method === 'GET') {
        return handleGetPhotos(request, env)
      }

      if (path === '/api/albums' && request.method === 'GET') {
        return handleGetAlbums(request, env)
      }

      if (path === '/api/albums' && request.method === 'POST') {
        return handleCreateAlbum(request, env)
      }

      if (path === '/api/albums/add-photo' && request.method === 'POST') {
        return handleAddPhotoToAlbum(request, env)
      }

      return errorResponse(request, env, 'Not Found', 404)
    } catch (error) {
      console.error('Worker error:', error)
      return errorResponse(request, env, 'Internal Server Error', 500)
    }
  },
}

async function handleGetRateLimit(request: Request, env: Env): Promise<Response> {
  const ip = getClientIP(request)
  const state = await getRateLimitState(env, ip)
  const now = Date.now()
  const isLocked = state.lockedUntil > now

  return jsonResponse(request, env, {
    attempts: state.attempts,
    requireTurnstile: state.requireTurnstile,
    isLocked,
    lockedUntil: isLocked ? state.lockedUntil : null,
    delay: isLocked ? 0 : getDelay(state.attempts),
  })
}

async function handleAuthStatus(request: Request, env: Env): Promise<Response> {
  const session = await getSession(env, request)
  const totpConfigured = Boolean(env.ADMIN_TOTP_SECRET && env.ADMIN_TOTP_SECRET.trim())

  return jsonResponse(request, env, {
    authenticated: Boolean(session),
    method: session?.value.method || null,
    expiresAt: session?.value.expiresAt || null,
    totpConfigured,
    backupCodesConfigured: parseBackupCodeHashes(env.ADMIN_BACKUP_CODE_HASHES).length > 0,
  })
}

async function handleLogin(request: Request, env: Env): Promise<Response> {
  const ip = getClientIP(request)
  const state = await getRateLimitState(env, ip)
  const now = Date.now()

  if (state.lockedUntil > now) {
    const remaining = Math.ceil((state.lockedUntil - now) / 1000)
    return errorResponse(request, env, `账户已锁定，请 ${remaining} 秒后重试`, 429)
  }

  const body = await request.json() as {
    password?: string
    totpCode?: string
    backupCode?: string
    turnstileToken?: string
  }

  const password = body.password || ''
  const totpCode = (body.totpCode || '').trim().replace(/\s+/g, '')
  const backupCode = (body.backupCode || '').trim()
  const turnstileToken = body.turnstileToken || ''

  if (state.requireTurnstile) {
    if (!turnstileToken) {
      return errorResponse(request, env, '请完成人机验证', 400)
    }

    const turnstileValid = await verifyTurnstile(turnstileToken, ip, env)
    if (!turnstileValid) {
      return errorResponse(request, env, '人机验证失败，请重试', 400)
    }
  }

  if (password !== env.ADMIN_PASSWORD) {
    await updateRateLimitState(env, ip, false)
    const newState = await getRateLimitState(env, ip)
    const delay = getDelay(newState.attempts)
    await new Promise((resolve) => setTimeout(resolve, delay))

    return jsonResponse(request, env, {
      success: false,
      error: '密码错误',
      attempts: newState.attempts,
      requireTurnstile: newState.requireTurnstile,
      delay,
    }, 401)
  }

  const hasTotpSecret = Boolean(env.ADMIN_TOTP_SECRET && env.ADMIN_TOTP_SECRET.trim())
  const hasBackupCodes = parseBackupCodeHashes(env.ADMIN_BACKUP_CODE_HASHES).length > 0

  if (hasTotpSecret) {
    const totpValid = totpCode ? await verifyTotp(env.ADMIN_TOTP_SECRET!, totpCode) : false
    const backupValid = !totpValid && backupCode ? await verifyBackupCode(env, backupCode) : false

    if (!totpValid && !backupValid) {
      await updateRateLimitState(env, ip, false)
      const newState = await getRateLimitState(env, ip)
      return jsonResponse(request, env, {
        success: false,
        error: hasBackupCodes ? '二次验证失败' : '验证码错误',
        attempts: newState.attempts,
        requireTurnstile: newState.requireTurnstile,
        delay: getDelay(newState.attempts),
      }, 401)
    }
  }

  await updateRateLimitState(env, ip, true)

  const session = await createSession(env, {
    userId: 'admin',
    method: hasTotpSecret ? 'password+totp' : 'password',
  })

  const responseHeaders = {
    'Set-Cookie': createCookie(session.sessionId, getSessionTtlSeconds(env)),
  }

  return jsonResponse(request, env, {
    success: true,
    message: 'Verified',
    sessionId: session.sessionId,
    expiresAt: session.expiresAt,
    method: hasTotpSecret ? 'password+totp' : 'password',
  }, 200, responseHeaders)
}

async function handleLogout(request: Request, env: Env): Promise<Response> {
  const session = await getSession(env, request)
  if (session) {
    await deleteSession(env, session.sessionId)
  }

  return jsonResponse(request, env, { success: true }, 200, {
    'Set-Cookie': clearCookie(),
  })
}

async function handleUpload(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) {
    return auth
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const metadataStr = formData.get('metadata') as string | null
  const mode = formData.get('mode') as string
  const albumId = formData.get('albumId') as string | null

  if (!file) {
    return errorResponse(request, env, 'No file provided')
  }

  if (!metadataStr) {
    return errorResponse(request, env, 'No metadata provided')
  }

  let metadata: PhotoMetadata
  try {
    metadata = JSON.parse(metadataStr) as PhotoMetadata
  } catch {
    return errorResponse(request, env, 'Invalid metadata JSON')
  }

  const date = new Date(metadata.date)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const ext = file.name.split('.').pop() || 'jpg'
  const timestamp = Date.now()
  const randomStr = crypto.getRandomValues(new Uint8Array(4))
  const randomSuffix = base64UrlEncode(randomStr)
  const fileName = `${timestamp}-${randomSuffix}.${ext}`

  const r2Path = mode === 'album' && albumId
    ? `albums/${albumId}/${fileName}`
    : `shots/${year}/${month}/${fileName}`

  await env.PHOTOS_BUCKET.put(r2Path, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
  })

  metadata.path = r2Path

  if (mode === 'album' && albumId) {
    await addPhotoToAlbumR2(env, albumId, metadata)
  } else {
    await addPhotoToIndex(env, metadata)
  }

  return jsonResponse(request, env, {
    success: true,
    path: r2Path,
    url: `${env.R2_BASE_URL}/${r2Path}`,
    metadata,
  })
}

async function handleGetPhotos(request: Request, env: Env): Promise<Response> {
  const object = await env.PHOTOS_BUCKET.get('photos/index.json')

  if (!object) {
    const emptyIndex: PhotoIndex = {
      photos: [],
      meta: {
        totalCount: 0,
        lastUpdated: new Date().toISOString(),
        version: '2.0.0',
      },
    }
    return jsonResponse(request, env, emptyIndex)
  }

  const data = await object.json()
  return jsonResponse(request, env, data)
}

async function handleGetAlbums(request: Request, env: Env): Promise<Response> {
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
    return jsonResponse(request, env, emptyAlbums)
  }

  const data = await object.json()
  return jsonResponse(request, env, data)
}

async function handleCreateAlbum(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) {
    return auth
  }

  const body = await request.json() as Partial<PhotoAlbum>
  const { title, description, date, location, tags, published } = body

  if (!title || !date) {
    return errorResponse(request, env, 'Title and date are required')
  }

  const dateStr = new Date(date).toISOString().split('T')[0]
  const slug = title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
  const id = `${dateStr}-${slug}`

  let albums: AlbumIndex
  const existing = await env.PHOTOS_BUCKET.get('photos/albums.json')

  if (existing) {
    albums = await existing.json() as AlbumIndex
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

  if (albums.albums.some((album) => album.id === id)) {
    return errorResponse(request, env, 'Album with this ID already exists')
  }

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

  await env.PHOTOS_BUCKET.put('photos/albums.json', JSON.stringify(albums, null, 2), {
    httpMetadata: { contentType: 'application/json' },
  })

  return jsonResponse(request, env, { success: true, album: newAlbum })
}

async function addPhotoToIndex(env: Env, photo: PhotoMetadata): Promise<void> {
  let index: PhotoIndex
  const existing = await env.PHOTOS_BUCKET.get('photos/index.json')

  if (existing) {
    index = await existing.json() as PhotoIndex
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

  index.photos.unshift(photo)
  index.meta.totalCount = index.photos.length
  index.meta.lastUpdated = new Date().toISOString()

  await env.PHOTOS_BUCKET.put('photos/index.json', JSON.stringify(index, null, 2), {
    httpMetadata: { contentType: 'application/json' },
  })
}

async function addPhotoToAlbumR2(env: Env, albumId: string, photo: PhotoMetadata): Promise<void> {
  const existing = await env.PHOTOS_BUCKET.get('photos/albums.json')

  if (!existing) {
    throw new Error('No albums found')
  }

  const albums = await existing.json() as AlbumIndex
  const album = albums.albums.find((item) => item.id === albumId)

  if (!album) {
    throw new Error('Album not found')
  }

  album.photos.push(photo)

  if (!album.coverImage && photo.path) {
    album.coverImage = photo.path
  }

  albums.meta.lastUpdated = new Date().toISOString()

  await env.PHOTOS_BUCKET.put('photos/albums.json', JSON.stringify(albums, null, 2), {
    httpMetadata: { contentType: 'application/json' },
  })
}

async function handleAddPhotoToAlbum(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env)
  if (auth instanceof Response) {
    return auth
  }

  const body = await request.json() as { albumId: string; photo: PhotoMetadata }
  const { albumId, photo } = body

  if (!albumId || !photo) {
    return errorResponse(request, env, 'albumId and photo are required')
  }

  try {
    await addPhotoToAlbumR2(env, albumId, photo)
    return jsonResponse(request, env, { success: true })
  } catch (error) {
    return errorResponse(request, env, (error as Error).message, 404)
  }
}
