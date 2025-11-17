import crypto from 'crypto';

const REDACTED_PLACEHOLDER = '[REDACTED]';
const PARTIAL_REVEAL_LENGTH = 4;

// Common patterns for API keys, tokens, and secrets
const SECRET_PATTERNS = [
  // Generic API keys
  /([a-zA-Z0-9_-]{32,})/g,
  // AWS keys
  /(AKIA[0-9A-Z]{16})/g,
  /([A-Za-z0-9/+=]{40})/g,
  // Bearer tokens
  /Bearer\s+([a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+)/gi,
  // OAuth tokens
  /(ya29\.[a-zA-Z0-9_-]+)/g,
  // Generic long alphanumeric strings
  /([a-f0-9]{32,})/gi,
  // Base64 patterns
  /([A-Za-z0-9+/]{40,}={0,2})/g,
];

/**
 * Redact sensitive information from a string
 */
export function redactSecrets(text: string): string {
  if (!text) return text;

  let redacted = text;

  for (const pattern of SECRET_PATTERNS) {
    redacted = redacted.replace(pattern, (match) => {
      if (match.length < 16) return match; // Don't redact short strings
      const prefix = match.substring(0, PARTIAL_REVEAL_LENGTH);
      return `${prefix}...${REDACTED_PLACEHOLDER}`;
    });
  }

  return redacted;
}

/**
 * Redact secrets from an object recursively
 */
export function redactObjectSecrets(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return redactSecrets(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(redactObjectSecrets);
  }

  if (typeof obj === 'object') {
    const redacted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Always redact fields with these names
      const sensitiveFields = [
        'password', 'secret', 'token', 'key', 'apikey', 'api_key',
        'access_token', 'refresh_token', 'private_key', 'client_secret',
        'authorization', 'auth', 'credential', 'credentials'
      ];

      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        redacted[key] = REDACTED_PLACEHOLDER;
      } else {
        redacted[key] = redactObjectSecrets(value);
      }
    }
    return redacted;
  }

  return obj;
}

/**
 * Create a SHA-256 fingerprint of a secret with salt
 */
export function createSecretFingerprint(secret: string, salt?: string): string {
  const actualSalt = salt || process.env.SECRET_FINGERPRINT_SALT || 'default-salt';
  return crypto
    .createHash('sha256')
    .update(secret + actualSalt)
    .digest('hex');
}

/**
 * Partially reveal a secret (show first and last N characters)
 */
export function partialReveal(secret: string, revealLength: number = 4): string {
  if (!secret || secret.length <= revealLength * 2) {
    return REDACTED_PLACEHOLDER;
  }

  const start = secret.substring(0, revealLength);
  const end = secret.substring(secret.length - revealLength);
  const middleLength = secret.length - (revealLength * 2);

  return `${start}${'*'.repeat(Math.min(middleLength, 20))}${end}`;
}

/**
 * Encrypt sensitive data for storage
 */
export function encryptData(data: string, key?: string): string {
  const encryptionKey = key || process.env.ENCRYPTION_KEY;

  if (!encryptionKey) {
    throw new Error('Encryption key not configured');
  }

  const algorithm = 'aes-256-cbc';
  const iv = crypto.randomBytes(16);
  const keyBuffer = crypto.scryptSync(encryptionKey, 'salt', 32);

  const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt sensitive data from storage
 */
export function decryptData(encryptedData: string, key?: string): string {
  const encryptionKey = key || process.env.ENCRYPTION_KEY;

  if (!encryptionKey) {
    throw new Error('Encryption key not configured');
  }

  const algorithm = 'aes-256-cbc';
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const keyBuffer = crypto.scryptSync(encryptionKey, 'salt', 32);

  const decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Sanitize error messages to remove any leaked secrets
 */
export function sanitizeError(error: unknown): string {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return redactSecrets(errorMessage);
}
