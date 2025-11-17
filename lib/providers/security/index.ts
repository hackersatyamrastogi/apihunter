// Security & Compliance Providers
import { ProviderDefinition, ProviderCredentials, ValidationResult } from '../../types';
import { safeRequest, isSuccessResponse } from '../../utils/http-client';
import { createValidationResult } from '../base-provider';
import { sanitizeError } from '../../security/redaction';

// Snyk Provider
export const snykProvider: ProviderDefinition = {
  id: 'snyk',
  name: 'snyk',
  displayName: 'Snyk',
  category: 'security',
  description: 'Validate Snyk API token',
  inputFields: [
    { name: 'api_token', label: 'API Token', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.snyk.io/v1/user/me',
        headers: { Authorization: `token ${credentials.api_token}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          userId: response.data.id,
          username: response.data.username,
          email: response.data.email
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// SonarCloud Provider
export const sonarcloudsProvider: ProviderDefinition = {
  id: 'sonarcloud',
  name: 'sonarcloud',
  displayName: 'SonarCloud',
  category: 'security',
  description: 'Validate SonarCloud token',
  inputFields: [
    { name: 'token', label: 'Authentication Token', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const auth = Buffer.from(`${credentials.token}:`).toString('base64');
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://sonarcloud.io/api/user_token/search',
        headers: { Authorization: `Basic ${auth}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          tokens: response.data.userTokens?.length || 0
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Shodan Provider
export const shodanProvider: ProviderDefinition = {
  id: 'shodan',
  name: 'shodan',
  displayName: 'Shodan',
  category: 'security',
  description: 'Validate Shodan API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `https://api.shodan.io/account/profile?key=${credentials.api_key}`,
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          accountEmail: response.data.email,
          credits: response.data.credits
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// CrowdStrike Provider
export const crowdstrikeProvider: ProviderDefinition = {
  id: 'crowdstrike',
  name: 'crowdstrike',
  displayName: 'CrowdStrike',
  category: 'security',
  description: 'Validate CrowdStrike API credentials',
  inputFields: [
    { name: 'client_id', label: 'Client ID', type: 'text', required: true },
    { name: 'client_secret', label: 'Client Secret', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const auth = Buffer.from(`${credentials.client_id}:${credentials.client_secret}`).toString('base64');
      const { response, duration } = await safeRequest({
        method: 'POST',
        url: 'https://api.crowdstrike.com/oauth2/oauth2/token',
        headers: { Authorization: `Basic ${auth}` },
        data: { grant_type: 'client_credentials' },
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

// Wiz Provider
export const wizProvider: ProviderDefinition = {
  id: 'wiz',
  name: 'wiz',
  displayName: 'Wiz',
  category: 'security',
  description: 'Validate Wiz API token',
  inputFields: [
    { name: 'api_token', label: 'API Token', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.wiz.io/graphql',
        headers: { Authorization: `Bearer ${credentials.api_token}` },
      });
      // Any response without 401 is valid
      if (response.status !== 401) {
        return createValidationResult('valid', {}, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Lacework Provider
export const laceworkProvider: ProviderDefinition = {
  id: 'lacework',
  name: 'lacework',
  displayName: 'Lacework',
  category: 'security',
  description: 'Validate Lacework API credentials',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
    { name: 'api_secret', label: 'API Secret', type: 'password', required: true },
    { name: 'account', label: 'Account', type: 'text', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    return createValidationResult('unknown', undefined, 'Lacework validation requires HMAC signing - use custom test');
  },
};

// Qualys Provider
export const qualysProvider: ProviderDefinition = {
  id: 'qualys',
  name: 'qualys',
  displayName: 'Qualys',
  category: 'security',
  description: 'Validate Qualys API credentials',
  inputFields: [
    { name: 'api_url', label: 'API URL', type: 'url', required: true, placeholder: 'https://qualysapi.qualys.com' },
    { name: 'username', label: 'Username', type: 'text', required: true },
    { name: 'password', label: 'Password', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const auth = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `${credentials.api_url}/api/2.0/fo/user/`,
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

// Rapid7 InsightVM Provider
export const rapid7Provider: ProviderDefinition = {
  id: 'rapid7',
  name: 'rapid7',
  displayName: 'Rapid7 InsightVM',
  category: 'security',
  description: 'Validate Rapid7 API credentials',
  inputFields: [
    { name: 'api_url', label: 'API URL', type: 'url', required: true, placeholder: 'https://insightvm.example.com' },
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `${credentials.api_url}/api/3/index`,
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

// Tenable Nessus Provider
export const tenableProvider: ProviderDefinition = {
  id: 'tenable',
  name: 'tenable',
  displayName: 'Tenable Nessus',
  category: 'security',
  description: 'Validate Tenable/Nessus API credentials',
  inputFields: [
    { name: 'api_url', label: 'API URL', type: 'url', required: true, placeholder: 'https://nessus.example.com:8834' },
    { name: 'access_key', label: 'Access Key', type: 'text', required: true },
    { name: 'secret_key', label: 'Secret Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `${credentials.api_url}/api/scans`,
        headers: {
          'X-ApiKeys': `accessKey=${credentials.access_key};secretKey=${credentials.secret_key}`,
        },
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

// HashiCorp Vault Provider
export const vaultProvider: ProviderDefinition = {
  id: 'hashicorp-vault',
  name: 'hashicorp-vault',
  displayName: 'HashiCorp Vault',
  category: 'security',
  description: 'Validate HashiCorp Vault token',
  inputFields: [
    { name: 'vault_addr', label: 'Vault Address', type: 'url', required: true, placeholder: 'https://vault.example.com:8200' },
    { name: 'vault_token', label: 'Vault Token', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `${credentials.vault_addr}/v1/auth/token/lookup-self`,
        headers: { 'X-Vault-Token': credentials.vault_token },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          policies: response.data.auth?.policies || []
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Doppler Provider
export const dopplerProvider: ProviderDefinition = {
  id: 'doppler',
  name: 'doppler',
  displayName: 'Doppler',
  category: 'security',
  description: 'Validate Doppler API token',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.doppler.com/v3/auth',
        headers: { Authorization: `Bearer ${credentials.api_key}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          accessId: response.data.access?.id
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// 1Password Provider
export const onepasswordProvider: ProviderDefinition = {
  id: '1password',
  name: '1password',
  displayName: '1Password',
  category: 'security',
  description: 'Validate 1Password API token',
  inputFields: [
    { name: 'api_token', label: 'API Token', type: 'password', required: true },
    { name: 'vault_uuid', label: 'Vault UUID', type: 'text', required: false },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.1password.com/v1/accounts/me',
        headers: { Authorization: `Bearer ${credentials.api_token}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          accountId: response.data.id,
          accountName: response.data.name
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Gitguardian Provider
export const gitguardianProvider: ProviderDefinition = {
  id: 'gitguardian',
  name: 'gitguardian',
  displayName: 'GitGuardian',
  category: 'security',
  description: 'Validate GitGuardian API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.gitguardian.com/v1/audit-logs',
        headers: { Authorization: `Token ${credentials.api_key}` },
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

// Aqua Security Provider
export const aquaProvider: ProviderDefinition = {
  id: 'aqua-security',
  name: 'aqua-security',
  displayName: 'Aqua Security',
  category: 'security',
  description: 'Validate Aqua Security API token',
  inputFields: [
    { name: 'api_url', label: 'API URL', type: 'url', required: true },
    { name: 'username', label: 'Username', type: 'text', required: true },
    { name: 'password', label: 'Password', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const auth = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `${credentials.api_url}/api/v1/info`,
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
