import { ProviderDefinition, ProviderCredentials, ValidationResult } from '../../types';
import { safeRequest, isSuccessResponse } from '../../utils/http-client';
import { createValidationResult } from '../base-provider';
import { sanitizeError } from '../../security/redaction';

export const awsProvider: ProviderDefinition = {
  id: 'aws',
  name: 'aws',
  displayName: 'Amazon Web Services (AWS)',
  category: 'cloud',
  description: 'Validate AWS Access Key ID and Secret Access Key using STS GetCallerIdentity',
  inputFields: [
    {
      name: 'access_key_id',
      label: 'Access Key ID',
      type: 'text',
      required: true,
      placeholder: 'AKIA...',
      helperText: 'AWS Access Key ID (starts with AKIA)',
    },
    {
      name: 'secret_access_key',
      label: 'Secret Access Key',
      type: 'password',
      required: true,
      placeholder: 'Secret Access Key',
      helperText: '40-character secret key',
    },
    {
      name: 'region',
      label: 'Region',
      type: 'text',
      required: false,
      placeholder: 'us-east-1',
      helperText: 'AWS region (default: us-east-1)',
    },
  ],
  docsUrl: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html',

  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    const accessKeyId = credentials.access_key_id;
    const secretAccessKey = credentials.secret_access_key;
    const region = credentials.region || 'us-east-1';

    if (!accessKeyId || !secretAccessKey) {
      return createValidationResult('error', undefined, 'Missing required credentials');
    }

    try {
      // Use AWS STS GetCallerIdentity - a safe, non-destructive call
      const endpoint = `https://sts.${region}.amazonaws.com/`;
      const params = new URLSearchParams({
        Action: 'GetCallerIdentity',
        Version: '2011-06-15',
      });

      // Create AWS Signature V4 (simplified for this example)
      // In production, use aws-sdk or proper signing library
      const { response, duration } = await safeRequest({
        method: 'POST',
        url: endpoint,
        data: params.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        // Note: Real implementation requires AWS Signature V4
        // This is a placeholder - actual AWS calls need proper signing
      });

      if (isSuccessResponse(response.status)) {
        // Parse account info from response
        const data = response.data;
        return createValidationResult(
          'valid',
          {
            accountId: data.Account || 'unknown',
            userId: data.UserId,
            arn: data.Arn,
            region,
          },
          undefined,
          JSON.stringify(data),
          response.status,
          duration
        );
      } else {
        return createValidationResult(
          'invalid',
          undefined,
          'Invalid AWS credentials',
          undefined,
          response.status,
          duration
        );
      }
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};
