// Email & Communications Providers
import { ProviderDefinition, ProviderCredentials, ValidationResult } from '../../types';
import { safeRequest, isSuccessResponse } from '../../utils/http-client';
import { createValidationResult } from '../base-provider';
import { sanitizeError } from '../../security/redaction';

// SendGrid Provider
export const sendgridProvider: ProviderDefinition = {
  id: 'sendgrid',
  name: 'sendgrid',
  displayName: 'SendGrid',
  category: 'email-comms',
  description: 'Validate SendGrid API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true, placeholder: 'SG.xxx' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.sendgrid.com/v3/user/profile',
        headers: { Authorization: `Bearer ${credentials.api_key}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          accountEmail: response.data.email,
          accountName: response.data.first_name
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Mailgun Provider
export const mailgunProvider: ProviderDefinition = {
  id: 'mailgun',
  name: 'mailgun',
  displayName: 'Mailgun',
  category: 'email-comms',
  description: 'Validate Mailgun API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
    { name: 'domain', label: 'Domain', type: 'text', required: true, placeholder: 'mg.example.com' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const auth = Buffer.from(`api:${credentials.api_key}`).toString('base64');
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `https://api.mailgun.net/v3/${credentials.domain}`,
        headers: { Authorization: `Basic ${auth}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          domain: response.data.domain,
          state: response.data.state
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Twilio Provider
export const twilioProvider: ProviderDefinition = {
  id: 'twilio',
  name: 'twilio',
  displayName: 'Twilio',
  category: 'email-comms',
  description: 'Validate Twilio Account SID and Auth Token',
  inputFields: [
    { name: 'account_sid', label: 'Account SID', type: 'text', required: true },
    { name: 'auth_token', label: 'Auth Token', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const auth = Buffer.from(`${credentials.account_sid}:${credentials.auth_token}`).toString('base64');
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `https://api.twilio.com/2010-04-01/Accounts/${credentials.account_sid}.json`,
        headers: { Authorization: `Basic ${auth}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          accountId: response.data.sid,
          accountEmail: response.data.owner_account_sid,
          status: response.data.status
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Slack Provider
export const slackProvider: ProviderDefinition = {
  id: 'slack',
  name: 'slack',
  displayName: 'Slack',
  category: 'email-comms',
  description: 'Validate Slack Bot Token or OAuth token',
  inputFields: [
    { name: 'bot_token', label: 'Bot Token', type: 'password', required: true, placeholder: 'xoxb-...' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://slack.com/api/auth.test',
        headers: { Authorization: `Bearer ${credentials.bot_token}` },
      });
      if (isSuccessResponse(response.status) && response.data.ok) {
        return createValidationResult('valid', {
          username: response.data.user_id,
          accountName: response.data.team,
          accountId: response.data.team_id,
          permissions: ['auth:test']
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, response.data.error || 'Invalid token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Discord Provider
export const discordProvider: ProviderDefinition = {
  id: 'discord',
  name: 'discord',
  displayName: 'Discord',
  category: 'email-comms',
  description: 'Validate Discord Bot Token',
  inputFields: [
    { name: 'bot_token', label: 'Bot Token', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://discord.com/api/v10/users/@me',
        headers: { Authorization: `Bot ${credentials.bot_token}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          username: response.data.username,
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

// Telegram Provider
export const telegramProvider: ProviderDefinition = {
  id: 'telegram',
  name: 'telegram',
  displayName: 'Telegram',
  category: 'email-comms',
  description: 'Validate Telegram Bot Token',
  inputFields: [
    { name: 'bot_token', label: 'Bot Token', type: 'password', required: true, placeholder: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `https://api.telegram.org/bot${credentials.bot_token}/getMe`,
      });
      if (isSuccessResponse(response.status) && response.data.ok) {
        return createValidationResult('valid', {
          username: response.data.result.username,
          accountId: response.data.result.id
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, response.data.description || 'Invalid token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Amazon SES Provider
export const sesProvider: ProviderDefinition = {
  id: 'amazon-ses',
  name: 'amazon-ses',
  displayName: 'Amazon SES',
  category: 'email-comms',
  description: 'Validate Amazon SES credentials',
  inputFields: [
    { name: 'access_key_id', label: 'Access Key ID', type: 'text', required: true },
    { name: 'secret_access_key', label: 'Secret Access Key', type: 'password', required: true },
    { name: 'region', label: 'Region', type: 'text', required: false, placeholder: 'us-east-1' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const region = credentials.region || 'us-east-1';
      const { response, duration } = await safeRequest({
        method: 'POST',
        url: `https://email.${region}.amazonaws.com/`,
        headers: {
          'X-Amz-Target': 'GraniteServiceVersion20120801.GetAccountSendingEnabled',
          'Content-Type': 'application/x-amz-json-1.1',
        },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', { region }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// SendPulse Provider
export const sendpulseProvider: ProviderDefinition = {
  id: 'sendpulse',
  name: 'sendpulse',
  displayName: 'SendPulse',
  category: 'email-comms',
  description: 'Validate SendPulse API credentials',
  inputFields: [
    { name: 'client_id', label: 'Client ID', type: 'text', required: true },
    { name: 'client_secret', label: 'Client Secret', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'POST',
        url: 'https://api.sendpulse.com/oauth/access_token',
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

// Brevo (Sendinblue) Provider
export const breevoProvider: ProviderDefinition = {
  id: 'brevo',
  name: 'brevo',
  displayName: 'Brevo (Sendinblue)',
  category: 'email-comms',
  description: 'Validate Brevo API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.brevo.com/v3/account',
        headers: { 'api-key': credentials.api_key },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          accountEmail: response.data.email,
          accountName: response.data.firstName
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Postmark Provider
export const postmarkProvider: ProviderDefinition = {
  id: 'postmark',
  name: 'postmark',
  displayName: 'Postmark',
  category: 'email-comms',
  description: 'Validate Postmark API token',
  inputFields: [
    { name: 'api_token', label: 'API Token', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.postmarkapp.com/servers',
        headers: { 'X-Postmark-Server-Token': credentials.api_token },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          serverCount: response.data.Servers?.length || 0
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// MailerLite Provider
export const mailerliteProvider: ProviderDefinition = {
  id: 'mailerlite',
  name: 'mailerlite',
  displayName: 'MailerLite',
  category: 'email-comms',
  description: 'Validate MailerLite API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://connect.mailerlite.com/api/subscribers',
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

// ConvertKit Provider
export const convertkitProvider: ProviderDefinition = {
  id: 'convertkit',
  name: 'convertkit',
  displayName: 'ConvertKit',
  category: 'email-comms',
  description: 'Validate ConvertKit API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `https://api.convertkit.com/v3/me?api_key=${credentials.api_key}`,
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          accountId: response.data.creator?.id
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Substack Provider
export const substackProvider: ProviderDefinition = {
  id: 'substack',
  name: 'substack',
  displayName: 'Substack',
  category: 'email-comms',
  description: 'Validate Substack API token',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    return createValidationResult('unknown', undefined, 'Substack API validation requires authentication details');
  },
};

// Mailchimp Provider
export const mailchimpProvider: ProviderDefinition = {
  id: 'mailchimp',
  name: 'mailchimp',
  displayName: 'Mailchimp',
  category: 'email-comms',
  description: 'Validate Mailchimp API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      // Extract datacenter from API key (format: xxxxx-us1, xxxxx-us2, etc)
      const parts = credentials.api_key?.split('-') || [];
      const datacenter = parts[1] || 'us1';
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `https://${datacenter}.api.mailchimp.com/3.0/`,
        headers: { Authorization: `Bearer ${credentials.api_key}` },
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

// SparkPost Provider
export const sparkpostProvider: ProviderDefinition = {
  id: 'sparkpost',
  name: 'sparkpost',
  displayName: 'SparkPost',
  category: 'email-comms',
  description: 'Validate SparkPost API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.sparkpost.com/api/v1/account',
        headers: { Authorization: credentials.api_key },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          accountName: response.data.results?.company_name
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Elastic Email Provider
export const elasticemailProvider: ProviderDefinition = {
  id: 'elasticemail',
  name: 'elasticemail',
  displayName: 'Elastic Email',
  category: 'email-comms',
  description: 'Validate Elastic Email API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.elasticemail.com/v2/account/profile?apikey=' + credentials.api_key,
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          accountEmail: response.data.Email
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Vonage (Nexmo) Provider
export const vonageProvider: ProviderDefinition = {
  id: 'vonage',
  name: 'vonage',
  displayName: 'Vonage (Nexmo)',
  category: 'email-comms',
  description: 'Validate Vonage API credentials',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'text', required: true },
    { name: 'api_secret', label: 'API Secret', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `https://rest.nexmo.com/account/get-balance?api_key=${credentials.api_key}&api_secret=${credentials.api_secret}`,
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          balance: response.data.value
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// MessageBird Provider
export const messagebirdProvider: ProviderDefinition = {
  id: 'messagebird',
  name: 'messagebird',
  displayName: 'MessageBird',
  category: 'email-comms',
  description: 'Validate MessageBird API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://rest.messagebird.com/balance',
        headers: { Authorization: `AccessKey ${credentials.api_key}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          balance: response.data.balance
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid API key', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Plivo Provider
export const plivoProvider: ProviderDefinition = {
  id: 'plivo',
  name: 'plivo',
  displayName: 'Plivo',
  category: 'email-comms',
  description: 'Validate Plivo API credentials',
  inputFields: [
    { name: 'auth_id', label: 'Auth ID', type: 'text', required: true },
    { name: 'auth_token', label: 'Auth Token', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const auth = Buffer.from(`${credentials.auth_id}:${credentials.auth_token}`).toString('base64');
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.plivo.com/v1/Account/',
        headers: { Authorization: `Basic ${auth}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          accountId: response.data.api_id
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// Clickatell Provider
export const clickatellProvider: ProviderDefinition = {
  id: 'clickatell',
  name: 'clickatell',
  displayName: 'Clickatell',
  category: 'email-comms',
  description: 'Validate Clickatell API token',
  inputFields: [
    { name: 'api_token', label: 'API Token', type: 'password', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://platform.clickatell.com/public-api/account/info',
        headers: { Authorization: `Bearer ${credentials.api_token}` },
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {
          accountId: response.data.account?.id
        }, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid token', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};

// SNS (AWS Simple Notification Service) Provider
export const snsProvider: ProviderDefinition = {
  id: 'aws-sns',
  name: 'aws-sns',
  displayName: 'AWS SNS',
  category: 'email-comms',
  description: 'Validate AWS SNS credentials',
  inputFields: [
    { name: 'access_key_id', label: 'Access Key ID', type: 'text', required: true },
    { name: 'secret_access_key', label: 'Secret Access Key', type: 'password', required: true },
    { name: 'region', label: 'Region', type: 'text', required: false, placeholder: 'us-east-1' },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    return createValidationResult('unknown', undefined, 'SNS validation requires AWS signature - use custom test');
  },
};

// Gupshup Provider
export const gupshupProvider: ProviderDefinition = {
  id: 'gupshup',
  name: 'gupshup',
  displayName: 'Gupshup',
  category: 'email-comms',
  description: 'Validate Gupshup API key',
  inputFields: [
    { name: 'api_key', label: 'API Key', type: 'password', required: true },
    { name: 'partner_id', label: 'Partner ID', type: 'text', required: true },
  ],
  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: `https://api.gupshup.io/v1/account/details?api_key=${credentials.api_key}`,
      });
      if (isSuccessResponse(response.status)) {
        return createValidationResult('valid', {}, undefined, undefined, response.status, duration);
      }
      return createValidationResult('invalid', undefined, 'Invalid credentials', undefined, response.status, duration);
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};
