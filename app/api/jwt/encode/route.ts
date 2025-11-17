import { NextRequest, NextResponse } from 'next/server';
import { encodeJWT, signJWT } from '@/lib/utils/jwt';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { header, payload, secret, mode } = body;

    if (!header || !payload) {
      return NextResponse.json(
        { error: 'Header and payload are required' },
        { status: 400 }
      );
    }

    let token: string;

    if (mode === 'sign' && secret) {
      // Sign with provided secret
      const algorithm = header.alg || 'HS256';
      token = signJWT(header, payload, secret, algorithm);
    } else {
      // Encode without signature (or with custom signature)
      token = encodeJWT(header, payload, body.signature || '');
    }

    return NextResponse.json({ token });
  } catch (error) {
    console.error('JWT encode error:', error);
    return NextResponse.json(
      { error: 'Failed to encode JWT' },
      { status: 500 }
    );
  }
}
