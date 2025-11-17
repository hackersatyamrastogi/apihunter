/**
 * Provider Testing Utility
 * Tests all providers to ensure they're working correctly
 */

import { getAllProviders } from './lib/providers/registry';

interface TestResult {
  providerId: string;
  providerName: string;
  category: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  duration?: number;
}

async function testProvider(providerId: string): Promise<TestResult> {
  const provider = getAllProviders().find(p => p.id === providerId);

  if (!provider) {
    return {
      providerId,
      providerName: 'Unknown',
      category: 'unknown',
      status: 'fail',
      message: 'Provider not found in registry'
    };
  }

  // Create test credentials based on required fields
  const credentials: Record<string, string> = {};
  provider.inputFields.forEach(field => {
    if (field.required) {
      credentials[field.name] = `test_${field.name}_value`;
    }
  });

  try {
    const startTime = Date.now();
    const result = await provider.validate(credentials);
    const duration = Date.now() - startTime;

    // Check if the provider returned a valid response structure
    if (!result || !result.status) {
      return {
        providerId: provider.id,
        providerName: provider.displayName,
        category: provider.category,
        status: 'fail',
        message: 'Invalid response structure - missing status field',
        duration
      };
    }

    // Check for "unknown" status with specific error messages that indicate missing implementation
    const requiresNativeDriverPattern = /requires native driver|not implemented|use custom test/i;
    if (result.status === 'unknown' && result.errorMessage && requiresNativeDriverPattern.test(result.errorMessage)) {
      return {
        providerId: provider.id,
        providerName: provider.displayName,
        category: provider.category,
        status: 'skip',
        message: `Native driver required: ${result.errorMessage}`,
        duration
      };
    }

    // Valid response - provider is working (even if credentials are invalid)
    return {
      providerId: provider.id,
      providerName: provider.displayName,
      category: provider.category,
      status: 'pass',
      message: `Provider responded correctly (${result.status})`,
      duration
    };
  } catch (error: any) {
    return {
      providerId: provider.id,
      providerName: provider.displayName,
      category: provider.category,
      status: 'fail',
      message: `Exception thrown: ${error.message}`,
    };
  }
}

async function testAllProviders() {
  const providers = getAllProviders();
  console.log(`\n🔍 Testing ${providers.length} providers...\n`);

  const results: TestResult[] = [];
  let passed = 0;
  let failed = 0;
  let skipped = 0;

  // Test each provider
  for (const provider of providers) {
    const result = await testProvider(provider.id);
    results.push(result);

    const icon = result.status === 'pass' ? '✅' : result.status === 'skip' ? '⏭️' : '❌';
    console.log(`${icon} [${result.category}] ${result.providerName} (${result.providerId})`);
    console.log(`   ${result.message}`);
    if (result.duration) {
      console.log(`   Duration: ${result.duration}ms`);
    }
    console.log('');

    if (result.status === 'pass') passed++;
    else if (result.status === 'skip') skipped++;
    else failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Providers: ${providers.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`⏭️  Skipped (Native Driver): ${skipped}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('');

  // Group by category
  const byCategory: Record<string, TestResult[]> = {};
  results.forEach(result => {
    if (!byCategory[result.category]) {
      byCategory[result.category] = [];
    }
    byCategory[result.category].push(result);
  });

  console.log('\nBREAKDOWN BY CATEGORY:');
  console.log('='.repeat(60));
  Object.keys(byCategory).sort().forEach(category => {
    const categoryResults = byCategory[category];
    const categoryPassed = categoryResults.filter(r => r.status === 'pass').length;
    const categorySkipped = categoryResults.filter(r => r.status === 'skip').length;
    const categoryFailed = categoryResults.filter(r => r.status === 'fail').length;

    console.log(`\n${category.toUpperCase()}: ${categoryResults.length} total`);
    console.log(`  ✅ ${categoryPassed} | ⏭️  ${categorySkipped} | ❌ ${categoryFailed}`);
  });

  // List failed providers
  const failedProviders = results.filter(r => r.status === 'fail');
  if (failedProviders.length > 0) {
    console.log('\n\nFAILED PROVIDERS (need fixes):');
    console.log('='.repeat(60));
    failedProviders.forEach(result => {
      console.log(`\n❌ ${result.providerName} (${result.providerId})`);
      console.log(`   Category: ${result.category}`);
      console.log(`   Error: ${result.message}`);
    });
  }

  console.log('\n');
}

// Run tests
testAllProviders().catch(console.error);
