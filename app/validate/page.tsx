'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardBody, CardHeader, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge, SuccessBadge, ErrorBadge, WarningBadge } from '@/components/ui/Badge';
import { AlertCircle, CheckCircle, AlertTriangle, Search } from 'lucide-react';
import { ProviderDefinition, ValidationResult, ProviderInputField } from '@/lib/types';

export default function ValidatePage() {
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [storeInHistory, setStoreInHistory] = useState(true);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // Fetch all providers
  const { data: providersData, isLoading: providersLoading } = useQuery({
    queryKey: ['providers'],
    queryFn: async () => {
      const res = await fetch('/api/providers');
      return res.json();
    },
  });

  // Filter providers based on search and category
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
        p.description.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [providersData?.providers, selectedCategory, searchTerm]);

  // Get selected provider definition
  const selectedProvider = useMemo(() => {
    return providersData?.providers.find((p: ProviderDefinition) => p.id === selectedProviderId);
  }, [providersData?.providers, selectedProviderId]);

  // Validation mutation
  const validationMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProviderId) {
        throw new Error('Please select a provider');
      }

      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: selectedProviderId,
          credentials,
          storeInHistory,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Validation failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setValidationResult(data.result);
    },
  });

  const handleInputChange = (fieldName: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleValidate = () => {
    validationMutation.mutate();
  };

  const getRiskColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const categories = providersData?.categories || [];

  return (
    <div className="bg-background-primary min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-terminal-cyan text-xl">{'>'}</span>
          <h1 className="text-3xl font-bold text-terminal-green uppercase tracking-wider">Key Validation Scan</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Provider Selection */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="text-terminal-cyan">{'>'}</span>
                  <h2 className="text-lg font-semibold text-terminal-green uppercase">Provider</h2>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
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

                {/* Provider List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {providersLoading ? (
                    <p className="text-text-muted text-sm">Loading providers...</p>
                  ) : filteredProviders.length === 0 ? (
                    <p className="text-text-muted text-sm">No providers found</p>
                  ) : (
                    filteredProviders.map((provider: ProviderDefinition) => (
                      <button
                        key={provider.id}
                        onClick={() => {
                          setSelectedProviderId(provider.id);
                          setValidationResult(null);
                          setCredentials({});
                        }}
                        className={`w-full text-left px-3 py-2 rounded transition-all ${
                          selectedProviderId === provider.id
                            ? 'bg-terminal-green bg-opacity-10 text-terminal-green border-l-2 border-terminal-green'
                            : 'hover:bg-surface-secondary hover:border-l-2 hover:border-terminal-cyan text-terminal-cyan'
                        }`}
                      >
                        <div className="font-medium text-sm">{provider.displayName}</div>
                        <div className="text-xs text-text-muted mt-0.5 opacity-75">{provider.category}</div>
                      </button>
                    ))
                  )}
                </div>

                {selectedProvider && (
                  <div className="pt-2 border-t border-terminal-green">
                    <p className="text-sm text-terminal-cyan">{selectedProvider.description}</p>
                    {selectedProvider.docsUrl && (
                      <a
                        href={selectedProvider.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-terminal-green hover:text-terminal-cyan hover:underline text-sm mt-2 inline-block font-mono"
                      >
                        [docs]
                      </a>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Credentials Form */}
            {selectedProvider && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="text-terminal-cyan">{'>'}</span>
                    <h2 className="text-lg font-semibold text-terminal-green uppercase">
                      {selectedProvider.displayName}
                    </h2>
                  </div>
                </CardHeader>
                <CardBody className="space-y-4">
                  {selectedProvider.inputFields.map((field: ProviderInputField) => (
                    <Input
                      key={field.name}
                      label={field.label}
                      type={field.type === 'password' ? 'password' : 'text'}
                      placeholder={field.placeholder}
                      helperText={field.helperText}
                      value={credentials[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                    />
                  ))}

                  {/* Store in History Toggle */}
                  <div className="flex items-center gap-3 pt-2 border-t border-terminal-green">
                    <input
                      type="checkbox"
                      id="storeInHistory"
                      checked={storeInHistory}
                      onChange={(e) => setStoreInHistory(e.target.checked)}
                      className="w-4 h-4 rounded cursor-pointer accent-terminal-green"
                    />
                    <label htmlFor="storeInHistory" className="cursor-pointer text-terminal-green text-sm uppercase">
                      [save to history]
                    </label>
                  </div>
                </CardBody>
                <CardFooter>
                  <Button
                    variant="primary"
                    onClick={handleValidate}
                    isLoading={validationMutation.isPending}
                    disabled={validationMutation.isPending}
                    className="uppercase tracking-wider"
                  >
                    {'>'} EXECUTE SCAN
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* Validation Results */}
            {validationResult && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-terminal-cyan">{'>'}</span>
                      <h2 className="text-lg font-semibold text-terminal-green uppercase">Results</h2>
                    </div>
                    <div>
                      {validationResult.status === 'valid' && (
                        <Badge variant="success" size="md" className="flex items-center gap-2">
                          <CheckCircle size={14} />
                          Valid
                        </Badge>
                      )}
                      {validationResult.status === 'invalid' && (
                        <Badge variant="error" size="md" className="flex items-center gap-2">
                          <AlertCircle size={14} />
                          Invalid
                        </Badge>
                      )}
                      {validationResult.status === 'unknown' && (
                        <Badge variant="default" size="md" className="flex items-center gap-2">
                          <AlertTriangle size={14} />
                          Unknown
                        </Badge>
                      )}
                      {validationResult.status === 'error' && (
                        <Badge variant="error" size="md" className="flex items-center gap-2">
                          <AlertCircle size={14} />
                          Error
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardBody className="space-y-4">
                  {validationResult.status !== 'valid' && validationResult.errorMessage && (
                    <div className="border-l-4 border-terminal-red pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-terminal-red">!</span>
                        <h3 className="font-semibold text-terminal-red uppercase">Error</h3>
                      </div>
                      <p className="text-terminal-green text-sm bg-surface-secondary p-3 rounded border border-terminal-red/50 font-mono">
                        {validationResult.errorMessage}
                      </p>
                    </div>
                  )}

                  {validationResult.riskLevel && (
                    <div className="border-l-4 border-terminal-yellow pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-terminal-yellow">*</span>
                        <h3 className="font-semibold text-terminal-yellow uppercase">Risk Level</h3>
                      </div>
                      <Badge variant={getRiskColor(validationResult.riskLevel) as any} size="md" className="uppercase tracking-wider font-mono">
                        [{validationResult.riskLevel}]
                      </Badge>
                    </div>
                  )}

                  {validationResult.riskHints && validationResult.riskHints.length > 0 && (
                    <div className="border-l-4 border-terminal-yellow pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-terminal-yellow">[!]</span>
                        <h3 className="font-semibold text-terminal-yellow uppercase">Indicators</h3>
                      </div>
                      <ul className="space-y-1 ml-4">
                        {validationResult.riskHints.map((hint, idx) => (
                          <li key={idx} className="flex gap-2 text-sm text-terminal-green font-mono terminal-line">
                            {hint}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validationResult.metadata && Object.keys(validationResult.metadata).length > 0 && (
                    <div className="border-l-4 border-terminal-cyan pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-terminal-cyan">@</span>
                        <h3 className="font-semibold text-terminal-cyan uppercase">Account Info</h3>
                      </div>
                      <div className="space-y-1 text-sm font-mono">
                        {Object.entries(validationResult.metadata).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-terminal-green">{key}:</span>
                            <span className="text-terminal-cyan">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-sm font-mono border-t border-terminal-green pt-2">
                    {validationResult.httpStatus && (
                      <div>
                        <span className="text-terminal-green">[http]</span>
                        <span className="ml-2 text-terminal-cyan">{validationResult.httpStatus}</span>
                      </div>
                    )}
                    {validationResult.requestDuration && (
                      <div>
                        <span className="text-terminal-green">[time]</span>
                        <span className="ml-2 text-terminal-cyan">{validationResult.requestDuration}ms</span>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            )}

            {validationMutation.isError && (
              <Card className="border-terminal-red">
                <CardBody>
                  <div className="flex gap-3">
                    <AlertCircle className="text-terminal-red flex-shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-terminal-red uppercase mb-1">[error]</h3>
                      <p className="text-terminal-green text-sm font-mono">
                        {validationMutation.error instanceof Error
                          ? validationMutation.error.message
                          : 'An error occurred during validation'}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
