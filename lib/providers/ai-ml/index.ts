// AI & Machine Learning Providers
import { ProviderDefinition, ProviderCredentials, ValidationResult } from '../../types';
import { safeRequest, isSuccessResponse } from '../../utils/http-client';
import { createValidationResult } from '../base-provider';
import { sanitizeError } from '../../security/redaction';

// OpenAI Provider
export const openaiProvider: ProviderDefinition = {
  id: 'openai',
  name: 'openai',
  displayName: 'OpenAI',
  category: 'ai-ml',
  description: 'Validate OpenAI API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true, placeholder: 'sk-...' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.openai.com/v1/models',
        headers: { Authorization: `Bearer ${credentials.api_key}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          modelCount: response.data.data?.length || 0,
          organization: response.headers['openai-organization']
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// HuggingFace Provider
export const huggingfaceProvider: ProviderDefinition = {
  id: 'huggingface',
  name: 'huggingface',
  displayName: 'Hugging Face',
  category: 'ai-ml',
  description: 'Validate Hugging Face API token',
  inputFields: [
    { name: 'api_token', label: 'API Token', type: 'password', required: true, placeholder: 'hf_...' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://huggingface.co/api/whoami',
        headers: { Authorization: `Bearer ${credentials.api_token}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          username: response.data.name,
          accountId: response.data.id
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// NVIDIA Provider
export const nvidiaProvider: ProviderDefinition = {
  id: 'nvidia',
  name: 'nvidia',
  displayName: 'NVIDIA',
  category: 'ai-ml',
  description: 'Validate NVIDIA API credentials',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.nvcf.nvidia.com/v2/nvcf/pexec/queues',
        headers: { Authorization: `Bearer ${credentials.api_key}` },
      });
      if (isSuccessResponse(response.status) || response.status === 401) {
        // If we get any response other than a connection error, the API key format is valid
        if (response.status === 401) {
          return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
        }
        return createValidationResult('valid', {}, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};
