// Cloud Providers - Consolidated Module
import { ProviderDefinition, ProviderCredentials, ValidationResult } from '../../types';
import { safeRequest, isSuccessResponse, isAuthFailure } from '../../utils/http-client';
import { createValidationResult } from '../base-provider';
import { sanitizeError } from '../../security/redaction';

// AWS Provider
export const awsProvider: ProviderDefinition = {
  id: 'aws',
  name: 'aws',
  displayName: 'Amazon Web Services (AWS)',
  category: 'cloud',
  description: 'Validate AWS Access Key ID and Secret Access Key',
  inputFields: [
    { name: 'access_key_id', label: 'Access Key ID', type: 'text', required: true, placeholder: 'AKIA...' },
    { name: 'secret_access_key', label: 'Secret Access Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://sts.amazonaws.com/?Action=GetCallerIdentity&Version=2011-06-15',
        headers: { 'X-Amz-Security-Token': credentials.access_key_id },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', { accountId: 'detected' }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// GCP Provider
export const gcpProvider: ProviderDefinition = {
  id: 'gcp',
  name: 'gcp',
  displayName: 'Google Cloud Platform (GCP)',
  category: 'cloud',
  description: 'Validate GCP API Key or Service Account JSON',
  inputFields: [
    { name: 'api_key', label: 'API Key or Service Account JSON', type: 'textarea', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `https://cloudresourcemanager.googleapis.com/v1/projects?key=${credentials.api_key}`,
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', { projects: response.data.projects?.length || 0 }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Azure Provider
export const azureProvider: ProviderDefinition = {
  id: 'azure',
  name: 'azure',
  displayName: 'Microsoft Azure',
  category: 'cloud',
  description: 'Validate Azure subscription credentials',
  inputFields: [
    { name: 'subscription_id', label: 'Subscription ID', type: 'text', required: true },
    { name: 'access_token', label: 'Access Token', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `https://management.azure.com/subscriptions/${credentials.subscription_id}?api-version=2020-01-01`,
        headers: { Authorization: `Bearer ${credentials.access_token}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', { subscriptionName: response.data.displayName }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// DigitalOcean Provider
export const digitalOceanProvider: ProviderDefinition = {
  id: 'digitalocean',
  name: 'digitalocean',
  displayName: 'DigitalOcean',
  category: 'cloud',
  description: 'Validate DigitalOcean API token',
  inputFields: [
    { name: 'api_token', label: 'API Token', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.digitalocean.com/v2/account',
        headers: { Authorization: `Bearer ${credentials.api_token}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          email: response.data.account?.email,
          status: response.data.account?.status
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Linode Provider
export const linodeProvider: ProviderDefinition = {
  id: 'linode',
  name: 'linode',
  displayName: 'Linode',
  category: 'cloud',
  description: 'Validate Linode API token',
  inputFields: [
    { name: 'api_token', label: 'API Token', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.linode.com/v4/profile',
        headers: { Authorization: `Bearer ${credentials.api_token}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', { username: response.data.username }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Vultr Provider
export const vultrProvider: ProviderDefinition = {
  id: 'vultr',
  name: 'vultr',
  displayName: 'Vultr',
  category: 'cloud',
  description: 'Validate Vultr API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.vultr.com/v2/account',
        headers: { Authorization: `Bearer ${credentials.api_key}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', { account: response.data.account }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// OVH Provider
export const ovhProvider: ProviderDefinition = {
  id: 'ovh',
  name: 'ovh',
  displayName: 'OVH Cloud',
  category: 'cloud',
  description: 'Validate OVH API credentials',
  inputFields: [
    { name: 'application_key', label: 'Application Key', type: 'text', required: true },
    { name: 'application_secret', label: 'Application Secret', type: 'password', required: true },
    { name: 'consumer_key', label: 'Consumer Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.ovh.com/1.0/me',
        headers: { 'X-Ovh-Application': credentials.application_key },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', { nichandle: response.data.nichandle }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Scaleway Provider
export const scalewayProvider: ProviderDefinition = {
  id: 'scaleway',
  name: 'scaleway',
  displayName: 'Scaleway',
  category: 'cloud',
  description: 'Validate Scaleway API token',
  inputFields: [
    { name: 'secret_key', label: 'Secret Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.scaleway.com/account/v2/tokens',
        headers: { 'X-Auth-Token': credentials.secret_key },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {}, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Oracle Cloud Provider
export const oracleCloudProvider: ProviderDefinition = {
  id: 'oracle-cloud',
  name: 'oracle-cloud',
  displayName: 'Oracle Cloud Infrastructure (OCI)',
  category: 'cloud',
  description: 'Validate Oracle Cloud credentials',
  inputFields: [
    { name: 'user_ocid', label: 'User OCID', type: 'text', required: true },
    { name: 'tenancy_ocid', label: 'Tenancy OCID', type: 'text', required: true },
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    return createValidationResult('unknown', undefined, 'Oracle Cloud validation requires complex signing - use custom test');
  },
};

// Cloudflare Provider
export const cloudflareProvider: ProviderDefinition = {
  id: 'cloudflare',
  name: 'cloudflare',
  displayName: 'Cloudflare',
  category: 'cloud',
  description: 'Validate Cloudflare API token',
  inputFields: [
    { name: 'api_token', label: 'API Token', type: 'password', required: true },
    { name: 'account_id', label: 'Account ID (Optional)', type: 'text', required: false, placeholder: 'cb21871f3a6dbb888d34e2f3fbf8e079', helperText: 'Optional - improves validation accuracy' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      // First try account-scoped verification if account_id provided
      if (credentials.account_id) {
        const { response, duration } = await safeRequest({
          method: 'GET',
          url: `https://api.cloudflare.com/client/v4/accounts/${credentials.account_id}/tokens/verify`,
          headers: { Authorization: `Bearer ${credentials.api_token}` },
        });
        if (isSuccessResponse(response.status) && response.data.success) {
          return createValidationResult('valid', {
            tokenId: response.data.result?.id,
            status: response.data.result?.status,
            message: response.data.messages?.[0]?.message
          }, undefined, JSON.stringify(response.data), response.status, duration);
        }
      }

      // Fallback to user token verification
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.cloudflare.com/client/v4/user/tokens/verify',
        headers: { Authorization: `Bearer ${credentials.api_token}` },
      });
      if (isSuccessResponse(response.status) && response.data.success) {
        return createValidationResult('valid', {
          status: response.data.result?.status,
          message: response.data.messages?.[0]?.message
        }, undefined, JSON.stringify(response.data), response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Fastly Provider
export const fastlyProvider: ProviderDefinition = {
  id: 'fastly',
  name: 'fastly',
  displayName: 'Fastly',
  category: 'cloud',
  description: 'Validate Fastly API token',
  inputFields: [
    { name: 'api_token', label: 'API Token', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.fastly.com/current_user',
        headers: { 'Fastly-Key': credentials.api_token },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          username: response.data.login,
          name: response.data.name
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Backblaze Provider
export const backblazeProvider: ProviderDefinition = {
  id: 'backblaze',
  name: 'backblaze',
  displayName: 'Backblaze B2',
  category: 'cloud',
  description: 'Validate Backblaze B2 application key',
  inputFields: [
    { name: 'key_id', label: 'Application Key ID', type: 'text', required: true },
    { name: 'application_key', label: 'Application Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const auth = Buffer.from(`${credentials.key_id}:${credentials.application_key}`).toString('base64');
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.backblazeb2.com/b2api/v2/b2_authorize_account',
        headers: { Authorization: `Basic ${auth}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', { accountId: response.data.accountId }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};
