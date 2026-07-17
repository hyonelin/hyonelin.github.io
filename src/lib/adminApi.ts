export const WORKER_URL = 'https://photo-admin.hyonelin.workers.dev'
export const TURNSTILE_SITE_KEY = '0x4AAAAAADfykz_TUNYFStnF'

export function authHeaders(password: string, json = false): HeadersInit {
  return {
    Authorization: `Bearer ${password}`,
    ...(json ? { 'Content-Type': 'application/json' } : {}),
  }
}
