import { NextRequest, NextResponse } from 'next/server';
import { crackJWT } from '@/lib/utils/jwt';

// Common weak secrets for JWT cracking
const COMMON_SECRETS = [
  'secret',
  'secret123',
  'password',
  'password123',
  '123456',
  'qwerty',
  'admin',
  'admin123',
  'root',
  'test',
  'demo',
  'default',
  'changeme',
  'letmein',
  'welcome',
  'monkey',
  '123456789',
  '12345678',
  '12345',
  '1234567',
  'Password1',
  'abc123',
  'qwerty123',
  'password1',
  'letmein',
  'trustno1',
  'dragon',
  'baseball',
  'iloveyou',
  'master',
  'sunshine',
  'ashley',
  'bailey',
  'passw0rd',
  'shadow',
  '123123',
  '654321',
  'superman',
  'qazwsx',
  'michael',
  'football',
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, wordlist, useCommon = true } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Build the wordlist
    let secrets: string[] = [];

    if (useCommon) {
      secrets = [...COMMON_SECRETS];
    }

    if (wordlist && Array.isArray(wordlist)) {
      secrets = [...secrets, ...wordlist];
    } else if (wordlist && typeof wordlist === 'string') {
      // Split by newlines or commas
      const customSecrets = wordlist
        .split(/[\n,]/)
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);
      secrets = [...secrets, ...customSecrets];
    }

    // Remove duplicates
    secrets = [...new Set(secrets)];

    const startTime = Date.now();
    const foundSecret = await crackJWT(token, secrets);
    const duration = Date.now() - startTime;

    if (foundSecret) {
      return NextResponse.json({
        success: true,
        secret: foundSecret,
        duration,
        attemptsCount: secrets.indexOf(foundSecret) + 1,
        totalSecrets: secrets.length,
      });
    }

    return NextResponse.json({
      success: false,
      message: `No match found in ${secrets.length} attempts`,
      duration,
      totalSecrets: secrets.length,
    });
  } catch (error) {
    console.error('JWT crack error:', error);
    return NextResponse.json(
      { error: 'Failed to crack JWT' },
      { status: 500 }
    );
  }
}
