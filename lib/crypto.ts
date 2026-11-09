import crypto from 'crypto'

// Algorithm constants — AES-256-GCM provides authenticated encryption.
const ALGORITHM = 'aes-256-gcm' as const
const IV_LENGTH = 12    // 96-bit IV (recommended for GCM)
const TAG_LENGTH = 16   // 128-bit auth tag

/**
 * Encrypts a plaintext string using AES-256-GCM.
 *
 * @param plaintext - The string to encrypt (e.g. Salesforce access_token)
 * @param keyHex   - A 64-character hex string (32 bytes). Read from TOKEN_ENCRYPTION_KEY env.
 * @returns A colon-delimited string: "iv_hex:authTag_hex:ciphertext_hex"
 *
 * @example
 * const encrypted = encrypt(accessToken, process.env.TOKEN_ENCRYPTION_KEY!)
 */
export function encrypt(plaintext: string, keyHex: string): string {
  if (keyHex.length !== 64) {
    throw new Error('TOKEN_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)')
  }

  const key = Buffer.from(keyHex, 'hex')
  const iv  = crypto.randomBytes(IV_LENGTH)

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: TAG_LENGTH,
  })

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])

  const authTag = cipher.getAuthTag()

  return [
    iv.toString('hex'),
    authTag.toString('hex'),
    encrypted.toString('hex'),
  ].join(':')
}

/**
 * Decrypts a ciphertext string produced by `encrypt()`.
 *
 * @param ciphertext - The "iv:authTag:ciphertext" string from the database.
 * @param keyHex     - The same 64-character hex key used for encryption.
 * @returns The original plaintext string.
 *
 * @throws If the ciphertext format is invalid or the auth tag doesn't match.
 */
export function decrypt(ciphertext: string, keyHex: string): string {
  if (keyHex.length !== 64) {
    throw new Error('TOKEN_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)')
  }

  const parts = ciphertext.split(':')
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted token format — expected "iv:authTag:ciphertext"')
  }

  const [ivHex, authTagHex, encryptedHex] = parts
  const key     = Buffer.from(keyHex, 'hex')
  const iv      = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const encryptedData = Buffer.from(encryptedHex, 'hex')

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: TAG_LENGTH,
  })
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final(),
  ])

  return decrypted.toString('utf8')
}

/**
 * Generates a cryptographically secure random key for AES-256-GCM.
 * Run once and store the output as TOKEN_ENCRYPTION_KEY in .env.local
 *
 * Usage (Node.js REPL or CLI):
 *   node -e "const {generateEncryptionKey} = require('./lib/crypto'); console.log(generateEncryptionKey())"
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex')
}
