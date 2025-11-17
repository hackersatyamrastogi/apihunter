import { JWTDecoded } from '../types';
import crypto from 'crypto';

/**
 * Decode a JWT token without verification
 */
export function decodeJWT(token: string): JWTDecoded | null {
  try {
    const parts = token.split('.');

    if (parts.length !== 3) {
      throw new Error('Invalid JWT format - must have 3 parts');
    }

    const [headerB64, payloadB64, signature] = parts;

    // Decode header
    const header = JSON.parse(
      Buffer.from(headerB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    );

    // Decode payload
    const payload = JSON.parse(
      Buffer.from(payloadB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    );

    return {
      header,
      payload,
      signature,
      raw: {
        header: headerB64,
        payload: payloadB64,
        signature,
      },
    };
  } catch (error) {
    return null;
  }
}

/**
 * Encode JWT parts into a token (without signing)
 */
export function encodeJWT(header: any, payload: any, signature: string = ''): string {
  const headerB64 = Buffer.from(JSON.stringify(header))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const payloadB64 = Buffer.from(JSON.stringify(payload))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `${headerB64}.${payloadB64}.${signature}`;
}

/**
 * Sign JWT with HMAC
 */
export function signJWT(header: any, payload: any, secret: string, algorithm: string = 'HS256'): string {
  const headerB64 = Buffer.from(JSON.stringify(header))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const payloadB64 = Buffer.from(JSON.stringify(payload))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const data = `${headerB64}.${payloadB64}`;

  let hmacAlg = 'sha256';
  if (algorithm === 'HS384') hmacAlg = 'sha384';
  if (algorithm === 'HS512') hmacAlg = 'sha512';

  const signature = crypto
    .createHmac(hmacAlg, secret)
    .update(data)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `${data}.${signature}`;
}

/**
 * Attempt to crack JWT signature with common secrets
 */
export async function crackJWT(token: string, wordlist: string[]): Promise<string | null> {
  const decoded = decodeJWT(token);
  if (!decoded) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, originalSig] = parts;
  const data = `${headerB64}.${payloadB64}`;
  const algorithm = decoded.header.alg as string;

  // Only support HMAC algorithms for cracking
  if (!algorithm.startsWith('HS')) {
    return null;
  }

  let hmacAlg = 'sha256';
  if (algorithm === 'HS384') hmacAlg = 'sha384';
  if (algorithm === 'HS512') hmacAlg = 'sha512';

  // Try each secret
  for (const secret of wordlist) {
    const signature = crypto
      .createHmac(hmacAlg, secret)
      .update(data)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    if (signature === originalSig) {
      return secret;
    }
  }

  return null;
}

/**
 * Check if a JWT is expired
 */
export function isJWTExpired(decoded: JWTDecoded): boolean {
  const exp = decoded.payload.exp;
  if (!exp || typeof exp !== 'number') {
    return false; // No expiration claim
  }

  const now = Math.floor(Date.now() / 1000);
  return exp < now;
}

/**
 * Get human-readable JWT info
 */
export function getJWTInfo(decoded: JWTDecoded): {
  issuer?: string;
  subject?: string;
  audience?: string | string[];
  issuedAt?: Date;
  expiresAt?: Date;
  notBefore?: Date;
  algorithm?: string;
  keyId?: string;
  isExpired: boolean;
} {
  const iat = decoded.payload.iat;
  const exp = decoded.payload.exp;
  const nbf = decoded.payload.nbf;

  return {
    issuer: decoded.payload.iss as string | undefined,
    subject: decoded.payload.sub as string | undefined,
    audience: decoded.payload.aud as string | string[] | undefined,
    issuedAt: typeof iat === 'number' ? new Date(iat * 1000) : undefined,
    expiresAt: typeof exp === 'number' ? new Date(exp * 1000) : undefined,
    notBefore: typeof nbf === 'number' ? new Date(nbf * 1000) : undefined,
    algorithm: decoded.header.alg as string | undefined,
    keyId: decoded.header.kid as string | undefined,
    isExpired: isJWTExpired(decoded),
  };
}
