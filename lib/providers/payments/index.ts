// Payment & Billing Providers
import { ProviderDefinition, ProviderCredentials, ValidationResult } from '../../types';
import { safeRequest, isSuccessResponse } from '../../utils/http-client';
import { createValidationResult } from '../base-provider';
import { sanitizeError } from '../../security/redaction';

// Stripe Provider
export const stripeProvider: ProviderDefinition = {
  id: 'stripe',
  name: 'stripe',
  displayName: 'Stripe',
  category: 'payments-billing',
  description: 'Validate Stripe API key',
  inputFields: [
    { name: 'api_key', label: 'Secret API Key', type: 'password', required: true, placeholder: 'sk_live_... or sk_test_...' },
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
          accountEmail: response.data.email,
          environment: response.data.livemode ? 'production' : 'test',
          permissions: response.data.permissions || []
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// PayPal Provider
export const paypalProvider: ProviderDefinition = {
  id: 'paypal',
  name: 'paypal',
  displayName: 'PayPal',
  category: 'payments-billing',
  description: 'Validate PayPal API signature or OAuth credentials',
  inputFields: [
    { name: 'client_id', label: 'Client ID', type: 'text', required: true },
    { name: 'client_secret', label: 'Client Secret', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const auth = Buffer.from(`${credentials.client_id}:${credentials.client_secret}`).toString('base64');
      const { response, duration } = await safeRequest({
        method: 'POST',
        url: 'https://api.sandbox.paypal.com/v1/oauth2/token',
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

// Razorpay Provider
export const razorpayProvider: ProviderDefinition = {
  id: 'razorpay',
  name: 'razorpay',
  displayName: 'Razorpay',
  category: 'payments-billing',
  description: 'Validate Razorpay API credentials',
  inputFields: [
    { name: 'key_id', label: 'Key ID', type: 'text', required: true },
    { name: 'key_secret', label: 'Key Secret', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const auth = Buffer.from(`${credentials.key_id}:${credentials.key_secret}`).toString('base64');
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.razorpay.com/v1/account',
        headers: { Authorization: `Basic ${auth}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          accountId: response.data.id,
          accountEmail: response.data.email
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Square Provider
export const squareProvider: ProviderDefinition = {
  id: 'square',
  name: 'square',
  displayName: 'Square',
  category: 'payments-billing',
  description: 'Validate Square API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true, placeholder: 'sq0atp_...' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://connect.squareup.com/v2/me',
        headers: { Authorization: `Bearer ${credentials.api_key}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          accountId: response.data.merchant?.id,
          accountEmail: response.data.merchant?.email
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Braintree Provider
export const braintreeProvider: ProviderDefinition = {
  id: 'braintree',
  name: 'braintree',
  displayName: 'Braintree',
  category: 'payments-billing',
  description: 'Validate Braintree API credentials',
  inputFields: [
    { name: 'merchant_id', label: 'Merchant ID', type: 'text', required: true },
    { name: 'public_key', label: 'Public Key', type: 'text', required: true },
    { name: 'private_key', label: 'Private Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    return createValidationResult('unknown', undefined, 'Braintree validation requires SDK setup - use custom test');
  },
};

// Adyen Provider
export const adyenProvider: ProviderDefinition = {
  id: 'adyen',
  name: 'adyen',
  displayName: 'Adyen',
  category: 'payments-billing',
  description: 'Validate Adyen API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://pal-test.adyen.com/pal/servlet/Account/v1/getAccountHolder',
        headers: { 'X-API-Key': credentials.api_key },
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

// Mollie Provider
export const mollieProvider: ProviderDefinition = {
  id: 'mollie',
  name: 'mollie',
  displayName: 'Mollie',
  category: 'payments-billing',
  description: 'Validate Mollie API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true, placeholder: 'test_... or live_...' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.mollie.com/v2/customers',
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

// 2Checkout (Verifone) Provider
export const verifoneProvider: ProviderDefinition = {
  id: 'verifone',
  name: 'verifone',
  displayName: '2Checkout (Verifone)',
  category: 'payments-billing',
  description: 'Validate Verifone API credentials',
  inputFields: [
    { name: 'merchant_code', label: 'Merchant Code', type: 'text', required: true },
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `https://api.2checkout.com/rest/6.0/accounts/${credentials.merchant_code}`,
        headers: { 'X-API-KEY': credentials.api_key },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          accountId: response.data.merchantCode
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Worldpay Provider
export const worldpayProvider: ProviderDefinition = {
  id: 'worldpay',
  name: 'worldpay',
  displayName: 'Worldpay',
  category: 'payments-billing',
  description: 'Validate Worldpay API credentials',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.sandbox.worldpay.com/v1/servicekey',
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

// Wise (TransferWise) Provider
export const wiseProvider: ProviderDefinition = {
  id: 'wise',
  name: 'wise',
  displayName: 'Wise (TransferWise)',
  category: 'payments-billing',
  description: 'Validate Wise API token',
  inputFields: [
    { name: 'api_token', label: 'API Token', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.sandbox.transferwise.tech/v1/me',
        headers: { Authorization: `Bearer ${credentials.api_token}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          accountId: response.data.id,
          accountEmail: response.data.email
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Flutterwave Provider
export const flutterwaveProvider: ProviderDefinition = {
  id: 'flutterwave',
  name: 'flutterwave',
  displayName: 'Flutterwave',
  category: 'payments-billing',
  description: 'Validate Flutterwave API credentials',
  inputFields: [
    { name: 'secret_key', label: 'Secret Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.flutterwave.com/v3/account/verify',
        headers: { Authorization: `Bearer ${credentials.secret_key}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          accountName: response.data.business_name
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Paystack Provider
export const paystackProvider: ProviderDefinition = {
  id: 'paystack',
  name: 'paystack',
  displayName: 'Paystack',
  category: 'payments-billing',
  description: 'Validate Paystack API key',
  inputFields: [
    { name: 'secret_key', label: 'Secret Key', type: 'password', required: true, placeholder: 'sk_live_... or sk_test_...' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.paystack.co/customer',
        headers: { Authorization: `Bearer ${credentials.secret_key}` },
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

// Stripe Connect Provider
export const stripeConnectProvider: ProviderDefinition = {
  id: 'stripe-connect',
  name: 'stripe-connect',
  displayName: 'Stripe Connect',
  category: 'payments-billing',
  description: 'Validate Stripe Connect API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    // Uses same validation as Stripe
    return await stripeProvider.validate(credentials);
  },
};

// Authorize.Net Provider
export const authorizenetProvider: ProviderDefinition = {
  id: 'authorizenet',
  name: 'authorizenet',
  displayName: 'Authorize.Net',
  category: 'payments-billing',
  description: 'Validate Authorize.Net API credentials',
  inputFields: [
    { name: 'login_id', label: 'Login ID', type: 'text', required: true },
    { name: 'transaction_key', label: 'Transaction Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    return createValidationResult('unknown', undefined, 'Authorize.Net validation requires signature - use custom test');
  },
};

// Checkout.com Provider
export const checkoutProvider: ProviderDefinition = {
  id: 'checkout',
  name: 'checkout',
  displayName: 'Checkout.com',
  category: 'payments-billing',
  description: 'Validate Checkout.com API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.sandbox.checkout.com/merchants',
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

// Recurly Provider
export const recurlyProvider: ProviderDefinition = {
  id: 'recurly',
  name: 'recurly',
  displayName: 'Recurly',
  category: 'payments-billing',
  description: 'Validate Recurly API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const auth = Buffer.from(`${credentials.api_key}:`).toString('base64');
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://v3.recurly.com/accounts',
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

// Paddle Provider
export const paddleProvider: ProviderDefinition = {
  id: 'paddle',
  name: 'paddle',
  displayName: 'Paddle',
  category: 'payments-billing',
  description: 'Validate Paddle API credentials',
  inputFields: [
    { name: 'vendor_id', label: 'Vendor ID', type: 'text', required: true },
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'POST',
        url: 'https://api.paddle.com/2.0/user/auth',
        data: {
          vendor_id: credentials.vendor_id,
          api_key: credentials.api_key,
        },
      });
      if (isSuccessResponse(response.status) && response.data.success) {
        return createValidationResult('valid', {}, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};
