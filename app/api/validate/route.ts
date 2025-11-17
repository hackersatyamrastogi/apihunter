import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getProvider } from '@/lib/providers/registry';
import { createSecretFingerprint } from '@/lib/security/redaction';
import { ValidationRequest } from '@/lib/types';

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body: ValidationRequest = await request.json();
    const { providerId, credentials, storeInHistory = true } = body;

    // Validate input
    if (!providerId || !credentials) {
      return NextResponse.json(
        { error: 'Missing required fields: providerId and credentials' },
        { status: 400 }
      );
    }

    // Get provider definition
    const provider = getProvider(providerId);

    if (!provider) {
      return NextResponse.json(
        { error: `Provider not found: ${providerId}` },
        { status: 404 }
      );
    }

    // Validate credentials against provider's input schema
    for (const field of provider.inputFields) {
      if (field.required && !credentials[field.name]) {
        return NextResponse.json(
          { error: `Missing required field: ${field.name}` },
          { status: 400 }
        );
      }
    }

    // Execute validation
    const startTime = Date.now();
    const result = await provider.validate(credentials);
    const duration = Date.now() - startTime;

    // Create secret fingerprint for history
    const secretValues = Object.values(credentials).filter(Boolean).join('|');
    const secretFingerprint = createSecretFingerprint(secretValues);

    // Store in history if enabled
    if (storeInHistory && process.env.ENABLE_HISTORY !== 'false') {
      try {
        await prisma.validation.create({
          data: {
            providerId: provider.id,
            status: result.status,
            secretFingerprint,
            metadata: result.metadata as any,
            errorSummary: result.errorMessage,
            rawResponse: result.rawResponse,
            httpStatus: result.httpStatus,
            requestDuration: result.requestDuration || duration,
          },
        });
      } catch (dbError) {
        // Log but don't fail the request if history storage fails
        console.error('Failed to store validation in history:', dbError);
      }
    }

    // Return validation result
    return NextResponse.json({
      success: true,
      result: {
        ...result,
        provider: {
          id: provider.id,
          name: provider.displayName,
          category: provider.category,
        },
        secretFingerprint,
        duration,
      },
    });
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
