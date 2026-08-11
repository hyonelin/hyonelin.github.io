/** Minimal TOTP (RFC 6238) helpers for Cloudflare Workers. */

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

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
  // high 32 bits stay 0 for practical TOTP counters
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
  const otp = (code % 10 ** digits).toString().padStart(digits, '0')
  return otp
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

export function totpEnabled(secret: string | undefined | null): boolean {
  return Boolean(secret && secret.replace(/\s+/g, '').length >= 16)
}
