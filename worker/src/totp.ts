/** Minimal TOTP (RFC 6238) + recovery-code helpers for Cloudflare Workers. */

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

export function base32Encode(bytes: Uint8Array): string {
  let bits = ''
  for (const b of bytes) bits += b.toString(2).padStart(8, '0')
  let out = ''
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, '0')
    out += BASE32_ALPHABET[parseInt(chunk, 2)]
  }
  return out
}

export function base32Decode(input: string): Uint8Array {
  const cleaned = input.replace(/=+$/g, '').replace(/\s+/g, '').toUpperCase()
  let bits = ''
  for (const char of cleaned) {
    const val = BASE32_ALPHABET.indexOf(char)
    if (val === -1) throw new Error('Invalid base32 secret')
    bits += val.toString(2).padStart(5, '0')
  }
  const bytes: number[] = []
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2))
  }
  return new Uint8Array(bytes)
}

function counterToBytes(counter: number): Uint8Array {
  const buf = new ArrayBuffer(8)
  const view = new DataView(buf)
  view.setUint32(4, counter >>> 0, false)
  return new Uint8Array(buf)
}

async function hotp(secret: Uint8Array, counter: number, digits = 6): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    secret,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  )
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, counterToBytes(counter)))
  const offset = sig[sig.length - 1] & 0x0f
  const code =
    ((sig[offset] & 0x7f) << 24) |
    ((sig[offset + 1] & 0xff) << 16) |
    ((sig[offset + 2] & 0xff) << 8) |
    (sig[offset + 3] & 0xff)
  return (code % 10 ** digits).toString().padStart(digits, '0')
}

export async function verifyTotpCode(
  secretBase32: string,
  code: string,
  window = 1,
): Promise<boolean> {
  const normalized = (code || '').replace(/\s+/g, '')
  if (!/^\d{6}$/.test(normalized)) return false

  const secret = base32Decode(secretBase32)
  const timestep = Math.floor(Date.now() / 1000 / 30)
  for (let w = -window; w <= window; w++) {
    const expected = await hotp(secret, timestep + w)
    if (expected === normalized) return true
  }
  return false
}

export function generateTotpSecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(20))
  return base32Encode(bytes)
}

export function buildOtpauthUrl(secret: string, account = 'admin', issuer = 'hyonelin'): string {
  const label = encodeURIComponent(`${issuer}:${account}`)
  const params = new URLSearchParams({
    secret,
    issuer,
    digits: '6',
    period: '30',
    algorithm: 'SHA1',
  })
  return `otpauth://totp/${label}?${params.toString()}`
}

const RECOVERY_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateRecoveryCodes(count = 8): string[] {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    const bytes = crypto.getRandomValues(new Uint8Array(8))
    let raw = ''
    for (const b of bytes) raw += RECOVERY_ALPHABET[b % RECOVERY_ALPHABET.length]
    codes.push(`${raw.slice(0, 4)}-${raw.slice(4)}`)
  }
  return codes
}

export function normalizeRecoveryCode(code: string): string {
  return (code || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export async function hashRecoveryCode(code: string): Promise<string> {
  const normalized = normalizeRecoveryCode(code)
  const data = new TextEncoder().encode(normalized)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function hashRecoveryCodes(codes: string[]): Promise<string[]> {
  return Promise.all(codes.map(hashRecoveryCode))
}
