// Miscellaneous Providers
import { ProviderDefinition, ProviderCredentials, ValidationResult } from '../../types';
import { safeRequest, isSuccessResponse } from '../../utils/http-client';
import { createValidationResult } from '../base-provider';
import { sanitizeError } from '../../security/redaction';

// Firebase Provider
export const firebaseProvider: ProviderDefinition = {
  id: 'firebase',
  name: 'firebase',
  displayName: 'Firebase',
  category: 'other',
  description: 'Validate Firebase service account',
  inputFields: [
    { name: 'service_account_json', label: 'Service Account JSON', type: 'textarea', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const serviceAccount = JSON.parse(credentials.service_account_json || '{}');
      if (!serviceAccount.project_id || !serviceAccount.private_key_id) {
        return createValidationResult('invalid', undefined, 'Invalid service account JSON', undefined);
      }
      return createValidationResult('valid', {
        projectId: serviceAccount.project_id,
        email: serviceAccount.client_email
      }, undefined, undefined);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Algolia Provider
export const algoliaProvider: ProviderDefinition = {
  id: 'algolia',
  name: 'algolia',
  displayName: 'Algolia',
  category: 'other',
  description: 'Validate Algolia API credentials',
  inputFields: [
    { name: 'app_id', label: 'Application ID', type: 'text', required: true },
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `https://${credentials.app_id}-1.algolianet.com/1/indexes`,
        headers: { 'X-Algolia-API-Key': credentials.api_key, 'X-Algolia-Application-Id': credentials.app_id },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          indexCount: response.data.items?.length || 0
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Bitly Provider
export const bitlyProvider: ProviderDefinition = {
  id: 'bitly',
  name: 'bitly',
  displayName: 'Bitly',
  category: 'other',
  description: 'Validate Bitly API token',
  inputFields: [
    { name: 'access_token', label: 'Access Token', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api-ssl.bitly.com/v4/user',
        headers: { Authorization: `Bearer ${credentials.access_token}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          login: response.data.login,
          name: response.data.name
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Twilio Verify Provider
export const twilioVerifyProvider: ProviderDefinition = {
  id: 'twilio-verify',
  name: 'twilio-verify',
  displayName: 'Twilio Verify',
  category: 'other',
  description: 'Validate Twilio Verify credentials',
  inputFields: [
    { name: 'account_sid', label: 'Account SID', type: 'text', required: true },
    { name: 'auth_token', label: 'Auth Token', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const auth = Buffer.from(`${credentials.account_sid}:${credentials.auth_token}`).toString('base64');
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `https://verify.twilio.com/v2/Services`,
        headers: { Authorization: `Basic ${auth}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          services: response.data.services?.length || 0
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Zoom Provider
export const zoomProvider: ProviderDefinition = {
  id: 'zoom',
  name: 'zoom',
  displayName: 'Zoom',
  category: 'other',
  description: 'Validate Zoom API credentials',
  inputFields: [
    { name: 'client_id', label: 'Client ID', type: 'text', required: true },
    { name: 'client_secret', label: 'Client Secret', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const auth = Buffer.from(`${credentials.client_id}:${credentials.client_secret}`).toString('base64');
      const { response, duration } = await safeRequest({
        method: 'POST',
        url: 'https://zoom.us/oauth/token?grant_type=client_credentials',
        headers: { Authorization: `Basic ${auth}` },
      });
      if (isSuccessResponse(response.status) && response.data.access_token) {
        return createValidationResult('valid', {}, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Stripe Webhooks Provider
export const stripeWebhooksProvider: ProviderDefinition = {
  id: 'stripe-webhooks',
  name: 'stripe-webhooks',
  displayName: 'Stripe Webhooks',
  category: 'other',
  description: 'Validate Stripe webhook endpoint',
  inputFields: [
    { name: 'webhook_secret', label: 'Webhook Secret', type: 'password', required: true, placeholder: 'whsec_...' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      // Webhook secrets have a known format, validate format
      if (credentials.webhook_secret?.startsWith('whsec_')) {
        return createValidationResult('valid', {}, undefined, undefined);
      }
      return createValidationResult('invalid', undefined, 'Invalid webhook secret format', undefined);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// SendinBlue Provider (alternate name for Brevo)
export const sendinblueProvider: ProviderDefinition = {
  id: 'sendinblue',
  name: 'sendinblue',
  displayName: 'Sendinblue (Brevo)',
  category: 'other',
  description: 'Validate Sendinblue API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.brevo.com/v3/account',
        headers: { 'api-key': credentials.api_key },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          accountEmail: response.data.email
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Auth.js (NextAuth) Provider
export const authjsProvider: ProviderDefinition = {
  id: 'authjs',
  name: 'authjs',
  displayName: 'Auth.js (NextAuth)',
  category: 'other',
  description: 'Validate Auth.js secret',
  inputFields: [
    { name: 'secret', label: 'NEXTAUTH_SECRET', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      // NextAuth secret should be at least 32 characters
      if (credentials.secret && credentials.secret.length >= 32) {
        return createValidationResult('valid', {}, undefined, undefined);
      }
      return createValidationResult('invalid', undefined, 'Invalid secret - should be at least 32 characters', undefined);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// JWT Secret Provider
export const jwtSecretProvider: ProviderDefinition = {
  id: 'jwt-secret',
  name: 'jwt-secret',
  displayName: 'JWT Secret',
  category: 'other',
  description: 'Validate JWT secret format',
  inputFields: [
    { name: 'secret', label: 'JWT Secret', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      if (credentials.secret && credentials.secret.length > 0) {
        return createValidationResult('valid', {
          secretLength: credentials.secret.length
        }, undefined, undefined);
      }
      return createValidationResult('invalid', undefined, 'Empty secret', undefined);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// API Key (Generic) Provider
export const genericApiKeyProvider: ProviderDefinition = {
  id: 'generic-api-key',
  name: 'generic-api-key',
  displayName: 'Generic API Key',
  category: 'other',
  description: 'Validate generic API key format',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
    { name: 'test_url', label: 'Test URL (optional)', type: 'url', required: false },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      if (!credentials.test_url) {
        // Just validate the key exists and has content
        if (credentials.api_key && credentials.api_key.length > 0) {
          return createValidationResult('valid', {
            keyLength: credentials.api_key.length
          }, undefined, undefined);
        }
        return createValidationResult('invalid', undefined, 'Empty API key', undefined);
      }

      // If test URL provided, try to use the API key
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: credentials.test_url,
        headers: { Authorization: `Bearer ${credentials.api_key}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {}, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// OAuth Token Provider
export const oauthTokenProvider: ProviderDefinition = {
  id: 'oauth-token',
  name: 'oauth-token',
  displayName: 'OAuth Token',
  category: 'other',
  description: 'Validate OAuth access token',
  inputFields: [
    { name: 'access_token', label: 'Access Token', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      if (credentials.access_token && credentials.access_token.length > 0) {
        return createValidationResult('valid', {
          tokenLength: credentials.access_token.length
        }, undefined, undefined);
      }
      return createValidationResult('invalid', undefined, 'Empty access token', undefined);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Doppler Secrets Provider
export const dopplerSecretsProvider: ProviderDefinition = {
  id: 'doppler-secrets',
  name: 'doppler-secrets',
  displayName: 'Doppler Secrets',
  category: 'other',
  description: 'Validate Doppler environment token',
  inputFields: [
    { name: 'doppler_token', label: 'DOPPLER_TOKEN', type: 'password', required: true, placeholder: 'dp.nodejs...' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      if (credentials.doppler_token?.startsWith('dp.')) {
        return createValidationResult('valid', {}, undefined, undefined);
      }
      return createValidationResult('invalid', undefined, 'Invalid Doppler token format', undefined);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// CloudFlare Workers KV Provider
export const cloudflareworkersProvider: ProviderDefinition = {
  id: 'cloudflare-workers',
  name: 'cloudflare-workers',
  displayName: 'Cloudflare Workers',
  category: 'other',
  description: 'Validate Cloudflare Workers API token',
  inputFields: [
    { name: 'api_token', label: 'API Token', type: 'password', required: true },
    { name: 'account_id', label: 'Account ID', type: 'text', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `https://api.cloudflare.com/client/v4/accounts/${credentials.account_id}`,
        headers: { Authorization: `Bearer ${credentials.api_token}` },
      });
      if (isSuccessResponse(response.status) && response.data.success) {
        return createValidationResult('valid', {
          accountName: response.data.result?.name
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Vercel PostgreSQL Provider
export const vercelPostgresProvider: ProviderDefinition = {
  id: 'vercel-postgres',
  name: 'vercel-postgres',
  displayName: 'Vercel Postgres',
  category: 'other',
  description: 'Validate Vercel Postgres connection string',
  inputFields: [
    { name: 'connection_string', label: 'Connection String', type: 'password', required: true, placeholder: 'postgres://...' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      if (credentials.connection_string?.startsWith('postgres://') || credentials.connection_string?.startsWith('postgresql://')) {
        return createValidationResult('valid', {}, undefined, undefined);
      }
      return createValidationResult('invalid', undefined, 'Invalid connection string format', undefined);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Secrets Manager (AWS) Provider
export const awsSecretsManager: ProviderDefinition = {
  id: 'aws-secrets-manager',
  name: 'aws-secrets-manager',
  displayName: 'AWS Secrets Manager',
  category: 'other',
  description: 'Validate AWS Secrets Manager credentials',
  inputFields: [
    { name: 'access_key_id', label: 'Access Key ID', type: 'text', required: true },
    { name: 'secret_access_key', label: 'Secret Access Key', type: 'password', required: true },
    { name: 'region', label: 'Region', type: 'text', required: false, placeholder: 'us-east-1' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    return createValidationResult('unknown', undefined, 'AWS Secrets Manager validation requires AWS signature - use custom test');
  },
};

// Cloudinary Provider
export const cloudinaryProvider: ProviderDefinition = {
  id: 'cloudinary',
  name: 'cloudinary',
  displayName: 'Cloudinary',
  category: 'other',
  description: 'Validate Cloudinary API credentials',
  inputFields: [
    { name: 'cloud_name', label: 'Cloud Name', type: 'text', required: true },
    { name: 'api_key', label: 'API Key', type: 'text', required: true },
    { name: 'api_secret', label: 'API Secret', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const auth = Buffer.from(`${credentials.api_key}:${credentials.api_secret}`).toString('base64');
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.cloudinary.com/v1_1/cloudinary_default/usage',
        headers: { Authorization: `Basic ${auth}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {}, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// ImageKit Provider
export const imagekitProvider: ProviderDefinition = {
  id: 'imagekit',
  name: 'imagekit',
  displayName: 'ImageKit',
  category: 'other',
  description: 'Validate ImageKit API credentials',
  inputFields: [
    { name: 'private_key', label: 'Private Key', type: 'password', required: true },
    { name: 'public_key', label: 'Public Key', type: 'text', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const auth = Buffer.from(`${credentials.private_key}:`).toString('base64');
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.imagekit.io/v2/files',
        headers: { Authorization: `Basic ${auth}` },
      });
      if (isSuccessResponse(response.status) || response.status === 401) {
        if (response.status === 401) {
          return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
        }
        return createValidationResult('valid', {}, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};
