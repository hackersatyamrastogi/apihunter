// E-Commerce & Logistics Providers
import { ProviderDefinition, ProviderCredentials, ValidationResult } from '../../types';
import { safeRequest, isSuccessResponse } from '../../utils/http-client';
import { createValidationResult } from '../base-provider';
import { sanitizeError } from '../../security/redaction';

// Shopify Provider
export const shopifyProvider: ProviderDefinition = {
  id: 'shopify',
  name: 'shopify',
  displayName: 'Shopify',
  category: 'ecommerce-logistics',
  description: 'Validate Shopify API credentials',
  inputFields: [
    { name: 'shop_name', label: 'Shop Name', type: 'text', required: true, placeholder: 'myshop.myshopify.com' },
    { name: 'access_token', label: 'Access Token', type: 'password', required: true, placeholder: 'shppa_...' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const shop = credentials.shop_name?.replace('.myshopify.com', '') || credentials.shop_name;
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `https://${shop}.myshopify.com/admin/api/2024-01/shop.json`,
        headers: { 'X-Shopify-Access-Token': credentials.access_token },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          shopName: response.data.shop.name,
          shopId: response.data.shop.id,
          email: response.data.shop.email
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// WooCommerce Provider
export const woocommerceProvider: ProviderDefinition = {
  id: 'woocommerce',
  name: 'woocommerce',
  displayName: 'WooCommerce',
  category: 'ecommerce-logistics',
  description: 'Validate WooCommerce API credentials',
  inputFields: [
    { name: 'store_url', label: 'Store URL', type: 'url', required: true, placeholder: 'https://example.com' },
    { name: 'consumer_key', label: 'Consumer Key', type: 'text', required: true },
    { name: 'consumer_secret', label: 'Consumer Secret', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const auth = Buffer.from(`${credentials.consumer_key}:${credentials.consumer_secret}`).toString('base64');
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `${credentials.store_url}/wp-json/wc/v3/system_status`,
        headers: { Authorization: `Basic ${auth}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          woocommerceVersion: response.data.environment?.woocommerce_version
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// BigCommerce Provider
export const bigcommerceProvider: ProviderDefinition = {
  id: 'bigcommerce',
  name: 'bigcommerce',
  displayName: 'BigCommerce',
  category: 'ecommerce-logistics',
  description: 'Validate BigCommerce API token',
  inputFields: [
    { name: 'store_hash', label: 'Store Hash', type: 'text', required: true },
    { name: 'access_token', label: 'Access Token', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `https://api.bigcommerce.com/stores/${credentials.store_hash}/v3/store`,
        headers: { 'X-Auth-Token': credentials.access_token },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          storeName: response.data.data.name,
          storeId: response.data.data.id
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Magento Provider
export const magentoProvider: ProviderDefinition = {
  id: 'magento',
  name: 'magento',
  displayName: 'Magento',
  category: 'ecommerce-logistics',
  description: 'Validate Magento API token',
  inputFields: [
    { name: 'store_url', label: 'Store URL', type: 'url', required: true, placeholder: 'https://example.com' },
    { name: 'access_token', label: 'Access Token', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `${credentials.store_url}/rest/V1/store/storeConfigs`,
        headers: { Authorization: `Bearer ${credentials.access_token}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          storeCount: response.data.length
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Stripe for ecommerce (duplicate to payments but included here)
export const stripeEcommerceProvider: ProviderDefinition = {
  id: 'stripe-ecommerce',
  name: 'stripe-ecommerce',
  displayName: 'Stripe (eCommerce)',
  category: 'ecommerce-logistics',
  description: 'Validate Stripe API key for ecommerce',
  inputFields: [
    { name: 'api_key', label: 'Secret API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const auth = Buffer.from(`${credentials.api_key}:`).toString('base64');
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.stripe.com/v1/account',
        headers: { Authorization: `Basic ${auth}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          accountId: response.data.id,
          environment: response.data.livemode ? 'production' : 'test'
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Shippo Provider
export const shippoProvider: ProviderDefinition = {
  id: 'shippo',
  name: 'shippo',
  displayName: 'Shippo',
  category: 'ecommerce-logistics',
  description: 'Validate Shippo API token',
  inputFields: [
    { name: 'api_token', label: 'API Token', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.goshippo.com/addresses/',
        headers: { Authorization: `ShippoToken ${credentials.api_token}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          addressCount: response.data.count
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// EasyPost Provider
export const easypostProvider: ProviderDefinition = {
  id: 'easypost',
  name: 'easypost',
  displayName: 'EasyPost',
  category: 'ecommerce-logistics',
  description: 'Validate EasyPost API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const auth = Buffer.from(`${credentials.api_key}:`).toString('base64');
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.easypost.com/v2/user',
        headers: { Authorization: `Basic ${auth}` },
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

// FedEx Provider
export const fedexProvider: ProviderDefinition = {
  id: 'fedex',
  name: 'fedex',
  displayName: 'FedEx',
  category: 'ecommerce-logistics',
  description: 'Validate FedEx API credentials',
  inputFields: [
    { name: 'client_id', label: 'Client ID', type: 'text', required: true },
    { name: 'client_secret', label: 'Client Secret', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const auth = Buffer.from(`${credentials.client_id}:${credentials.client_secret}`).toString('base64');
      const { response, duration } = await safeRequest({
        method: 'POST',
        url: 'https://apis-sandbox.fedex.com/oauth/token',
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

// UPS Provider
export const upsProvider: ProviderDefinition = {
  id: 'ups',
  name: 'ups',
  displayName: 'UPS',
  category: 'ecommerce-logistics',
  description: 'Validate UPS API credentials',
  inputFields: [
    { name: 'client_id', label: 'Client ID', type: 'text', required: true },
    { name: 'client_secret', label: 'Client Secret', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const auth = Buffer.from(`${credentials.client_id}:${credentials.client_secret}`).toString('base64');
      const { response, duration } = await safeRequest({
        method: 'POST',
        url: 'https://onlinetools.ups.com/security/v1/oauth/token',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: 'grant_type=client_credentials',
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

// DHL Provider
export const dhlProvider: ProviderDefinition = {
  id: 'dhl',
  name: 'dhl',
  displayName: 'DHL',
  category: 'ecommerce-logistics',
  description: 'Validate DHL API credentials',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
    { name: 'consumer_id', label: 'Consumer ID', type: 'text', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api-sandbox.dhl.com/parceldelivery/v1/shipments',
        headers: {
          'DHL-API-Key': credentials.api_key,
          'Consumer-ID': credentials.consumer_id,
        },
      });
      if (response.status >= 200 && response.status < 500) {
        return createValidationResult('valid', {}, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Amazon Seller Central Provider
export const amazonSellerProvider: ProviderDefinition = {
  id: 'amazon-seller',
  name: 'amazon-seller',
  displayName: 'Amazon Seller Central',
  category: 'ecommerce-logistics',
  description: 'Validate Amazon Seller API credentials',
  inputFields: [
    { name: 'client_id', label: 'Client ID', type: 'text', required: true },
    { name: 'client_secret', label: 'Client Secret', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'POST',
        url: 'https://api.amazon.com/auth/o2/token',
        data: {
          grant_type: 'client_credentials',
          client_id: credentials.client_id,
          client_secret: credentials.client_secret,
          scope: 'sellingpartnerapi::notifications',
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

// eBay Provider
export const ebayProvider: ProviderDefinition = {
  id: 'ebay',
  name: 'ebay',
  displayName: 'eBay',
  category: 'ecommerce-logistics',
  description: 'Validate eBay API credentials',
  inputFields: [
    { name: 'client_id', label: 'Client ID', type: 'text', required: true },
    { name: 'client_secret', label: 'Client Secret', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const auth = Buffer.from(`${credentials.client_id}:${credentials.client_secret}`).toString('base64');
      const { response, duration } = await safeRequest({
        method: 'POST',
        url: 'https://api.sandbox.ebay.com/identity/v1/oauth2/token',
        headers: { Authorization: `Basic ${auth}` },
        data: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
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

// Printful Provider
export const printfulProvider: ProviderDefinition = {
  id: 'printful',
  name: 'printful',
  displayName: 'Printful',
  category: 'ecommerce-logistics',
  description: 'Validate Printful API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const auth = Buffer.from(`${credentials.api_key}:`).toString('base64');
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.printful.com/api/v2/warehouses',
        headers: { Authorization: `Basic ${auth}` },
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

// Tookan Provider
export const tookanProvider: ProviderDefinition = {
  id: 'tookan',
  name: 'tookan',
  displayName: 'Tookan',
  category: 'ecommerce-logistics',
  description: 'Validate Tookan API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'POST',
        url: 'https://api.tookan.com/v3/get_user_settings',
        data: { api_key: credentials.api_key },
      });
      if (isSuccessResponse(response.status) && response.data.status === 200) {
        return createValidationResult('valid', {}, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};
