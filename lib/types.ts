// Core types for APIHunter

export interface ProviderCredentials {
  [key: string]: string | undefined;
}

export interface ValidationRequest {
  providerId: string;
  credentials: ProviderCredentials;
  storeInHistory?: boolean;
}

export interface ValidationMetadata {
  accountId?: string;
  accountEmail?: string;
  accountName?: string;
  organizationId?: string;
  organizationName?: string;
  scopes?: string[];
  permissions?: string[];
  roles?: string[];
  environment?: string;
  region?: string;
  projectId?: string;
  projectName?: string;
  userId?: string;
  username?: string;
  [key: string]: unknown;
}

export interface ValidationResult {
  status: 'valid' | 'invalid' | 'unknown' | 'error';
  metadata?: ValidationMetadata;
  errorMessage?: string;
  rawResponse?: string;
  httpStatus?: number;
  requestDuration?: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  riskHints?: string[];
}

export interface ProviderInputField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'textarea' | 'url';
  required: boolean;
  placeholder?: string;
  helperText?: string;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

export interface ProviderDefinition {
  id: string;
  name: string;
  displayName: string;
  category: string;
  description: string;
  inputFields: ProviderInputField[];
  docsUrl?: string;
  validate: (credentials: ProviderCredentials) => Promise<ValidationResult>;
}

export type ProviderCategory =
  | 'cloud'
  | 'dev-cicd'
  | 'email-comms'
  | 'payments-billing'
  | 'monitoring-logging'
  | 'security'
  | 'database'
  | 'identity-auth'
  | 'crm-marketing'
  | 'ecommerce-logistics'
  | 'infrastructure'
  | 'ai-ml'
  | 'other';

export interface ProviderCategoryMeta {
  id: ProviderCategory;
  name: string;
  description: string;
}

export interface ValidationHistory {
  id: string;
  providerId: string;
  providerName: string;
  status: string;
  metadata?: ValidationMetadata;
  errorSummary?: string;
  httpStatus?: number;
  requestDuration?: number;
  createdAt: Date;
}

export interface JWTDecoded {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  raw: {
    header: string;
    payload: string;
    signature: string;
  };
}

export interface CustomTestRequest {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers: Record<string, string>;
  body?: string;
  credentialInjection: {
    location: 'header' | 'query' | 'body';
    key: string;
    value: string;
  };
}

export interface CustomTestResult {
  success: boolean;
  httpStatus: number;
  headers: Record<string, string>;
  body: string;
  duration: number;
  error?: string;
}
