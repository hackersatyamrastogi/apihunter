import {
  redactSecrets,
  redactObjectSecrets,
  createSecretFingerprint,
  partialReveal,
} from '../../lib/security/redaction';

describe('Security Redaction', () => {
  describe('redactSecrets', () => {
    it('should redact long API keys', () => {
      const text = 'API key: test_key_abcdefghijklmnopqrstuvwxyz1234567890';
      const redacted = redactSecrets(text);
      expect(redacted).toContain('[REDACTED]');
      expect(redacted).not.toContain('abcdefghijklmnopqrstuvwxyz');
    });

    it('should preserve short strings', () => {
      const text = 'Short text here';
      const redacted = redactSecrets(text);
      expect(redacted).toBe(text);
    });

    it('should redact Bearer tokens', () => {
      const text = 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abcdef';
      const redacted = redactSecrets(text);
      expect(redacted).toContain('[REDACTED]');
    });
  });

  describe('redactObjectSecrets', () => {
    it('should redact password fields', () => {
      const obj = { username: 'admin', password: 'secret123' };
      const redacted = redactObjectSecrets(obj);
      expect((redacted as any).password).toBe('[REDACTED]');
      expect((redacted as any).username).toBe('admin');
    });

    it('should redact nested objects', () => {
      const obj = {
        user: {
          name: 'John',
          api_key: 'sk_test_1234567890',
        },
      };
      const redacted = redactObjectSecrets(obj);
      expect((redacted as any).user.api_key).toBe('[REDACTED]');
      expect((redacted as any).user.name).toBe('John');
    });
  });

  describe('createSecretFingerprint', () => {
    it('should create consistent fingerprints', () => {
      const secret = 'my_secret_key';
      const fp1 = createSecretFingerprint(secret);
      const fp2 = createSecretFingerprint(secret);
      expect(fp1).toBe(fp2);
    });

    it('should create different fingerprints for different secrets', () => {
      const fp1 = createSecretFingerprint('secret1');
      const fp2 = createSecretFingerprint('secret2');
      expect(fp1).not.toBe(fp2);
    });

    it('should return a 64-character hex string', () => {
      const fp = createSecretFingerprint('test');
      expect(fp).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('partialReveal', () => {
    it('should show first and last characters', () => {
      const secret = 'abcdefghijklmnop';
      const revealed = partialReveal(secret, 4);
      expect(revealed).toMatch(/^abcd\*+mnop$/);
    });

    it('should handle short secrets', () => {
      const secret = 'abc';
      const revealed = partialReveal(secret);
      expect(revealed).toBe('[REDACTED]');
    });
  });
});
