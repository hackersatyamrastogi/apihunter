'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Badge, SuccessBadge, ErrorBadge, WarningBadge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

interface ValidationRecord {
  id: string;
  providerId: string;
  status: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
  errorSummary?: string;
  httpStatus?: number;
  requestDuration?: number;
  provider?: {
    id: string;
    displayName: string;
    category: string;
  };
}

export default function HistoryPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);

  // Fetch validation history
  const { data: historyData, isLoading, error } = useQuery({
    queryKey: ['history', filterStatus, limit, offset],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
      });

      if (filterStatus) {
        params.append('status', filterStatus);
      }

      const res = await fetch(`/api/history?${params}`);
      if (!res.ok) throw new Error('Failed to fetch history');
      return res.json();
    },
  });

  const validations: ValidationRecord[] = historyData?.validations || [];
  const pagination = historyData?.pagination || {};

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <SuccessBadge>Valid</SuccessBadge>;
      case 'invalid':
        return <ErrorBadge>Invalid</ErrorBadge>;
      case 'unknown':
        return <WarningBadge>Unknown</WarningBadge>;
      case 'error':
        return <ErrorBadge>Error</ErrorBadge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="bg-background-primary min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-terminal-cyan text-xl">{'>'}</span>
          <h1 className="text-3xl font-bold text-terminal-green uppercase tracking-wider">Validation History</h1>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardBody>
            <div className="flex gap-4 items-end">
              <div className="flex-1 max-w-xs">
                <Select
                  label="Filter by Status"
                  options={[
                    { value: '', label: 'All Status' },
                    { value: 'valid', label: 'Valid' },
                    { value: 'invalid', label: 'Invalid' },
                    { value: 'unknown', label: 'Unknown' },
                    { value: 'error', label: 'Error' },
                  ]}
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setOffset(0);
                  }}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Results */}
        {error && (
          <Card className="bg-red-900 bg-opacity-20 border-red-500">
            <CardBody>
              <p className="text-accent-error">Failed to load history. Please try again.</p>
            </CardBody>
          </Card>
        )}

        {isLoading && (
          <Card>
            <CardBody className="text-center py-8">
              <p className="text-text-muted">Loading history...</p>
            </CardBody>
          </Card>
        )}

        {!isLoading && validations.length === 0 && (
          <Card>
            <CardBody className="text-center py-8">
              <p className="text-text-muted">No validation history found</p>
            </CardBody>
          </Card>
        )}

        {!isLoading && validations.length > 0 && (
          <>
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-surface-secondary rounded-t-lg border border-terminal-green border-b-0 font-semibold text-terminal-green text-sm uppercase tracking-wider font-mono">
              <div className="col-span-3">Provider</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Duration</div>
              <div className="col-span-1">Code</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            {/* Table Rows */}
            <div className="space-y-2">
              {validations.map((validation) => (
                <div key={validation.id}>
                  {/* Desktop View */}
                  <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-4 bg-surface-primary border border-terminal-green hover:border-terminal-cyan hover:shadow-lg hover:shadow-terminal-green/30 transition-all items-center">
                    <div className="col-span-3">
                      <div className="font-medium text-terminal-green font-mono">
                        {validation.provider?.displayName || validation.providerId}
                      </div>
                      <div className="text-xs text-terminal-cyan">
                        [{validation.provider?.category}]
                      </div>
                    </div>
                    <div className="col-span-2">
                      {getStatusBadge(validation.status)}
                    </div>
                    <div className="col-span-2 text-sm text-terminal-cyan font-mono">
                      {format(new Date(validation.createdAt), 'MMM dd, HH:mm')}
                    </div>
                    <div className="col-span-2 text-sm text-terminal-green font-mono">
                      {validation.requestDuration ? `${validation.requestDuration}ms` : '-'}
                    </div>
                    <div className="col-span-1 text-sm text-terminal-green font-mono">
                      {validation.httpStatus || '-'}
                    </div>
                    <div className="col-span-2 text-right">
                      <button
                        onClick={() => setExpandedId(expandedId === validation.id ? null : validation.id)}
                        aria-expanded={expandedId === validation.id}
                        aria-controls={`details-${validation.id}`}
                        className="inline-flex items-center gap-2 text-terminal-green hover:text-terminal-cyan hover:underline text-sm font-mono uppercase min-h-[44px] px-2"
                      >
                        {expandedId === validation.id ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
                        Details
                      </button>
                    </div>
                  </div>

                  {/* Mobile View */}
                  <Card className="md:hidden">
                    <CardBody className="space-y-3">
                      <div>
                        <div className="font-medium text-terminal-green font-mono">
                          {validation.provider?.displayName || validation.providerId}
                        </div>
                        <div className="text-xs text-terminal-cyan mt-0.5">
                          [{validation.provider?.category}]
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div>
                          <div className="text-xs text-terminal-cyan mb-1 uppercase">[status]</div>
                          {getStatusBadge(validation.status)}
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-terminal-cyan mb-1 uppercase">[date]</div>
                          <div className="text-sm text-terminal-green font-mono">
                            {format(new Date(validation.createdAt), 'MMM dd, HH:mm')}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setExpandedId(expandedId === validation.id ? null : validation.id)}
                        aria-expanded={expandedId === validation.id}
                        aria-controls={`details-${validation.id}`}
                        className="text-terminal-green hover:text-terminal-cyan hover:underline text-sm flex items-center gap-1 font-mono uppercase min-h-[44px] py-2"
                      >
                        {expandedId === validation.id ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
                        {expandedId === validation.id ? 'Hide' : 'Show'} Details
                      </button>
                    </CardBody>
                  </Card>

                  {/* Expanded Details */}
                  {expandedId === validation.id && (
                    <Card className="mt-2 border-terminal-cyan" id={`details-${validation.id}`}>
                      <CardBody className="space-y-4">
                        {validation.errorSummary && (
                          <div className="border-l-4 border-terminal-red pl-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-terminal-red">!</span>
                              <h4 className="font-semibold text-terminal-red uppercase">Error</h4>
                            </div>
                            <p className="text-terminal-green text-sm bg-surface-secondary p-3 rounded border border-terminal-red/50 font-mono">
                              {validation.errorSummary}
                            </p>
                          </div>
                        )}

                        {validation.metadata && Object.keys(validation.metadata).length > 0 && (
                          <div className="border-l-4 border-terminal-cyan pl-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-terminal-cyan">@</span>
                              <h4 className="font-semibold text-terminal-cyan uppercase">Account Info</h4>
                            </div>
                            <div className="space-y-1 text-sm font-mono">
                              {Object.entries(validation.metadata).map(([key, value]) => (
                                <div key={key} className="flex justify-between break-words">
                                  <span className="text-terminal-green">{key}:</span>
                                  <span className="text-terminal-cyan text-right ml-2">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 text-sm font-mono border-t border-terminal-green pt-2">
                          {validation.httpStatus && (
                            <div>
                              <span className="text-terminal-green">[http]</span>
                              <span className="ml-2 text-terminal-cyan">{validation.httpStatus}</span>
                            </div>
                          )}
                          {validation.requestDuration && (
                            <div>
                              <span className="text-terminal-green">[time]</span>
                              <span className="ml-2 text-terminal-cyan">{validation.requestDuration}ms</span>
                            </div>
                          )}
                          <div>
                            <span className="text-terminal-green">[created]</span>
                            <span className="ml-2 text-terminal-cyan">
                              {format(new Date(validation.createdAt), 'PPp')}
                            </span>
                          </div>
                          <div>
                            <span className="text-terminal-green">[id]</span>
                            <span className="ml-2 text-terminal-cyan text-xs">
                              {validation.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            <nav aria-label="Pagination" className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 px-4">
              <div className="text-sm text-terminal-cyan font-mono" aria-live="polite">
                [{offset + 1}...{offset + validations.length} of {pagination.total}]
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                  aria-label="Go to previous page"
                  className="px-4 py-3 min-h-[44px] bg-surface-secondary hover:bg-terminal-green hover:text-black disabled:opacity-30 text-terminal-green rounded transition-colors font-mono uppercase"
                >
                  {'<'} Previous
                </button>
                <button
                  onClick={() => setOffset(offset + limit)}
                  disabled={!pagination.hasMore}
                  aria-label="Go to next page"
                  className="px-4 py-3 min-h-[44px] bg-surface-secondary hover:bg-terminal-green hover:text-black disabled:opacity-30 text-terminal-green rounded transition-colors font-mono uppercase"
                >
                  Next {'>'}
                </button>
              </div>
            </nav>
          </>
        )}
      </div>
    </div>
  );
}
