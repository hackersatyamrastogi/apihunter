// Identity & Authentication Providers
import { ProviderDefinition, ProviderCredentials, ValidationResult } from '../../types';
import { safeRequest, isSuccessResponse } from '../../utils/http-client';
import { createValidationResult } from '../base-provider';
import { sanitizeError } from '../../security/redaction';

// Okta Provider
export const oktaProvider: ProviderDefinition = {
  id: 'okta',
  name: 'okta',
  displayName: 'Okta',
  category: 'identity-auth',
  description: 'Validate Okta API token',
  inputFields: [
    { name: 'base_url', label: 'Base URL', type: 'url', required: true, placeholder: 'https://dev-1234567.okta.com' },
    { name: 'api_token', label: 'API Token', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `${credentials.base_url}/api/v1/user/me`,
        headers: { Authorization: `Bearer ${credentials.api_token}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          userId: response.data.id,
          accountEmail: response.data.profile?.email,
          username: response.data.profile?.login
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Auth0 Provider
export const auth0Provider: ProviderDefinition = {
  id: 'auth0',
  name: 'auth0',
  displayName: 'Auth0',
  category: 'identity-auth',
  description: 'Validate Auth0 API credentials',
  inputFields: [
    { name: 'domain', label: 'Domain', type: 'text', required: true, placeholder: 'example.auth0.com' },
    { name: 'client_id', label: 'Client ID', type: 'text', required: true },
    { name: 'client_secret', label: 'Client Secret', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'POST',
        url: `https://${credentials.domain}/oauth/token`,
        data: {
          client_id: credentials.client_id,
          client_secret: credentials.client_secret,
          audience: `https://${credentials.domain}/api/v2/`,
          grant_type: 'client_credentials',
        },
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

// Clerk Provider
export const clerkProvider: ProviderDefinition = {
  id: 'clerk',
  name: 'clerk',
  displayName: 'Clerk',
  category: 'identity-auth',
  description: 'Validate Clerk API key',
  inputFields: [
    { name: 'secret_key', label: 'Secret Key', type: 'password', required: true, placeholder: 'sk_live_...' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.clerk.com/v1/me',
        headers: { Authorization: `Bearer ${credentials.secret_key}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          organizationId: response.data.organization_id
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Azure AD Provider
export const azureAdProvider: ProviderDefinition = {
  id: 'azure-ad',
  name: 'azure-ad',
  displayName: 'Azure AD / Microsoft Entra',
  category: 'identity-auth',
  description: 'Validate Azure AD credentials',
  inputFields: [
    { name: 'tenant_id', label: 'Tenant ID', type: 'text', required: true },
    { name: 'client_id', label: 'Client ID', type: 'text', required: true },
    { name: 'client_secret', label: 'Client Secret', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'POST',
        url: `https://login.microsoftonline.com/${credentials.tenant_id}/oauth2/v2.0/token`,
        data: {
          client_id: credentials.client_id,
          client_secret: credentials.client_secret,
          scope: 'https://graph.microsoft.com/.default',
          grant_type: 'client_credentials',
        },
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

// Google Workspace Provider
export const googleWorkspaceProvider: ProviderDefinition = {
  id: 'google-workspace',
  name: 'google-workspace',
  displayName: 'Google Workspace',
  category: 'identity-auth',
  description: 'Validate Google Workspace service account',
  inputFields: [
    { name: 'service_account_json', label: 'Service Account JSON', type: 'textarea', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const serviceAccount = JSON.parse(credentials.service_account_json || '{}');
      if (!serviceAccount.client_email) {
        return createValidationResult('invalid', undefined, 'Invalid service account JSON', undefined);
      }
      return createValidationResult('valid', {
        email: serviceAccount.client_email,
        projectId: serviceAccount.project_id
      }, undefined, undefined);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Firebase Authentication Provider
export const firebaseAuthProvider: ProviderDefinition = {
  id: 'firebase-auth',
  name: 'firebase-auth',
  displayName: 'Firebase Authentication',
  category: 'identity-auth',
  description: 'Validate Firebase credentials',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'POST',
        url: `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${credentials.api_key}`,
        data: { idToken: 'test' },
      });
      // Any response (including error) means the API key is accessible
      if (response.status >= 200 && response.status < 500) {
        return createValidationResult('valid', {}, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Keycloak Provider
export const keycloakProvider: ProviderDefinition = {
  id: 'keycloak',
  name: 'keycloak',
  displayName: 'Keycloak',
  category: 'identity-auth',
  description: 'Validate Keycloak admin credentials',
  inputFields: [
    { name: 'base_url', label: 'Base URL', type: 'url', required: true, placeholder: 'https://keycloak.example.com' },
    { name: 'realm', label: 'Realm', type: 'text', required: true },
    { name: 'client_id', label: 'Client ID', type: 'text', required: true },
    { name: 'client_secret', label: 'Client Secret', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'POST',
        url: `${credentials.base_url}/realms/${credentials.realm}/protocol/openid-connect/token`,
        data: {
          grant_type: 'client_credentials',
          client_id: credentials.client_id,
          client_secret: credentials.client_secret,
        },
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

// JumpCloud Provider
export const jumpcloadProvider: ProviderDefinition = {
  id: 'jumpcloud',
  name: 'jumpcloud',
  displayName: 'JumpCloud',
  category: 'identity-auth',
  description: 'Validate JumpCloud API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://console.jumpcloud.com/api/systemusers',
        headers: { 'x-api-key': credentials.api_key },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          userCount: response.data.totalCount
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Ping Identity Provider
export const pingIdentityProvider: ProviderDefinition = {
  id: 'ping-identity',
  name: 'ping-identity',
  displayName: 'Ping Identity',
  category: 'identity-auth',
  description: 'Validate Ping Identity credentials',
  inputFields: [
    { name: 'base_url', label: 'Base URL', type: 'url', required: true },
    { name: 'client_id', label: 'Client ID', type: 'text', required: true },
    { name: 'client_secret', label: 'Client Secret', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'POST',
        url: `${credentials.base_url}/oauth/token`,
        data: {
          grant_type: 'client_credentials',
          client_id: credentials.client_id,
          client_secret: credentials.client_secret,
        },
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

// FusionAuth Provider
export const fusionauthProvider: ProviderDefinition = {
  id: 'fusionauth',
  name: 'fusionauth',
  displayName: 'FusionAuth',
  category: 'identity-auth',
  description: 'Validate FusionAuth API key',
  inputFields: [
    { name: 'base_url', label: 'Base URL', type: 'url', required: true, placeholder: 'https://fusionauth.example.com' },
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `${credentials.base_url}/api/system/configuration`,
        headers: { Authorization: credentials.api_key },
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

// ActiveDirectory Provider
export const activeDirectoryProvider: ProviderDefinition = {
  id: 'active-directory',
  name: 'active-directory',
  displayName: 'Active Directory',
  category: 'identity-auth',
  description: 'Validate Active Directory credentials',
  inputFields: [
    { name: 'domain', label: 'Domain', type: 'text', required: true, placeholder: 'example.com' },
    { name: 'username', label: 'Username', type: 'text', required: true },
    { name: 'password', label: 'Password', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    return createValidationResult('unknown', undefined, 'Active Directory validation requires LDAP connection - use custom test');
  },
};
