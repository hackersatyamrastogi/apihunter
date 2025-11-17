import { JWTDecoded } from '../types';

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
