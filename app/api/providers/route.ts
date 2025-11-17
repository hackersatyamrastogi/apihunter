import { NextRequest, NextResponse } from 'next/server';
import {
  getAllProviders,
  getProvider,
  getProvidersByCategory,
  searchProviders,
  getProviderCount,
  PROVIDER_CATEGORIES,
} from '@/lib/providers/registry';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const id = searchParams.get('id');

  try {
    // Get specific provider by ID
    if (id) {
      const provider = getProvider(id);
      if (!provider) {
        return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
      }
      return NextResponse.json({ provider });
    }

    // Search providers
    if (search) {
      const providers = searchProviders(search);
      return NextResponse.json({
        providers,
        count: providers.length,
        total: getProviderCount(),
      });
    }

    // Get providers by category
    if (category) {
      const providers = getProvidersByCategory(category as any);
      return NextResponse.json({
        providers,
        category,
        count: providers.length,
      });
    }

    // Get all providers
    const providers = getAllProviders();
    return NextResponse.json({
      providers,
      categories: PROVIDER_CATEGORIES,
      count: providers.length,
    });
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch providers' },
      { status: 500 }
    );
  }
}
