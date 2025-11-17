import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const providerId = searchParams.get('providerId');
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    // Build query filters
    const where: any = {};

    if (providerId) {
      where.providerId = providerId;
    }

    if (status) {
      where.status = status;
    }

    // Get validations with filters
    const [validations, total] = await Promise.all([
      prisma.validation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          provider: {
            select: {
              id: true,
              displayName: true,
              category: true,
            },
          },
        },
      }),
      prisma.validation.count({ where }),
    ]);

    return NextResponse.json({
      validations,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch validation history' },
      { status: 500 }
    );
  }
}
