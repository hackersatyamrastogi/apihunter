import { ProviderDefinition, ProviderCredentials, ValidationResult, ValidationMetadata } from '../types';
import { safeRequest, isSuccessResponse, isAuthFailure, extractErrorMessage } from '../utils/http-client';
import { sanitizeError } from '../security/redaction';
import { AxiosRequestConfig } from 'axios';

/**
 * Helper to create a standardized provider validation result
 */
export function createValidationResult(
  status: 'valid' | 'invalid' | 'unknown' | 'error',
  metadata?: ValidationMetadata,
  errorMessage?: string,
  rawResponse?: string,
  httpStatus?: number,
  requestDuration?: number
): ValidationResult {
  // Assess risk level based on metadata
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  const riskHints: string[] = [];

  if (metadata) {
    const scopes = metadata.scopes || metadata.permissions || [];
    const roles = metadata.roles || [];

    // Check for admin/elevated permissions
    if (
      scopes.some((s: string) => s.toLowerCase().includes('admin') || s.toLowerCase().includes('write')) ||
      roles.some((r: string) => r.toLowerCase().includes('admin') || r.toLowerCase().includes('owner'))
    ) {
      riskLevel = 'high';
      riskHints.push('Key has elevated permissions (admin/write access)');
    }

    // Check for production environment
    if (metadata.environment && metadata.environment.toLowerCase().includes('prod')) {
      if (riskLevel === 'high') {
        riskLevel = 'critical';
      } else {
        riskLevel = 'medium';
      }
      riskHints.push('Key appears to be for production environment');
    }
  }

  return {
    status,
    metadata,
    errorMessage,
    rawResponse: rawResponse?.substring(0, 500),
    httpStatus,
    requestDuration,
    riskLevel,
    riskHints: riskHints.length > 0 ? riskHints : undefined,
  };
}

/**
 * Execute a safe API request for provider validation
 */
export async function executeProviderRequest(
  config: AxiosRequestConfig
): Promise<ValidationResult> {
  try {
    const { response, duration } = await safeRequest(config);

    if (isSuccessResponse(response.status)) {
      return createValidationResult(
        'valid',
        undefined,
        undefined,
        JSON.stringify(response.data),
        response.status,
        duration
      );
    } else if (isAuthFailure(response.status)) {
      return createValidationResult(
        'invalid',
        undefined,
        extractErrorMessage(response),
        JSON.stringify(response.data).substring(0, 500),
        response.status,
        duration
      );
    } else {
      return createValidationResult(
        'unknown',
        undefined,
        extractErrorMessage(response),
        JSON.stringify(response.data).substring(0, 500),
        response.status,
        duration
      );
    }
  } catch (error: unknown) {
    return createValidationResult(
      'error',
      undefined,
      sanitizeError(error),
      undefined,
      undefined,
      (error as { duration?: number }).duration
    );
  }
}
