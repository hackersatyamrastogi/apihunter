import { NextRequest, NextResponse } from 'next/server';
import { safeRequest } from '@/lib/utils/http-client';
import { redactObjectSecrets } from '@/lib/security/redaction';
import { CustomTestRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: CustomTestRequest = await request.json();
    const { url, method, headers, body: requestBody, credentialInjection } = body;

    // Validate input
    if (!url || !method) {
      return NextResponse.json(
        { error: 'Missing required fields: url and method' },
        { status: 400 }
      );
    }

    // Build request config
    const config: any = {
      method,
      url,
      headers: { ...headers },
    };

    // Inject credential based on location
    if (credentialInjection) {
      const { location, key, value } = credentialInjection;

      if (location === 'header') {
        config.headers[key] = value;
      } else if (location === 'query') {
        const urlObj = new URL(url);
        urlObj.searchParams.set(key, value);
        config.url = urlObj.toString();
      } else if (location === 'body' && requestBody) {
        try {
          const bodyObj = JSON.parse(requestBody);
          bodyObj[key] = value;
          config.data = JSON.stringify(bodyObj);
        } catch {
          config.data = requestBody;
        }
      }
    } else if (requestBody) {
      config.data = requestBody;
    }

    // Execute request
    const { response, duration } = await safeRequest(config);

    // Redact secrets from response
    const redactedHeaders = redactObjectSecrets(response.headers);
    const redactedBody = redactObjectSecrets(response.data);

    return NextResponse.json({
      success: true,
      result: {
        httpStatus: response.status,
        statusText: response.statusText,
        headers: redactedHeaders,
        body: typeof redactedBody === 'string' ? redactedBody : JSON.stringify(redactedBody, null, 2),
        duration,
      },
    });
  } catch (error: any) {
    console.error('Custom test error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: error.message || 'Request failed',
        duration: error.duration,
      },
    });
  }
}
