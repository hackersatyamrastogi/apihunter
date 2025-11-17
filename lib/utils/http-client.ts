import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpProxyAgent } from 'http-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';

/**
 * Create an HTTP client with optional proxy support
 */
export function createHttpClient(): AxiosInstance {
  const config: AxiosRequestConfig = {
    timeout: 30000,
    maxRedirects: 5,
    validateStatus: () => true, // Don't throw on any status
  };

  // Configure proxy if environment variables are set
  const httpProxy = process.env.HTTP_PROXY;
  const httpsProxy = process.env.HTTPS_PROXY;

  if (httpProxy || httpsProxy) {
    config.proxy = false; // Disable axios default proxy handling
    config.httpAgent = httpProxy ? new HttpProxyAgent(httpProxy) : undefined;
    config.httpsAgent = httpsProxy ? new HttpsProxyAgent(httpsProxy) : undefined;
  }

  return axios.create(config);
}

/**
 * Safe HTTP request wrapper that measures duration
 */
export async function safeRequest(
  config: AxiosRequestConfig
): Promise<{
  response: AxiosResponse;
  duration: number;
}> {
  const client = createHttpClient();
  const startTime = Date.now();

  try {
    const response = await client.request(config);
    const duration = Date.now() - startTime;

    return { response, duration };
  } catch (error) {
    const duration = Date.now() - startTime;

    // Return error response with duration
    throw {
      error,
      duration,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if response indicates success
 */
export function isSuccessResponse(status: number): boolean {
  return status >= 200 && status < 300;
}

/**
 * Check if response indicates authentication failure
 */
export function isAuthFailure(status: number): boolean {
  return status === 401 || status === 403;
}

/**
 * Extract meaningful error message from response
 */
export function extractErrorMessage(response: AxiosResponse): string {
  if (response.data) {
    if (typeof response.data === 'string') {
      return response.data.substring(0, 200);
    }

    if (typeof response.data === 'object') {
      const data = response.data;
      return (
        data.error?.message ||
        data.error ||
        data.message ||
        data.errorMessage ||
        data.error_description ||
        JSON.stringify(data).substring(0, 200)
      );
    }
  }

  return `HTTP ${response.status}: ${response.statusText}`;
}
