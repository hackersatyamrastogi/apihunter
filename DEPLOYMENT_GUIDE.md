# APIHunter Deployment Guide

## Quick Start

### 1. Local Development

```bash
# Navigate to project directory
cd /Users/satyamrastogi/Documents/Claude/apihunter

# Install dependencies (already done)
npm install

# Set up environment variables
cp .env.example .env

# Edit .env with your settings
# IMPORTANT: Change ENCRYPTION_KEY and SECRET_FINGERPRINT_SALT in production!

# Generate Prisma client (already done)
npx prisma generate

# Start PostgreSQL (you'll need this)
# Option A: Using Docker
docker run --name apihunter-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=apihunter -p 5432:5432 -d postgres:15-alpine

# Option B: Using existing PostgreSQL
# Update DATABASE_URL in .env with your connection string

# Push database schema
npx prisma db push

# Start development server
npm run dev

# Access at http://localhost:3000
```

### 2. Docker Deployment (Recommended for Production)

```bash
# Make sure you've configured .env properly
# CRITICAL: Set strong ENCRYPTION_KEY and SECRET_FINGERPRINT_SALT

# Build and start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop
docker-compose down

# Access at http://localhost:3000
```

## Database Setup

### Using Docker PostgreSQL

```bash
# Start PostgreSQL container
docker run -d \
  --name apihunter-db \
  -e POSTGRES_USER=apihunter \
  -e POSTGRES_PASSWORD=secure_password \
  -e POSTGRES_DB=apihunter \
  -p 5432:5432 \
  postgres:15-alpine

# Update .env
DATABASE_URL="postgresql://apihunter:secure_password@localhost:5432/apihunter?schema=public"
```

### Using Existing PostgreSQL

Update your `.env` with the connection string:

```env
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
```

Then push the schema:

```bash
npx prisma db push
```

## Environment Configuration

### Minimum Required Configuration

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/apihunter"

# Security (CHANGE THESE!)
ENCRYPTION_KEY="$(openssl rand -base64 32)"
SECRET_FINGERPRINT_SALT="$(openssl rand -hex 32)"
```

### Full Configuration Options

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/apihunter?schema=public"

# Application
NODE_ENV="production"
PORT=3000

# Security - CRITICAL: Generate secure random values!
ENCRYPTION_KEY="your-secure-32-character-key"  # Generate with: openssl rand -base64 32
SECRET_FINGERPRINT_SALT="your-secure-salt"     # Generate with: openssl rand -hex 32

# Features
ENABLE_HISTORY=true        # Set to false to disable history
ENABLE_ENCRYPTION=true     # Always true in production

# HTTP Proxy (optional - for Burp/ZAP)
HTTP_PROXY=""
HTTPS_PROXY=""

# Rate Limiting (optional)
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

## Security Hardening

### 1. Generate Secure Keys

```bash
# Encryption key (32 bytes base64)
openssl rand -base64 32

# Salt (64 hex characters)
openssl rand -hex 32
```

Add these to your `.env` file.

### 2. Network Security

#### Option A: Local Only (Most Secure)

Bind to localhost only:

```bash
# In package.json, modify dev script:
"dev": "next dev -H 127.0.0.1"

# Or use environment variable:
HOST=127.0.0.1 npm run dev
```

#### Option B: Reverse Proxy with Authentication

Use nginx or Caddy with HTTP Basic Auth:

**nginx configuration:**

```nginx
server {
    listen 443 ssl http2;
    server_name apihunter.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Basic authentication
    auth_basic "APIHunter - Authorized Access Only";
    auth_basic_user_file /etc/nginx/.htpasswd;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Create `.htpasswd` file:

```bash
sudo apt-get install apache2-utils
sudo htpasswd -c /etc/nginx/.htpasswd admin
```

#### Option C: VPN/Tailscale Access

Deploy on a VPN-only network using Tailscale or similar.

### 3. Firewall Configuration

```bash
# Allow only from specific IP
sudo ufw allow from 192.168.1.0/24 to any port 3000

# Or allow from VPN subnet
sudo ufw allow from 10.0.0.0/8 to any port 3000
```

## Production Deployment

### Option 1: Docker Compose (Recommended)

1. Clone repository on server
2. Configure `.env` with production values
3. Run:

```bash
docker-compose up -d
```

4. Set up nginx reverse proxy (see above)
5. Configure SSL with Let's Encrypt:

```bash
sudo certbot --nginx -d apihunter.yourdomain.com
```

### Option 2: Manual Node.js Deployment

1. Install Node.js 18+ on server
2. Install PostgreSQL
3. Clone repository and configure
4. Build and run:

```bash
npm install
npx prisma generate
npx prisma db push
npm run build
npm start
```

5. Use PM2 for process management:

```bash
npm install -g pm2
pm2 start npm --name "apihunter" -- start
pm2 save
pm2 startup
```

### Option 3: Platform Deployment

Not recommended for sensitive tools, but possible on:
- Vercel (configure environment variables)
- Railway
- Render
- Fly.io

**Warning:** Only deploy on trusted platforms with proper security.

## Running with HTTP Proxy (Burp/ZAP)

To route all validation requests through a proxy:

```env
HTTP_PROXY=http://127.0.0.1:8080
HTTPS_PROXY=http://127.0.0.1:8080
```

Then configure your proxy (Burp Suite, OWASP ZAP, etc.) to listen on port 8080.

**Security Note:** The proxy will see all API requests including credentials. Only use on trusted, local machines.

## Backup and Maintenance

### Database Backups

```bash
# Backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup-20240101.sql
```

### Automated Backups

Create cron job:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2am
0 2 * * * pg_dump postgresql://user:pass@localhost:5432/apihunter > /backups/apihunter-$(date +\%Y\%m\%d).sql
```

### Log Rotation

Logs are printed to stdout. Use Docker logging driver or systemd:

```bash
# Docker with log rotation
docker run -d \
  --log-driver=json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  apihunter
```

## Monitoring

### Health Check Endpoint

Add to `app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Database connection failed',
      },
      { status: 503 }
    );
  }
}
```

### Monitoring with Uptime Kuma

```bash
docker run -d \
  --name uptime-kuma \
  -p 3001:3001 \
  -v uptime-kuma:/app/data \
  louislam/uptime-kuma:1
```

Access at http://localhost:3001 and add health check monitor.

## Troubleshooting

### Build Fails

```bash
# Clean and rebuild
rm -rf node_modules .next
npm install
npx prisma generate
npm run build
```

### Database Connection Errors

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Test connection
psql "$DATABASE_URL"

# Reset database
npx prisma db push --force-reset
```

### Provider Validation Issues

1. Check network connectivity
2. Verify API endpoints are accessible
3. Use Custom HTTP Tester to debug
4. Check proxy settings if using HTTP_PROXY

### Permission Errors

```bash
# Fix ownership (Docker)
sudo chown -R $(id -u):$(id -g) .

# Fix Prisma permissions
chmod +x node_modules/.bin/prisma
```

## Performance Optimization

### Database Indexes

Already configured in `prisma/schema.prisma`. For high-volume usage, consider:

```sql
-- Add index on validation fingerprints
CREATE INDEX idx_validation_fingerprint ON "Validation"(secret_fingerprint);

-- Add index on created_at for faster time-based queries
CREATE INDEX idx_validation_created_at_desc ON "Validation"(created_at DESC);
```

### Caching

For provider catalog (rarely changes):

```bash
# Install Redis
docker run -d -p 6379:6379 redis:alpine

# Update code to cache provider list
```

### Rate Limiting

Add rate limiting middleware to protect APIs:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimit = new Map();

export function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const max = 100;

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, []);
  }

  const requests = rateLimit.get(ip).filter((time: number) => time > now - windowMs);

  if (requests.length >= max) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  requests.push(now);
  rateLimit.set(ip, requests);

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

## Security Checklist

Before going to production:

- [ ] Changed ENCRYPTION_KEY from default
- [ ] Changed SECRET_FINGERPRINT_SALT from default
- [ ] Using HTTPS (reverse proxy with SSL)
- [ ] Enabled authentication (HTTP Basic Auth or better)
- [ ] Restricted network access (firewall/VPN)
- [ ] Database credentials are strong
- [ ] Database backups configured
- [ ] Logs are being rotated
- [ ] Monitoring/health checks configured
- [ ] Rate limiting enabled
- [ ] Tested all core functionality
- [ ] Reviewed provider permissions
- [ ] Documented access procedures

## Updates and Maintenance

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update all
npm update

# Update specific package
npm install package@latest

# Rebuild after updates
npm run build
```

### Database Migrations

When schema changes:

```bash
# Create migration
npx prisma migrate dev --name description

# Apply to production
npx prisma migrate deploy
```

### Rolling Back

```bash
# Git revert
git log --oneline
git revert <commit-hash>

# Database rollback
# Restore from backup (see Backup section)
```

---

## Support and Resources

- **Documentation**: See README.md
- **Security**: See SECURITY.md
- **Provider List**: Access `/providers` in the UI
- **API Documentation**: Available in code comments

For issues or questions, review the codebase or consult the documentation.
