import crypto from 'node:crypto'

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function toBase32(buffer) {
  let bits = ''
  for (const byte of buffer) {
    bits += byte.toString(2).padStart(8, '0')
  }

  let output = ''
  for (let index = 0; index < bits.length; index += 5) {
    const chunk = bits.slice(index, index + 5).padEnd(5, '0')
    output += alphabet[Number.parseInt(chunk, 2)]
  }

  return output
}

function sha256Hex(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function randomCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase()
}

const issuer = process.argv[2] || 'Hyonelin Admin'
const account = process.argv[3] || 'admin'

const secret = toBase32(crypto.randomBytes(20))
const backupCodes = Array.from({ length: 8 }, () => randomCode())
const backupCodeHashes = backupCodes.map(sha256Hex)
const otpauth = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`

console.log(`ADMIN_TOTP_SECRET=${secret}`)
console.log(`ADMIN_BACKUP_CODE_HASHES=${JSON.stringify(backupCodeHashes)}`)
console.log(`OTPAUTH_URI=${otpauth}`)
console.log('')
console.log('Backup codes:')
for (const code of backupCodes) {
  console.log(`- ${code}`)
}
