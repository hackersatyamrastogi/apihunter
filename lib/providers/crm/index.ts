// CRM & Marketing Providers
import { ProviderDefinition, ProviderCredentials, ValidationResult } from '../../types';
import { safeRequest, isSuccessResponse } from '../../utils/http-client';
import { createValidationResult } from '../base-provider';
import { sanitizeError } from '../../security/redaction';

// HubSpot Provider
export const hubspotProvider: ProviderDefinition = {
  id: 'hubspot',
  name: 'hubspot',
  displayName: 'HubSpot',
  category: 'crm-marketing',
  description: 'Validate HubSpot API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true, placeholder: 'pat-...' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.hubapi.com/crm/v3/objects/contacts',
        headers: { Authorization: `Bearer ${credentials.api_key}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          contacts: response.data.paging?.total || 0
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Salesforce Provider
export const salesforceProvider: ProviderDefinition = {
  id: 'salesforce',
  name: 'salesforce',
  displayName: 'Salesforce',
  category: 'crm-marketing',
  description: 'Validate Salesforce OAuth token',
  inputFields: [
    { name: 'instance_url', label: 'Instance URL', type: 'url', required: true, placeholder: 'https://example.salesforce.com' },
    { name: 'access_token', label: 'Access Token', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `${credentials.instance_url}/services/oauth2/userinfo`,
        headers: { Authorization: `Bearer ${credentials.access_token}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          userId: response.data.user_id,
          accountEmail: response.data.email,
          organizationId: response.data.organization_id
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Jira Provider
export const jiraProvider: ProviderDefinition = {
  id: 'jira',
  name: 'jira',
  displayName: 'Jira',
  category: 'crm-marketing',
  description: 'Validate Jira API token',
  inputFields: [
    { name: 'domain', label: 'Domain', type: 'text', required: true, placeholder: 'example.atlassian.net' },
    { name: 'email', label: 'Email', type: 'text', required: true },
    { name: 'api_token', label: 'API Token', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const auth = Buffer.from(`${credentials.email}:${credentials.api_token}`).toString('base64');
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `https://${credentials.domain}/rest/api/3/myself`,
        headers: { Authorization: `Basic ${auth}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          userId: response.data.accountId,
          accountEmail: response.data.emailAddress,
          username: response.data.name
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Notion Provider
export const notionProvider: ProviderDefinition = {
  id: 'notion',
  name: 'notion',
  displayName: 'Notion',
  category: 'crm-marketing',
  description: 'Validate Notion API key',
  inputFields: [
    { name: 'api_key', label: 'Internal Integration Token', type: 'password', required: true, placeholder: 'secret_...' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.notion.com/v1/users/me',
        headers: {
          Authorization: `Bearer ${credentials.api_key}`,
          'Notion-Version': '2022-06-28',
        },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          userId: response.data.id
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Zendesk Provider
export const zendeskProvider: ProviderDefinition = {
  id: 'zendesk',
  name: 'zendesk',
  displayName: 'Zendesk',
  category: 'crm-marketing',
  description: 'Validate Zendesk API credentials',
  inputFields: [
    { name: 'domain', label: 'Domain', type: 'text', required: true, placeholder: 'example.zendesk.com' },
    { name: 'email', label: 'Email', type: 'text', required: true },
    { name: 'api_token', label: 'API Token', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const auth = Buffer.from(`${credentials.email}/token:${credentials.api_token}`).toString('base64');
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `https://${credentials.domain}/api/v2/users/me`,
        headers: { Authorization: `Basic ${auth}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          userId: response.data.user.id,
          accountEmail: response.data.user.email
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Pipedrive Provider
export const pipedriveProvider: ProviderDefinition = {
  id: 'pipedrive',
  name: 'pipedrive',
  displayName: 'Pipedrive',
  category: 'crm-marketing',
  description: 'Validate Pipedrive API token',
  inputFields: [
    { name: 'api_token', label: 'API Token', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `https://api.pipedrive.com/v1/users/me?api_token=${credentials.api_token}`,
      });
      if (isSuccessResponse(response.status) && response.data.success) {
        return createValidationResult('valid', {
          userId: response.data.data.id,
          accountEmail: response.data.data.email
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Intercom Provider
export const intercomProvider: ProviderDefinition = {
  id: 'intercom',
  name: 'intercom',
  displayName: 'Intercom',
  category: 'crm-marketing',
  description: 'Validate Intercom API token',
  inputFields: [
    { name: 'access_token', label: 'Access Token', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.intercom.io/me',
        headers: { Authorization: `Bearer ${credentials.access_token}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          workspaceId: response.data.workspace_id
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Freshsales Provider
export const freshsalesProvider: ProviderDefinition = {
  id: 'freshsales',
  name: 'freshsales',
  displayName: 'Freshsales',
  category: 'crm-marketing',
  description: 'Validate Freshsales API key',
  inputFields: [
    { name: 'domain', label: 'Domain', type: 'url', required: true, placeholder: 'https://domain.freshsales.io' },
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `${credentials.domain}/api/users/me`,
        headers: { Authorization: `Token token=${credentials.api_key}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          userId: response.data.user.id,
          accountEmail: response.data.user.email
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Copper (formerly Prosperworks) Provider
export const copperProvider: ProviderDefinition = {
  id: 'copper',
  name: 'copper',
  displayName: 'Copper CRM',
  category: 'crm-marketing',
  description: 'Validate Copper API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.copper.com/developer_api/v1/account',
        headers: { 'X-PW-AccessToken': credentials.api_key, 'X-PW-Application': 'APIHunter' },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          accountName: response.data.name
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Nylas Provider
export const nylasProvider: ProviderDefinition = {
  id: 'nylas',
  name: 'nylas',
  displayName: 'Nylas',
  category: 'crm-marketing',
  description: 'Validate Nylas API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.nylas.com/applications',
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

// Apollo Provider
export const apolloProvider: ProviderDefinition = {
  id: 'apollo',
  name: 'apollo',
  displayName: 'Apollo.io',
  category: 'crm-marketing',
  description: 'Validate Apollo API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.apollo.io/v1/auth_user',
        headers: { Authorization: `Bearer ${credentials.api_key}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          email: response.data.email
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Klaviyo Provider
export const klaviyoProvider: ProviderDefinition = {
  id: 'klaviyo',
  name: 'klaviyo',
  displayName: 'Klaviyo',
  category: 'crm-marketing',
  description: 'Validate Klaviyo API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://a.klaviyo.com/api/v1/account',
        headers: { Authorization: `Klaviyo-API-Key ${credentials.api_key}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          accountId: response.data.account_id
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Segment Provider
export const segmentProvider: ProviderDefinition = {
  id: 'segment',
  name: 'segment',
  displayName: 'Segment',
  category: 'crm-marketing',
  description: 'Validate Segment API token',
  inputFields: [
    { name: 'api_token', label: 'API Token', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const auth = Buffer.from(`${credentials.api_token}:`).toString('base64');
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.segment.com/v1beta/workspaces/current',
        headers: { Authorization: `Basic ${auth}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          workspaceName: response.data.name
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Outreach Provider
export const outreachProvider: ProviderDefinition = {
  id: 'outreach',
  name: 'outreach',
  displayName: 'Outreach',
  category: 'crm-marketing',
  description: 'Validate Outreach API credentials',
  inputFields: [
    { name: 'client_id', label: 'Client ID', type: 'text', required: true },
    { name: 'client_secret', label: 'Client Secret', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const auth = Buffer.from(`${credentials.client_id}:${credentials.client_secret}`).toString('base64');
      const { response, duration } = await safeRequest({
        method: 'POST',
        url: 'https://api.outreach.io/oauth/token',
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

// Salesloft Provider
export const salesloftProvider: ProviderDefinition = {
  id: 'salesloft',
  name: 'salesloft',
  displayName: 'SalesLoft',
  category: 'crm-marketing',
  description: 'Validate SalesLoft API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.salesloft.com/v2/me.json',
        headers: { Authorization: `Bearer ${credentials.api_key}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          userId: response.data.data.id,
          email: response.data.data.email
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Close Provider
export const closeProvider: ProviderDefinition = {
  id: 'close',
  name: 'close',
  displayName: 'Close CRM',
  category: 'crm-marketing',
  description: 'Validate Close API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const auth = Buffer.from(`${credentials.api_key}:`).toString('base64');
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.close.com/api/v1/user',
        headers: { Authorization: `Basic ${auth}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          userId: response.data.id,
          accountEmail: response.data.email
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Insightly Provider
export const insightlyProvider: ProviderDefinition = {
  id: 'insightly',
  name: 'insightly',
  displayName: 'Insightly',
  category: 'crm-marketing',
  description: 'Validate Insightly API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const auth = Buffer.from(`${credentials.api_key}:X`).toString('base64');
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.insightly.com/v3.1/me',
        headers: { Authorization: `Basic ${auth}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          userId: response.data.user_id
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};
