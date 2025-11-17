import { NextRequest, NextResponse } from 'next/server';
import { decodeJWT, getJWTInfo } from '@/lib/utils/jwt';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Missing token in request body' },
        { status: 400 }
      );
    }

    const decoded = decodeJWT(token);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid JWT format' },
        { status: 400 }
      );
    }

    const info = getJWTInfo(decoded);

    return NextResponse.json({
      success: true,
      decoded,
      info,
    });
  } catch (error) {
    console.error('JWT decode error:', error);
    return NextResponse.json(
      {
        error: 'Failed to decode JWT',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
