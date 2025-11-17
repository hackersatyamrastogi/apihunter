// Development & CI/CD Providers
import { ProviderDefinition, ProviderCredentials, ValidationResult } from '../../types';
import { safeRequest, isSuccessResponse } from '../../utils/http-client';
import { createValidationResult } from '../base-provider';
import { sanitizeError } from '../../security/redaction';

// GitHub Provider
export const githubProvider: ProviderDefinition = {
  id: 'github',
  name: 'github',
  displayName: 'GitHub',
  category: 'dev-cicd',
  description: 'Validate GitHub Personal Access Token or OAuth token',
  inputFields: [
    { name: 'access_token', label: 'Personal Access Token', type: 'password', required: true, placeholder: 'ghp_...' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.github.com/user',
        headers: { Authorization: `Bearer ${credentials.access_token}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          username: response.data.login,
          accountId: response.data.id,
          accountEmail: response.data.email,
          scopes: response.headers['x-oauth-scopes']?.split(', '),
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// GitLab Provider
export const gitlabProvider: ProviderDefinition = {
  id: 'gitlab',
  name: 'gitlab',
  displayName: 'GitLab',
  category: 'dev-cicd',
  description: 'Validate GitLab Personal Access Token',
  inputFields: [
    { name: 'access_token', label: 'Personal Access Token', type: 'password', required: true },
    { name: 'base_url', label: 'Base URL', type: 'url', required: false, placeholder: 'https://gitlab.com', helperText: 'For self-hosted instances' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const baseUrl = credentials.base_url || 'https://gitlab.com';
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `${baseUrl}/api/v4/user`,
        headers: { 'PRIVATE-TOKEN': credentials.access_token },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          username: response.data.username,
          accountEmail: response.data.email,
          userId: response.data.id,
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Bitbucket Provider
export const bitbucketProvider: ProviderDefinition = {
  id: 'bitbucket',
  name: 'bitbucket',
  displayName: 'Bitbucket',
  category: 'dev-cicd',
  description: 'Validate Bitbucket App Password',
  inputFields: [
    { name: 'username', label: 'Username', type: 'text', required: true },
    { name: 'app_password', label: 'App Password', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const auth = Buffer.from(`${credentials.username}:${credentials.app_password}`).toString('base64');
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.bitbucket.org/2.0/user',
        headers: { Authorization: `Basic ${auth}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          username: response.data.username,
          accountId: response.data.account_id,
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// CircleCI Provider
export const circleciProvider: ProviderDefinition = {
  id: 'circleci',
  name: 'circleci',
  displayName: 'CircleCI',
  category: 'dev-cicd',
  description: 'Validate CircleCI API token',
  inputFields: [
    { name: 'api_token', label: 'API Token', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://circleci.com/api/v1.1/me',
        headers: { 'Circle-Token': credentials.api_token },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          username: response.data.login,
          accountEmail: response.data.selected_email,
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Buildkite Provider
export const buildkiteProvider: ProviderDefinition = {
  id: 'buildkite',
  name: 'buildkite',
  displayName: 'Buildkite',
  category: 'dev-cicd',
  description: 'Validate Buildkite API token',
  inputFields: [
    { name: 'api_token', label: 'API Token', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.buildkite.com/v2/user',
        headers: { Authorization: `Bearer ${credentials.api_token}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          username: response.data.name,
          accountEmail: response.data.email,
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Export remaining providers with minimal implementations
export const herokuProvider: ProviderDefinition = {
  id: 'heroku',
  name: 'heroku',
  displayName: 'Heroku',
  category: 'dev-cicd',
  description: 'Validate Heroku API key',
  inputFields: [{ name: 'api_key', label: 'API Key', type: 'password', required: true }],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.heroku.com/account',
        headers: { Authorization: `Bearer ${credentials.api_key}`, Accept: 'application/vnd.heroku+json; version=3' },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', { email: response.data.email }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

export const netlifyProvider: ProviderDefinition = {
  id: 'netlify',
  name: 'netlify',
  displayName: 'Netlify',
  category: 'dev-cicd',
  description: 'Validate Netlify access token',
  inputFields: [{ name: 'access_token', label: 'Access Token', type: 'password', required: true }],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.netlify.com/api/v1/user',
        headers: { Authorization: `Bearer ${credentials.access_token}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', { email: response.data.email }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

export const vercelProvider: ProviderDefinition = {
  id: 'vercel',
  name: 'vercel',
  displayName: 'Vercel',
  category: 'dev-cicd',
  description: 'Validate Vercel access token',
  inputFields: [{ name: 'access_token', label: 'Access Token', type: 'password', required: true }],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.vercel.com/v2/user',
        headers: { Authorization: `Bearer ${credentials.access_token}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', { username: response.data.user.username }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

export const renderProvider: ProviderDefinition = {
  id: 'render',
  name: 'render',
  displayName: 'Render',
  category: 'dev-cicd',
  description: 'Validate Render API key',
  inputFields: [{ name: 'api_key', label: 'API Key', type: 'password', required: true }],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.render.com/v1/owners',
        headers: { Authorization: `Bearer ${credentials.api_key}` },
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

export const flyioProvider: ProviderDefinition = {
  id: 'flyio',
  name: 'flyio',
  displayName: 'Fly.io',
  category: 'dev-cicd',
  description: 'Validate Fly.io API token',
  inputFields: [{ name: 'api_token', label: 'API Token', type: 'password', required: true }],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'POST',
        url: 'https://api.fly.io/graphql',
        headers: { Authorization: `Bearer ${credentials.api_token}` },
        data: { query: '{ viewer { email } }' },
      });
      if (isSuccessResponse(response.status) && !response.data.errors) {
        return createValidationResult('valid', { email: response.data.data?.viewer?.email }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Placeholder providers for remaining dev-cicd services
export const azureDevOpsProvider: ProviderDefinition = {
  id: 'azure-devops',
  name: 'azure-devops',
  displayName: 'Azure DevOps',
  category: 'dev-cicd',
  description: 'Validate Azure DevOps PAT',
  inputFields: [
    { name: 'organization', label: 'Organization', type: 'text', required: true },
    { name: 'pat', label: 'Personal Access Token', type: 'password', required: true }
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const auth = Buffer.from(`:${credentials.pat}`).toString('base64');
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `https://dev.azure.com/${credentials.organization}/_apis/projects?api-version=6.0`,
        headers: { Authorization: `Basic ${auth}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', { projectCount: response.data.count }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid PAT', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

export const githubActionsProvider: ProviderDefinition = { ...githubProvider, id: 'github-actions', displayName: 'GitHub Actions' };
export const argoCDProvider: ProviderDefinition = {
  id: 'argocd',
  name: 'argocd',
  displayName: 'ArgoCD',
  category: 'dev-cicd',
  description: 'Validate ArgoCD token',
  inputFields: [
    { name: 'server_url', label: 'Server URL', type: 'url', required: true },
    { name: 'auth_token', label: 'Auth Token', type: 'password', required: true }
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `${credentials.server_url}/api/v1/account`,
        headers: { Authorization: `Bearer ${credentials.auth_token}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {}, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

export const ansibleProvider: ProviderDefinition = {
  id: 'ansible',
  name: 'ansible',
  displayName: 'Ansible Tower/AWX',
  category: 'dev-cicd',
  description: 'Validate Ansible Tower API token',
  inputFields: [
    { name: 'tower_url', label: 'Tower URL', type: 'url', required: true },
    { name: 'token', label: 'API Token', type: 'password', required: true }
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    return createValidationResult('unknown', undefined, 'Custom validation required for self-hosted Ansible');
  },
};

export const terraformProvider: ProviderDefinition = {
  id: 'terraform-cloud',
  name: 'terraform-cloud',
  displayName: 'Terraform Cloud',
  category: 'dev-cicd',
  description: 'Validate Terraform Cloud API token',
  inputFields: [{ name: 'api_token', label: 'API Token', type: 'password', required: true }],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://app.terraform.io/api/v2/account/details',
        headers: { Authorization: `Bearer ${credentials.api_token}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', { username: response.data.data?.attributes?.username }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

export const pulumiProvider: ProviderDefinition = {
  id: 'pulumi',
  name: 'pulumi',
  displayName: 'Pulumi',
  category: 'dev-cicd',
  description: 'Validate Pulumi access token',
  inputFields: [{ name: 'access_token', label: 'Access Token', type: 'password', required: true }],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.pulumi.com/api/user',
        headers: { Authorization: `token ${credentials.access_token}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', { username: response.data.githubLogin }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

export const jfrogProvider: ProviderDefinition = {
  id: 'jfrog',
  name: 'jfrog',
  displayName: 'JFrog Artifactory',
  category: 'dev-cicd',
  description: 'Validate JFrog API key',
  inputFields: [
    { name: 'server_url', label: 'Server URL', type: 'url', required: true },
    { name: 'api_key', label: 'API Key', type: 'password', required: true }
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `${credentials.server_url}/api/system/ping`,
        headers: { 'X-JFrog-Art-Api': credentials.api_key },
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

export const dockerHubProvider: ProviderDefinition = {
  id: 'dockerhub',
  name: 'dockerhub',
  displayName: 'Docker Hub',
  category: 'dev-cicd',
  description: 'Validate Docker Hub access token',
  inputFields: [
    { name: 'username', label: 'Username', type: 'text', required: true },
    { name: 'password', label: 'Password/Token', type: 'password', required: true }
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'POST',
        url: 'https://hub.docker.com/v2/users/login',
        data: { username: credentials.username, password: credentials.password },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', { username: credentials.username }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

export const npmProvider: ProviderDefinition = {
  id: 'npm',
  name: 'npm',
  displayName: 'npm Registry',
  category: 'dev-cicd',
  description: 'Validate npm access token',
  inputFields: [{ name: 'auth_token', label: 'Auth Token', type: 'password', required: true }],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://registry.npmjs.org/-/whoami',
        headers: { Authorization: `Bearer ${credentials.auth_token}` },
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
