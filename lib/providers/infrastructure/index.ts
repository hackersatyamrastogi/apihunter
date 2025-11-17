// Infrastructure & DevOps Providers
import { ProviderDefinition, ProviderCredentials, ValidationResult } from '../../types';
import { safeRequest, isSuccessResponse } from '../../utils/http-client';
import { createValidationResult } from '../base-provider';
import { sanitizeError } from '../../security/redaction';

// Kubernetes Provider
export const kubernetesProvider: ProviderDefinition = {
  id: 'kubernetes',
  name: 'kubernetes',
  displayName: 'Kubernetes',
  category: 'infrastructure',
  description: 'Validate Kubernetes cluster credentials',
  inputFields: [
    { name: 'api_server', label: 'API Server URL', type: 'url', required: true, placeholder: 'https://kubernetes.example.com' },
    { name: 'bearer_token', label: 'Bearer Token', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `${credentials.api_server}/api/v1/nodes`,
        headers: { Authorization: `Bearer ${credentials.bearer_token}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          nodeCount: response.data.items?.length || 0
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// RabbitMQ Provider
export const rabbitmqProvider: ProviderDefinition = {
  id: 'rabbitmq',
  name: 'rabbitmq',
  displayName: 'RabbitMQ',
  category: 'infrastructure',
  description: 'Validate RabbitMQ management API credentials',
  inputFields: [
    { name: 'host', label: 'Host', type: 'url', required: true, placeholder: 'http://localhost:15672' },
    { name: 'username', label: 'Username', type: 'text', required: true },
    { name: 'password', label: 'Password', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const auth = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `${credentials.host}/api/overview`,
        headers: { Authorization: `Basic ${auth}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          version: response.data.rabbitmq_version,
          queues: response.data.queue_totals?.messages || 0
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// PagerDuty Provider
export const pagerdytyProvider: ProviderDefinition = {
  id: 'pagerduty',
  name: 'pagerduty',
  displayName: 'PagerDuty',
  category: 'infrastructure',
  description: 'Validate PagerDuty API token',
  inputFields: [
    { name: 'api_token', label: 'API Token', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.pagerduty.com/users/me',
        headers: { Authorization: `Token token=${credentials.api_token}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          userId: response.data.user.id,
          email: response.data.user.email
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// OpenStack Provider
export const openstackProvider: ProviderDefinition = {
  id: 'openstack',
  name: 'openstack',
  displayName: 'OpenStack',
  category: 'infrastructure',
  description: 'Validate OpenStack credentials',
  inputFields: [
    { name: 'auth_url', label: 'Auth URL', type: 'url', required: true, placeholder: 'https://identity.api.openstack.org:5000' },
    { name: 'project_name', label: 'Project Name', type: 'text', required: true },
    { name: 'username', label: 'Username', type: 'text', required: true },
    { name: 'password', label: 'Password', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'POST',
        url: `${credentials.auth_url}/v3/auth/tokens`,
        data: {
          auth: {
            identity: {
              methods: ['password'],
              password: {
                user: {
                  name: credentials.username,
                  password: credentials.password,
                  domain: { name: 'Default' },
                },
              },
            },
            scope: {
              project: {
                name: credentials.project_name,
                domain: { name: 'Default' },
              },
            },
          },
        },
      });
      if (isSuccessResponse(response.status) && response.headers['x-subject-token']) {
        return createValidationResult('valid', {}, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Apache Kafka Provider
export const kafkaProvider: ProviderDefinition = {
  id: 'apache-kafka',
  name: 'apache-kafka',
  displayName: 'Apache Kafka',
  category: 'infrastructure',
  description: 'Validate Kafka broker access',
  inputFields: [
    { name: 'bootstrap_servers', label: 'Bootstrap Servers', type: 'text', required: true, placeholder: 'localhost:9092' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    return createValidationResult('unknown', undefined, 'Kafka validation requires native driver - use custom test');
  },
};

// Consul Provider
export const consulProvider: ProviderDefinition = {
  id: 'consul',
  name: 'consul',
  displayName: 'HashiCorp Consul',
  category: 'infrastructure',
  description: 'Validate Consul API access',
  inputFields: [
    { name: 'host', label: 'Host', type: 'url', required: true, placeholder: 'http://localhost:8500' },
    { name: 'token', label: 'Token', type: 'password', required: false },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const headers = credentials.token ? { 'X-Consul-Token': credentials.token } : {};
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `${credentials.host}/v1/catalog/nodes`,
        headers,
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          nodeCount: response.data.length
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// etcd Provider
export const etcdProvider: ProviderDefinition = {
  id: 'etcd',
  name: 'etcd',
  displayName: 'etcd',
  category: 'infrastructure',
  description: 'Validate etcd cluster access',
  inputFields: [
    { name: 'endpoints', label: 'Endpoints', type: 'text', required: true, placeholder: 'http://localhost:2379' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `${credentials.endpoints}/version`,
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          etcdVersion: response.data.etcdserver
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'etcd unreachable', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Nomad Provider
export const nomadProvider: ProviderDefinition = {
  id: 'hashicorp-nomad',
  name: 'hashicorp-nomad',
  displayName: 'HashiCorp Nomad',
  category: 'infrastructure',
  description: 'Validate Nomad API access',
  inputFields: [
    { name: 'host', label: 'Host', type: 'url', required: true, placeholder: 'http://localhost:4646' },
    { name: 'token', label: 'ACL Token', type: 'password', required: false },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const headers = credentials.token ? { 'X-Nomad-Token': credentials.token } : {};
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `${credentials.host}/v1/status/leader`,
        headers,
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          leader: response.data
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Datadog Monitoring Provider (Infrastructure focused)
export const datadogInfraProvider: ProviderDefinition = {
  id: 'datadog-infra',
  name: 'datadog-infra',
  displayName: 'Datadog Infrastructure',
  category: 'infrastructure',
  description: 'Validate Datadog API key for infrastructure',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `https://api.datadoghq.com/api/v1/validate?api_key=${credentials.api_key}`,
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
