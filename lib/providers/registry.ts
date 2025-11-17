import { ProviderDefinition, ProviderCategory, ProviderCategoryMeta } from '../types';

// Import all provider modules from index files
import * as cloudProviders from './cloud';
import * as devCicdProviders from './dev-cicd';
import * as emailCommsProviders from './email-comms';
import * as paymentsProviders from './payments';
import * as monitoringProviders from './monitoring';
import * as identityProviders from './identity';
import * as databaseProviders from './database';
import * as securityProviders from './security';
import * as crmProviders from './crm';
import * as ecommerceProviders from './ecommerce';
import * as infrastructureProviders from './infrastructure';
import * as aiMlProviders from './ai-ml';
import * as otherProviders from './other';

// Provider categories metadata
export const PROVIDER_CATEGORIES: ProviderCategoryMeta[] = [
  {
    id: 'cloud',
    name: 'Cloud Providers',
    description: 'AWS, GCP, Azure, DigitalOcean, and other cloud infrastructure providers',
  },
  {
    id: 'dev-cicd',
    name: 'Development & CI/CD',
    description: 'GitHub, GitLab, Docker, CI/CD platforms, and developer tools',
  },
  {
    id: 'email-comms',
    name: 'Email & Communications',
    description: 'Email services, SMS, messaging platforms, and communication APIs',
  },
  {
    id: 'payments-billing',
    name: 'Payments & Billing',
    description: 'Payment processors, billing systems, and financial APIs',
  },
  {
    id: 'monitoring-logging',
    name: 'Monitoring & Logging',
    description: 'Application monitoring, logging, analytics, and observability platforms',
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Security tools, vulnerability scanners, and threat intelligence platforms',
  },
  {
    id: 'database',
    name: 'Databases & Data',
    description: 'Database services, data pipelines, and storage solutions',
  },
  {
    id: 'identity-auth',
    name: 'Identity & Authentication',
    description: 'SSO, identity providers, authentication, and access management',
  },
  {
    id: 'crm-marketing',
    name: 'CRM & Marketing',
    description: 'Customer relationship management, marketing automation, and sales tools',
  },
  {
    id: 'ecommerce-logistics',
    name: 'E-commerce & Logistics',
    description: 'Online stores, shopping carts, and shipping services',
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure & Tools',
    description: 'General infrastructure, content delivery, and utility services',
  },
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    description: 'AI models, machine learning platforms, and related services',
  },
  {
    id: 'other',
    name: 'Other Services',
    description: 'Miscellaneous SaaS and API providers',
  },
];

// Central registry of all providers
const providerRegistry = new Map<string, ProviderDefinition>();

// Collect all providers from imported modules
const collectProviders = (module: any): ProviderDefinition[] => {
  return Object.values(module).filter(
    (value): value is ProviderDefinition =>
      typeof value === 'object' &&
      value !== null &&
      'id' in value &&
      'validate' in value
  );
};

// Register all providers
const providers: ProviderDefinition[] = [
  ...collectProviders(cloudProviders),
  ...collectProviders(devCicdProviders),
  ...collectProviders(emailCommsProviders),
  ...collectProviders(paymentsProviders),
  ...collectProviders(monitoringProviders),
  ...collectProviders(identityProviders),
  ...collectProviders(databaseProviders),
  ...collectProviders(securityProviders),
  ...collectProviders(crmProviders),
  ...collectProviders(ecommerceProviders),
  ...collectProviders(infrastructureProviders),
  ...collectProviders(aiMlProviders),
  ...collectProviders(otherProviders),
];

// Populate registry
providers.forEach((provider) => {
  providerRegistry.set(provider.id, provider);
});

/**
 * Get all providers
 */
export function getAllProviders(): ProviderDefinition[] {
  return Array.from(providerRegistry.values());
}

/**
 * Get provider by ID
 */
export function getProvider(id: string): ProviderDefinition | undefined {
  return providerRegistry.get(id);
}

/**
 * Get providers by category
 */
export function getProvidersByCategory(category: ProviderCategory): ProviderDefinition[] {
  return Array.from(providerRegistry.values()).filter((p) => p.category === category);
}

/**
 * Search providers by name or description
 */
export function searchProviders(query: string): ProviderDefinition[] {
  const lowerQuery = query.toLowerCase();
  return Array.from(providerRegistry.values()).filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.displayName.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get total provider count
 */
export function getProviderCount(): number {
  return providerRegistry.size;
}
