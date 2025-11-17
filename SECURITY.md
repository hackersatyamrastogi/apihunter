# Security Policy

## Purpose

APIHunter is designed for **authorized security testing only**. This tool helps security researchers validate API keys discovered during:

- Authorized penetration testing engagements
- Bug bounty programs
- Internal security assessments
- Security research with proper authorization

## Responsible Use

### DO:
- Only test credentials you are legally authorized to test
- Use for security research and defensive purposes
- Run in isolated, secure environments
- Keep the tool and dependencies updated
- Use strong encryption keys in production
- Enable all security features (history encryption, secret redaction)
- Review and understand the code before use

### DO NOT:
- Test credentials without authorization
- Use for malicious purposes
- Expose the tool to the public internet
- Store unencrypted secrets
- Disable security features
- Use default encryption keys in production
- Share validation results containing sensitive data

## Security Features

### 1. Secret Redaction
- Automatic detection and redaction of common secret patterns
- Sensitive field names (password, token, key, etc.) always redacted
- Configurable redaction patterns

### 2. Fingerprint-Only Storage
- Secrets never stored in plaintext
- SHA-256 fingerprints with salt for deduplication
- Optional: disable history storage completely

### 3. Encryption at Rest
- Optional database-level encryption
- Configurable encryption keys
- Use environment variables for key management

### 4. Safe API Calls
- Read-only endpoints only
- No destructive operations
- Rate limiting and timeouts
- HTTP proxy support for monitoring

### 5. Audit Trail
- All validations logged (with redacted secrets)
- Timestamped history
- Filterable and searchable

## Configuration Hardening

### Production Checklist

- [ ] Change default encryption keys
- [ ] Use strong, random ENCRYPTION_KEY (32+ characters)
- [ ] Use strong, random SECRET_FINGERPRINT_SALT
- [ ] Enable HTTPS (reverse proxy)
- [ ] Restrict network access (firewall/VPN)
- [ ] Use environment variables (never commit secrets)
- [ ] Enable database encryption
- [ ] Regular security updates
- [ ] Monitor access logs
- [ ] Implement authentication (if needed)

### Environment Variables

```env
# REQUIRED: Change these in production
ENCRYPTION_KEY="<generate-secure-random-32-char-key>"
SECRET_FINGERPRINT_SALT="<generate-secure-random-salt>"

# Database (use strong credentials)
DATABASE_URL="postgresql://user:password@localhost:5432/apihunter"

# Optional: Disable features
ENABLE_HISTORY=false  # Disable if you don't need history
ENABLE_ENCRYPTION=true  # Always true in production
```

### Generate Secure Keys

```bash
# Linux/Mac - Generate encryption key
openssl rand -base64 32

# Generate salt
openssl rand -hex 32
```

## Network Security

### Local-Only Deployment (Recommended)

Run on localhost only:
```bash
# In Next.js config
npm run dev -- -H 127.0.0.1
```

### Reverse Proxy with Authentication

Use nginx/Caddy with HTTP Basic Auth:

```nginx
server {
    listen 443 ssl;
    server_name apihunter.internal;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    auth_basic "Restricted Access";
    auth_basic_user_file /etc/nginx/.htpasswd;

    location / {
        proxy_pass http://127.0.0.1:3000;
    }
}
```

### VPN/Tailscale Access

Restrict access to VPN network only.

## HTTP Proxy Configuration

Route through security tools for monitoring:

```env
HTTP_PROXY=http://127.0.0.1:8080
HTTPS_PROXY=http://127.0.0.1:8080
```

**Warning**: Burp/ZAP will see all requests including credentials. Ensure proxy is on trusted machine.

## Data Retention

### History Data

- Stored: Status, metadata, fingerprints, timestamps
- NOT stored: Actual secrets/credentials
- Retention: Configure based on needs
- Deletion: Manual via database or disable history

### Logs

- Application logs: Secrets automatically redacted
- Access logs: Review and rotate regularly
- Database logs: May contain query patterns

## Incident Response

If credentials are exposed:

1. **Immediate**: Rotate/revoke exposed credentials
2. **Investigate**: Check validation history for scope
3. **Audit**: Review access logs
4. **Notify**: Inform credential owners if required
5. **Remediate**: Update security controls

## Reporting Security Issues

**Do NOT open public issues for security vulnerabilities.**

Instead:
1. Email security contact privately
2. Provide detailed description
3. Include reproduction steps
4. Allow time for patch before disclosure

## Compliance Considerations

### GDPR/Privacy
- Validation metadata may contain PII (emails, names)
- Implement data retention policies
- Provide data deletion mechanisms
- Document data processing activities

### Industry Standards
- Follow OWASP guidelines
- Implement least privilege access
- Regular security assessments
- Maintain audit trails

## Dependencies

### Security Updates

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Update dependencies
npm update
```

### Trusted Sources
- All dependencies from npm registry
- Review package.json for unexpected packages
- Use lock files (package-lock.json)

## Code Review

Before deploying:
1. Review provider implementations
2. Check for hardcoded secrets
3. Verify input validation
4. Test error handling
5. Audit logging configuration

## Monitoring

### What to Monitor
- Failed validation attempts
- Unusual provider patterns
- Database access patterns
- Error rates
- Response times

### Alerting
- Set up alerts for anomalies
- Monitor for brute force patterns
- Track database size growth

## Backup and Recovery

### Database Backups
```bash
# Backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### Encryption Key Management
- Store keys securely (KMS, Vault, etc.)
- Never commit to version control
- Implement key rotation policy
- Have backup/recovery plan

## Legal Disclaimer

This tool is provided "as-is" without warranty. Users are solely responsible for:
- Ensuring legal authorization for testing
- Compliance with applicable laws
- Proper handling of discovered credentials
- Any damages or consequences from use

By using this tool, you acknowledge:
- You have proper authorization
- You understand the risks
- You accept full responsibility
- You will use ethically and legally

---

**Summary**: Use APIHunter responsibly, securely, and legally. It's a powerful tool for defense—don't misuse it.
