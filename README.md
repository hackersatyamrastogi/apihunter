# APIHunter

**Full-stack API key validation tool for security researchers, penetration testers, and bug bounty hunters.**

APIHunter is a self-hosted web application that safely validates API keys, tokens, and credentials discovered during security testing. It supports 100+ SaaS providers and performs only safe, non-destructive API calls.

## Features

- **100+ Provider Support**: Pre-configured validators for AWS, GitHub, Stripe, Slack, and many more
- **Safe Validation**: All checks use read-only, non-destructive API endpoints
- **Security-First**: Automatic secret redaction, encrypted storage, fingerprint-only history
- **Modern UI**: Clean, responsive interface designed for security professionals
- **JWT Decoder**: Decode and analyze JWT tokens without verification
- **Custom Tester**: Build and test custom API requests with credential injection
- **Validation History**: Track past validations with filtering and search
- **Risk Assessment**: Automatic detection of elevated permissions and production environments
- **Docker Support**: Easy deployment with docker-compose

## Disclaimer

**FOR AUTHORIZED SECURITY TESTING ONLY**

This tool is intended exclusively for:
- Authorized penetration testing engagements
- Internal security assessments
- Bug bounty programs where you have permission
- Educational and research purposes

**You are responsible for:**
- Ensuring you have legal authorization to test any keys/credentials
- Complying with all applicable laws and regulations
- Using this tool ethically and responsibly

**No warranty is provided. Use at your own risk.**

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd apihunter

# Copy environment file
cp .env.example .env

# Edit .env with your settings (especially encryption keys)
nano .env

# Start with Docker Compose
docker-compose up -d

# Access at http://localhost:3000
```

### Option 2: Manual Setup

```bash
# Prerequisites: Node.js 18+, PostgreSQL

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
nano .env  # Configure DATABASE_URL and other settings

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Run development server
npm run dev

# Access at http://localhost:3000
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/apihunter?schema=public"

# Security (CHANGE THESE IN PRODUCTION!)
ENCRYPTION_KEY="your-secure-32-character-key-here"
SECRET_FINGERPRINT_SALT="your-secure-salt-here"

# Features
ENABLE_HISTORY=true
ENABLE_ENCRYPTION=true

# Optional: HTTP Proxy (for routing through Burp/ZAP)
HTTP_PROXY=""
HTTPS_PROXY=""
```

## Architecture

### Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **State Management**: React Query (TanStack Query)
- **HTTP Client**: Axios with proxy support
- **Icons**: Lucide React

### Project Structure

```
apihunter/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── validate/      # Main validation endpoint
│   │   ├── history/       # Validation history
│   │   ├── providers/     # Provider catalog
│   │   ├── jwt/           # JWT decoder
│   │   └── custom-test/   # Custom HTTP tester
│   ├── validate/          # Validation UI
│   ├── history/           # History view
│   ├── providers/         # Provider catalog
│   ├── jwt/               # JWT decoder UI
│   ├── custom-test/       # Custom tester UI
│   └── settings/          # Settings page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── providers/        # React context providers
├── lib/                   # Core library code
│   ├── providers/        # Provider modules (100+)
│   │   ├── cloud/        # Cloud providers
│   │   ├── dev-cicd/     # Dev & CI/CD
│   │   ├── email-comms/  # Email & messaging
│   │   ├── payments/     # Payment processors
│   │   ├── monitoring/   # Monitoring & logging
│   │   ├── identity/     # Identity & auth
│   │   ├── database/     # Databases
│   │   ├── security/     # Security tools
│   │   ├── crm/          # CRM & marketing
│   │   ├── ecommerce/    # E-commerce
│   │   ├── infrastructure/ # Infrastructure
│   │   ├── ai-ml/        # AI & ML
│   │   └── other/        # Miscellaneous
│   ├── security/         # Security utilities
│   │   └── redaction.ts  # Secret redaction
│   ├── utils/            # Utilities
│   │   ├── http-client.ts # HTTP client
│   │   └── jwt.ts        # JWT utilities
│   ├── types.ts          # TypeScript types
│   └── db.ts             # Prisma client
├── prisma/
│   └── schema.prisma     # Database schema
└── __tests__/            # Jest tests
```

## Supported Providers

APIHunter supports **100+** SaaS providers across 13 categories:

### Cloud Providers (12)
AWS, GCP, Azure, DigitalOcean, Linode, Vultr, OVH, Scaleway, Oracle Cloud, Cloudflare, Fastly, Backblaze

### Dev & CI/CD (19)
GitHub, GitLab, Bitbucket, CircleCI, Buildkite, Heroku, Netlify, Vercel, Render, Fly.io, Azure DevOps, ArgoCD, Ansible, Terraform Cloud, Pulumi, JFrog, Docker Hub, npm

### Email & Communications (20)
SendGrid, Mailgun, Mailchimp, MailerLite, Sendinblue, Postmark, Amazon SES, Twilio, Telnyx, Slack, Discord, Telegram, WhatsApp, Microsoft Teams, and more

### Payments & Billing (15)
Stripe, PayPal, Square, Braintree, Adyen, Razorpay, Paystack, Recharge, Wise, Revolut, Coinbase, and more

### Monitoring & Logging (9)
Datadog, Sentry, New Relic, Grafana, Honeycomb, PostHog, Plausible, Splunk, Elastic

### Identity & Authentication (10)
Okta, Auth0, Clerk, Azure AD, Keycloak, JumpCloud, FusionAuth, Cognito, 1Password, Bitwarden

### Databases & Data (19)
PostgreSQL, MongoDB, Redis, Elasticsearch, Snowflake, PlanetScale, Supabase, Pinecone, Weaviate, and more

### Security (16)
Snyk, SonarCloud, Shodan, CrowdStrike, SentinelOne, Vault, VirusTotal, SecurityTrails, Censys, and more

### CRM & Marketing (26)
HubSpot, Salesforce, Pipedrive, Zoho, Jira, Notion, Zendesk, Asana, Airtable, Linear, and more

### E-commerce & Logistics (12)
Shopify, WooCommerce, Magento, BigCommerce, Shippo, FedEx, UPS, DHL, and more

### Infrastructure (8)
Kubernetes, RabbitMQ, BunnyCDN, Cloudinary, PagerDuty, Opsgenie, and more

### AI & ML (3)
OpenAI, Hugging Face, NVIDIA

### Other (13)
Firebase, Algolia, Bitly, Doppler, Zoom, LaunchDarkly, Postman, and more

[Full provider list available in the UI]

## Usage

### 1. Dashboard

The home page provides:
- Overview of the tool
- Quick action buttons
- Links to all features

### 2. New Validation

1. Select a provider from the searchable list
2. Filter by category if needed
3. Fill in required credentials (based on provider)
4. Toggle "Store in history" (on by default)
5. Click "Validate"
6. View results including:
   - Validation status (Valid/Invalid/Unknown/Error)
   - Metadata (account info, scopes, permissions)
   - Risk level assessment
   - HTTP status and duration

### 3. History

View past validations with:
- Filtering by provider, status, date
- Pagination
- Detailed view of each validation
- Secret fingerprints (never full secrets)

### 4. Provider Catalog

Browse all supported providers:
- Search by name
- Filter by category
- View required input fields
- See validation methodology

### 5. JWT Decoder

Decode JWT tokens to view:
- Header (algorithm, key ID)
- Payload (claims)
- Signature
- Expiration status
- Issuer, subject, audience

### 6. Custom HTTP Tester

Test custom APIs:
- Configure HTTP method
- Set headers
- Add request body
- Inject credentials in headers, query params, or body
- View response with secret redaction

### 7. Settings

Configure:
- History storage
- Encryption settings
- HTTP proxy (for Burp/ZAP)
- Security preferences

## Adding a New Provider

1. Create a new file in `lib/providers/<category>/` (or add to existing index.ts)

```typescript
import { ProviderDefinition, ProviderCredentials, ValidationResult } from '../../types';
import { safeRequest, isSuccessResponse } from '../../utils/http-client';
import { createValidationResult } from '../base-provider';
import { sanitizeError } from '../../security/redaction';

export const myNewProvider: ProviderDefinition = {
  id: 'my-provider',
  name: 'my-provider',
  displayName: 'My Provider Name',
  category: 'cloud', // or appropriate category
  description: 'Validate My Provider API key',
  inputFields: [
    {
      name: 'api_key',
      label: 'API Key',
      type: 'password',
      required: true,
      placeholder: 'Enter your API key',
      helperText: 'Find this in your account settings',
    },
  ],
  docsUrl: 'https://docs.myprovider.com/api',

  async validate(credentials: ProviderCredentials): Promise<ValidationResult> {
    try {
      const { response, duration } = await safeRequest({
        method: 'GET',
        url: 'https://api.myprovider.com/v1/account',
        headers: {
          Authorization: `Bearer ${credentials.api_key}`,
        },
      });

      if (isSuccessResponse(response.status)) {
        return createValidationResult(
          'valid',
          {
            accountEmail: response.data.email,
            accountId: response.data.id,
            scopes: response.data.scopes,
          },
          undefined,
          JSON.stringify(response.data),
          response.status,
          duration
        );
      }

      return createValidationResult(
        'invalid',
        undefined,
        'Invalid credentials',
        undefined,
        response.status,
        duration
      );
    } catch (error) {
      return createValidationResult('error', undefined, sanitizeError(error));
    }
  },
};
```

2. Export from category index file
3. Import in `lib/providers/registry.ts`
4. Add to providers array

## Security Considerations

### Secret Handling

- **Never logged in plaintext**: All secrets are redacted before logging
- **Fingerprints only**: History stores SHA-256 hashes, not actual secrets
- **Optional encryption**: Enable at-rest encryption in settings
- **Auto-redaction**: Automatic detection and redaction of common secret patterns

### Safe API Calls

All provider validators:
- Use read-only endpoints (GET requests where possible)
- Never create, modify, or delete resources
- Request minimal data (usually account/user info only)
- Include rate limiting and timeouts

### Recommended Practices

1. **Run locally**: Don't expose to the internet
2. **Use strong encryption keys**: Generate secure random keys in production
3. **Enable HTTPS**: Use reverse proxy (nginx, Caddy) with SSL
4. **Regular updates**: Keep dependencies up to date
5. **Audit history**: Review validation logs regularly
6. **Limit access**: Use firewall rules or VPN

### HTTP Proxy Support

Route traffic through security tools:

```env
HTTP_PROXY=http://127.0.0.1:8080
HTTPS_PROXY=http://127.0.0.1:8080
```

Works with Burp Suite, OWASP ZAP, mitmproxy, etc.

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- security.test.ts
```

Tests cover:
- Provider registry functionality
- Secret redaction logic
- JWT decoding
- API validation flow

## Development

```bash
# Install dependencies
npm install

# Run development server with hot reload
npm run dev

# Access Prisma Studio (database GUI)
npm run db:studio

# Generate Prisma client after schema changes
npm run db:generate

# Create database migration
npm run db:migrate

# Format code
npm run lint
```

## Production Deployment

### Docker (Recommended)

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop
docker-compose down
```

### Manual

```bash
# Build production bundle
npm run build

# Start production server
npm start
```

### Reverse Proxy (nginx example)

```nginx
server {
    listen 80;
    server_name apihunter.local;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Test connection
psql $DATABASE_URL

# Reset database
npm run db:push -- --force-reset
```

### Provider Validation Fails

- Check network connectivity
- Verify credentials are correct format
- Review API endpoint documentation
- Check for rate limiting
- Use custom HTTP tester to debug

### Build Errors

```bash
# Clean and reinstall
rm -rf node_modules .next
npm install
npm run build
```

## Contributing

Contributions welcome! To add a provider:

1. Fork the repository
2. Create a provider module (see "Adding a New Provider")
3. Add tests
4. Submit pull request with:
   - Provider implementation
   - Documentation of API endpoints used
   - Example credentials format

## License

This project is provided as-is for security research and testing purposes.

## Credits

Built with:
- Next.js
- React
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- React Query
- Lucide Icons

## Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Review existing provider implementations
- Check documentation at /providers

---

**Remember: Only test credentials you are legally authorized to test.**
