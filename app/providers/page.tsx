'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { ExternalLink, Search } from 'lucide-react';
import { ProviderDefinition } from '@/lib/types';

export default function ProvidersPage() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Fetch all providers
  const { data: providersData, isLoading, error } = useQuery({
    queryKey: ['providers'],
    queryFn: async () => {
      const res = await fetch('/api/providers');
      if (!res.ok) throw new Error('Failed to fetch providers');
      return res.json();
    },
  });

  // Filter providers
  const filteredProviders = useMemo(() => {
    if (!providersData?.providers) return [];

    let filtered = providersData.providers;

    if (selectedCategory) {
      filtered = filtered.filter((p: ProviderDefinition) => p.category === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((p: ProviderDefinition) =>
        p.displayName.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [providersData?.providers, selectedCategory, searchTerm]);

  const categories = providersData?.categories || [];

  return (
    <div className="bg-background-primary min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-terminal-cyan text-xl">{'>'}</span>
            <h1 className="text-3xl font-bold text-terminal-green uppercase tracking-wider">Provider Catalog</h1>
          </div>
          <p className="text-terminal-cyan ml-6">
            Browse all available API providers and their validation methods
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="text"
                  placeholder="Search providers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-surface-secondary border border-terminal-green rounded text-terminal-green placeholder-text-dim focus:outline-none focus:border-terminal-cyan focus:shadow-lg focus:shadow-terminal-cyan/50"
                />
              </div>

              {/* Category Filter */}
              <Select
                label="Category"
                options={[
                  { value: '', label: 'All Categories' },
                  ...categories.map((cat: any) => ({
                    value: cat.id,
                    label: cat.name,
                  })),
                ]}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              />
            </div>
          </CardBody>
        </Card>

        {/* Results */}
        {error && (
          <Card className="bg-red-900 bg-opacity-20 border-red-500 mb-8">
            <CardBody>
              <p className="text-accent-error">Failed to load providers. Please try again.</p>
            </CardBody>
          </Card>
        )}

        {isLoading && (
          <Card>
            <CardBody className="text-center py-12">
              <p className="text-text-muted">Loading providers...</p>
            </CardBody>
          </Card>
        )}

        {!isLoading && filteredProviders.length === 0 && (
          <Card>
            <CardBody className="text-center py-12">
              <p className="text-text-muted">No providers found matching your criteria</p>
            </CardBody>
          </Card>
        )}

        {!isLoading && filteredProviders.length > 0 && (
          <>
            {/* Provider Count */}
            <div className="mb-4 text-sm text-terminal-cyan font-mono">
              [{filteredProviders.length} of {providersData?.count || 0} providers]
            </div>

            {/* Provider Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProviders.map((provider: ProviderDefinition) => (
                <Card key={provider.id} hoverable className="group hover:shadow-lg hover:shadow-terminal-green/50 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-terminal-green uppercase flex-1 font-mono">
                        {provider.displayName}
                      </h3>
                      {provider.docsUrl && (
                        <a
                          href={provider.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-terminal-cyan hover:text-terminal-green flex-shrink-0 mt-0.5 transition-colors"
                          title="View documentation"
                        >
                          <ExternalLink size={18} />
                        </a>
                      )}
                    </div>
                    <Badge size="sm" className="badge-valid uppercase tracking-wider font-mono text-xs">
                      [{provider.category}]
                    </Badge>
                  </CardHeader>

                  <CardBody className="space-y-4">
                    <p className="text-terminal-cyan text-sm">
                      {provider.description}
                    </p>

                    {provider.inputFields.length > 0 && (
                      <div className="border-t border-terminal-green pt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-terminal-cyan">{'>'}</span>
                          <h4 className="font-semibold text-terminal-green text-sm uppercase">Fields</h4>
                        </div>
                        <div className="space-y-1.5 ml-4">
                          {provider.inputFields.map((field) => (
                            <div
                              key={field.name}
                              className="flex items-center gap-2 text-sm terminal-line"
                            >
                              <span className="text-terminal-cyan">{field.label}</span>
                              {field.required && (
                                <span className="text-terminal-red ml-1 font-bold">*</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardBody>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
