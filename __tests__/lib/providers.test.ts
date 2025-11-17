import {
  getAllProviders,
  getProvider,
  getProvidersByCategory,
  searchProviders,
  getProviderCount,
  PROVIDER_CATEGORIES,
} from '../../lib/providers/registry';

describe('Provider Registry', () => {
  describe('getAllProviders', () => {
    it('should return all providers', () => {
      const providers = getAllProviders();
      expect(providers.length).toBeGreaterThan(100);
      expect(Array.isArray(providers)).toBe(true);
    });

    it('should return providers with required fields', () => {
      const providers = getAllProviders();
      const provider = providers[0];
      expect(provider).toHaveProperty('id');
      expect(provider).toHaveProperty('name');
      expect(provider).toHaveProperty('displayName');
      expect(provider).toHaveProperty('category');
      expect(provider).toHaveProperty('description');
      expect(provider).toHaveProperty('inputFields');
      expect(provider).toHaveProperty('validate');
    });
  });

  describe('getProvider', () => {
    it('should get provider by ID', () => {
      const provider = getProvider('github');
      expect(provider).toBeDefined();
      expect(provider?.id).toBe('github');
      expect(provider?.name).toBe('github');
    });

    it('should return undefined for non-existent provider', () => {
      const provider = getProvider('non-existent-provider');
      expect(provider).toBeUndefined();
    });
  });

  describe('getProvidersByCategory', () => {
    it('should filter providers by category', () => {
      const cloudProviders = getProvidersByCategory('cloud');
      expect(cloudProviders.length).toBeGreaterThan(0);
      expect(cloudProviders.every(p => p.category === 'cloud')).toBe(true);
    });

    it('should return empty array for invalid category', () => {
      const providers = getProvidersByCategory('invalid' as any);
      expect(providers).toEqual([]);
    });
  });

  describe('searchProviders', () => {
    it('should find providers by name', () => {
      const results = searchProviders('github');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(p => p.id === 'github')).toBe(true);
    });

    it('should search case-insensitively', () => {
      const results = searchProviders('GITHUB');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should search in description', () => {
      const results = searchProviders('token');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('getProviderCount', () => {
    it('should return correct count', () => {
      const count = getProviderCount();
      const providers = getAllProviders();
      expect(count).toBe(providers.length);
      expect(count).toBeGreaterThanOrEqual(100);
    });
  });

  describe('PROVIDER_CATEGORIES', () => {
    it('should have all category metadata', () => {
      expect(PROVIDER_CATEGORIES.length).toBeGreaterThan(0);

      const category = PROVIDER_CATEGORIES[0];
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('description');
    });
  });
});
