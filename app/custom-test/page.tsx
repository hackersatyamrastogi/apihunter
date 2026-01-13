'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardBody, CardHeader, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';

interface HeaderPair {
  key: string;
  value: string;
}

interface CustomTestResult {
  success: boolean;
  httpStatus: number;
  headers: Record<string, string>;
  body: string;
  duration: number;
  error?: string;
}

export default function CustomTestPage() {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('GET');
  const [headers, setHeaders] = useState<HeaderPair[]>([]);
  const [body, setBody] = useState('');
  const [credentialLocation, setCredentialLocation] = useState<'header' | 'query' | 'body'>('header');
  const [credentialKey, setCredentialKey] = useState('');
  const [credentialValue, setCredentialValue] = useState('');
  const [result, setResult] = useState<CustomTestResult | null>(null);

  const testMutation = useMutation({
    mutationFn: async () => {
      if (!url.trim()) {
        throw new Error('Please enter a URL');
      }

      const requestHeaders: Record<string, string> = {};
      headers.forEach((h) => {
        if (h.key && h.value) {
          requestHeaders[h.key] = h.value;
        }
      });

      const requestBody = JSON.stringify({
        url: url.trim(),
        method,
        headers: requestHeaders,
        body: body || undefined,
        credentialInjection: credentialKey && credentialValue ? {
          location: credentialLocation,
          key: credentialKey,
          value: credentialValue,
        } : undefined,
      });

      const response = await fetch('/api/custom-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || errorData.error || 'Test failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setResult(data.result);
    },
  });

  const handleAddHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const handleUpdateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const handleRemoveHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'success';
    if (status >= 300 && status < 400) return 'info';
    if (status >= 400 && status < 500) return 'warning';
    return 'error';
  };

  return (
    <div className="bg-background-primary min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-terminal-cyan text-xl">{'>'}</span>
          <h1 className="text-3xl font-bold text-terminal-green uppercase tracking-wider">Custom HTTP Tester</h1>
        </div>
        <p className="text-terminal-cyan mb-8 ml-6">
          Test custom HTTP endpoints with optional credential injection
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Panel - Request Configuration */}
          <div className="md:col-span-2 lg:col-span-2 space-y-6">
            {/* URL and Method */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="text-terminal-cyan">{'>'}</span>
                  <h2 className="text-lg font-semibold text-terminal-green uppercase">Request</h2>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input
                  label="URL"
                  type="url"
                  placeholder="https://api.example.com/endpoint"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />

                <Select
                  label="HTTP Method"
                  options={[
                    { value: 'GET', label: 'GET' },
                    { value: 'POST', label: 'POST' },
                    { value: 'PUT', label: 'PUT' },
                    { value: 'DELETE', label: 'DELETE' },
                    { value: 'PATCH', label: 'PATCH' },
                  ]}
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                />
              </CardBody>
            </Card>

            {/* Headers */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-terminal-cyan">{'>'}</span>
                    <h2 className="text-lg font-semibold text-terminal-green uppercase">Headers</h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddHeader}
                    className="flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Add Header
                  </Button>
                </div>
              </CardHeader>
              <CardBody className="space-y-3">
                {headers.length === 0 ? (
                  <p className="text-text-muted text-sm">No headers added yet</p>
                ) : (
                  headers.map((header, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
                      <Input
                        placeholder="Header name"
                        aria-label={`Header ${index + 1} name`}
                        value={header.key}
                        onChange={(e) => handleUpdateHeader(index, 'key', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Header value"
                        aria-label={`Header ${index + 1} value`}
                        value={header.value}
                        onChange={(e) => handleUpdateHeader(index, 'value', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveHeader(index)}
                        aria-label={`Remove header ${index + 1}`}
                        className="self-end sm:self-auto"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </Button>
                    </div>
                  ))
                )}
              </CardBody>
            </Card>

            {/* Body */}
            {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="text-terminal-cyan">{'>'}</span>
                    <h2 className="text-lg font-semibold text-terminal-green uppercase">Body</h2>
                  </div>
                </CardHeader>
                <CardBody>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="JSON or form data..."
                    className="w-full px-4 py-3 rounded border border-terminal-green bg-surface-primary text-terminal-green placeholder-text-dim focus:outline-none focus:border-terminal-cyan focus:ring-1 focus:ring-terminal-cyan focus:shadow-lg focus:shadow-terminal-cyan/50 font-mono text-sm min-h-32 resize-none"
                  />
                </CardBody>
              </Card>
            )}
          </div>

          {/* Right Panel - Credential Injection */}
          <div className="md:col-span-2 lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="text-terminal-red">{'>'}</span>
                  <h2 className="text-lg font-semibold text-terminal-red uppercase">Injection</h2>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                <Select
                  label="Injection Location"
                  options={[
                    { value: 'header', label: 'Header' },
                    { value: 'query', label: 'Query Parameter' },
                    { value: 'body', label: 'Body (JSON)' },
                  ]}
                  value={credentialLocation}
                  onChange={(e) => setCredentialLocation(e.target.value as any)}
                />

                <Input
                  label="Credential Key"
                  placeholder="e.g., Authorization"
                  value={credentialKey}
                  onChange={(e) => setCredentialKey(e.target.value)}
                />

                <Input
                  label="Credential Value"
                  type="password"
                  placeholder="e.g., Bearer token..."
                  value={credentialValue}
                  onChange={(e) => setCredentialValue(e.target.value)}
                />

                <Button
                  variant="primary"
                  onClick={() => testMutation.mutate()}
                  isLoading={testMutation.isPending}
                  disabled={testMutation.isPending || !url.trim()}
                  className="w-full uppercase tracking-wider"
                >
                  {'>'} SEND
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Error State */}
        {testMutation.isError && (
          <Card className="mt-8 border-terminal-red">
            <CardBody>
              <div className="flex gap-3">
                <AlertCircle className="text-terminal-red flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold text-terminal-red uppercase mb-1">[error]</h3>
                  <p className="text-terminal-green text-sm font-mono">
                    {testMutation.error instanceof Error
                      ? testMutation.error.message
                      : 'An error occurred'}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Results */}
        {result && (
          <div className="mt-8 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-terminal-cyan">{'>'}</span>
                    <h2 className="text-lg font-semibold text-terminal-green uppercase">Response</h2>
                  </div>
                  <Badge
                    variant={getStatusColor(result.httpStatus) as any}
                    size="md"
                    className="uppercase tracking-wider font-mono"
                  >
                    [{result.httpStatus}]
                  </Badge>
                </div>
              </CardHeader>
              <CardBody className="grid grid-cols-2 gap-4 text-sm font-mono">
                <div>
                  <p className="text-terminal-cyan mb-1 uppercase">[time]</p>
                  <p className="text-terminal-green">{result.duration}ms</p>
                </div>
                <div>
                  <p className="text-terminal-cyan mb-1 uppercase">[status]</p>
                  <p className="text-terminal-green">{result.success ? 'OK' : 'FAIL'}</p>
                </div>
              </CardBody>
            </Card>

            {/* Response Headers */}
            {Object.keys(result.headers).length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="text-terminal-cyan">{'>'}</span>
                    <h2 className="text-lg font-semibold text-terminal-green uppercase">Headers</h2>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-sm">
                    {Object.entries(result.headers).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-terminal-green">{key}:</span>
                        <span className="text-terminal-cyan">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Response Body */}
            {result.body && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="text-terminal-cyan">{'>'}</span>
                    <h2 className="text-lg font-semibold text-terminal-green uppercase">Body</h2>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="bg-surface-secondary p-4 rounded font-mono text-sm text-terminal-green break-all max-h-80 overflow-y-auto border border-terminal-green/30">
                    <pre>{result.body}</pre>
                  </div>
                </CardBody>
              </Card>
            )}

            {result.error && (
              <Card className="border-terminal-yellow">
                <CardBody>
                  <div className="flex gap-3">
                    <AlertCircle className="text-terminal-yellow flex-shrink-0" size={20} />
                    <div>
                      <h3 className="font-semibold text-terminal-yellow uppercase mb-1">[warning]</h3>
                      <p className="text-terminal-green text-sm font-mono">{result.error}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
