// Monitoring & Observability Providers
import { ProviderDefinition, ProviderCredentials, ValidationResult } from '../../types';
import { safeRequest, isSuccessResponse } from '../../utils/http-client';
import { createValidationResult } from '../base-provider';
import { sanitizeError } from '../../security/redaction';

// Datadog Provider
export const datadogProvider: ProviderDefinition = {
  id: 'datadog',
  name: 'datadog',
  displayName: 'Datadog',
  category: 'monitoring-logging',
  description: 'Validate Datadog API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
    { name: 'site', label: 'Site', type: 'text', required: false, placeholder: 'datadoghq.com or datadoghq.eu' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const site = credentials.site || 'datadoghq.com';
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `https://api.${site}/api/v1/validate?api_key=${credentials.api_key}`,
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

// Sentry Provider
export const sentryProvider: ProviderDefinition = {
  id: 'sentry',
  name: 'sentry',
  displayName: 'Sentry',
  category: 'monitoring-logging',
  description: 'Validate Sentry authentication token',
  inputFields: [
    { name: 'auth_token', label: 'Authentication Token', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://sentry.io/api/0/organizations/',
        headers: { Authorization: `Bearer ${credentials.auth_token}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          organizationCount: response.data.length
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// New Relic Provider
export const newrelicProvider: ProviderDefinition = {
  id: 'newrelic',
  name: 'newrelic',
  displayName: 'New Relic',
  category: 'monitoring-logging',
  description: 'Validate New Relic API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.newrelic.com/v2/accounts.json',
        headers: { 'X-Api-Key': credentials.api_key },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          accountCount: response.data.accounts?.length || 0
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Grafana Provider
export const grafanaProvider: ProviderDefinition = {
  id: 'grafana',
  name: 'grafana',
  displayName: 'Grafana',
  category: 'monitoring-logging',
  description: 'Validate Grafana API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
    { name: 'base_url', label: 'Base URL', type: 'url', required: false, placeholder: 'https://grafana.example.com' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const baseUrl = credentials.base_url || 'https://grafana.com';
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `${baseUrl}/api/auth/keys`,
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

// PostHog Provider
export const posthogProvider: ProviderDefinition = {
  id: 'posthog',
  name: 'posthog',
  displayName: 'PostHog',
  category: 'monitoring-logging',
  description: 'Validate PostHog API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
    { name: 'host', label: 'Host', type: 'url', required: false, placeholder: 'https://app.posthog.com' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const host = credentials.host || 'https://app.posthog.com';
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `${host}/api/projects/`,
        headers: { Authorization: `Bearer ${credentials.api_key}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          projectCount: response.data.results?.length || 0
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// LogRocket Provider
export const logrocketProvider: ProviderDefinition = {
  id: 'logrocket',
  name: 'logrocket',
  displayName: 'LogRocket',
  category: 'monitoring-logging',
  description: 'Validate LogRocket API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.logrocket.com/v2/session-user',
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

// Elastic Stack Provider
export const elasticProvider: ProviderDefinition = {
  id: 'elastic',
  name: 'elastic',
  displayName: 'Elastic Stack',
  category: 'monitoring-logging',
  description: 'Validate Elastic Stack credentials',
  inputFields: [
    { name: 'host', label: 'Host', type: 'url', required: true, placeholder: 'https://elasticsearch.example.com' },
    { name: 'username', label: 'Username', type: 'text', required: true },
    { name: 'password', label: 'Password', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const auth = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `${credentials.host}/_cluster/health`,
        headers: { Authorization: `Basic ${auth}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          clusterName: response.data.cluster_name,
          status: response.data.status
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Splunk Provider
export const splunkProvider: ProviderDefinition = {
  id: 'splunk',
  name: 'splunk',
  displayName: 'Splunk',
  category: 'monitoring-logging',
  description: 'Validate Splunk API token',
  inputFields: [
    { name: 'host', label: 'Host', type: 'url', required: true, placeholder: 'https://splunk.example.com:8089' },
    { name: 'token', label: 'Auth Token', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `${credentials.host}/services/server/info?output_mode=json`,
        headers: { Authorization: `Bearer ${credentials.token}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          serverName: response.data.entry?.[0]?.content?.host
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// CloudWatch Provider
export const cloudwatchProvider: ProviderDefinition = {
  id: 'cloudwatch',
  name: 'cloudwatch',
  displayName: 'AWS CloudWatch',
  category: 'monitoring-logging',
  description: 'Validate AWS CloudWatch credentials',
  inputFields: [
    { name: 'access_key_id', label: 'Access Key ID', type: 'text', required: true },
    { name: 'secret_access_key', label: 'Secret Access Key', type: 'password', required: true },
    { name: 'region', label: 'Region', type: 'text', required: false, placeholder: 'us-east-1' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    return createValidationResult('unknown', undefined, 'CloudWatch validation requires AWS signature - use custom test');
  },
};

// Prometheus Provider
export const prometheusProvider: ProviderDefinition = {
  id: 'prometheus',
  name: 'prometheus',
  displayName: 'Prometheus',
  category: 'monitoring-logging',
  description: 'Validate Prometheus server access',
  inputFields: [
    { name: 'host', label: 'Host', type: 'url', required: true, placeholder: 'http://prometheus.example.com:9090' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `${credentials.host}/-/healthy`,
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {}, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Prometheus server unreachable', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};
