'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardBody, CardHeader, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, ErrorBadge, WarningBadge, InfoBadge } from '@/components/ui/Badge';
import { AlertCircle, CheckCircle, Copy, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { JWTDecoded } from '@/lib/types';

interface JWTInfo {
  issuer?: string;
  subject?: string;
  audience?: string | string[];
  issuedAt?: string;
  expiresAt?: string;
  notBefore?: string;
  algorithm?: string;
  keyId?: string;
  isExpired: boolean;
}

interface DecodedResult {
  decoded: JWTDecoded;
  info: JWTInfo;
}

export default function JWTDecoderPage() {
  const [token, setToken] = useState('');
  const [decodedData, setDecodedData] = useState<DecodedResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const decodeMutation = useMutation({
    mutationFn: async () => {
      if (!token.trim()) {
        throw new Error('Please enter a JWT token');
      }

      const response = await fetch('/api/jwt/decode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to decode JWT');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setDecodedData(data);
    },
  });

  const handleDecode = () => {
    decodeMutation.mutate();
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp * 1000), 'PPpp');
  };

  return (
    <div className="bg-background-primary min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-terminal-cyan text-xl">{'>'}</span>
          <h1 className="text-3xl font-bold text-terminal-green uppercase tracking-wider">JWT Decoder</h1>
        </div>
        <p className="text-terminal-cyan mb-8 ml-6">
          Decode and analyze JWT tokens to inspect claims, expiration, and other information
        </p>

        {/* Input Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="text-terminal-cyan">{'>'}</span>
              <h2 className="text-lg font-semibold text-terminal-green uppercase">Input</h2>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your JWT token here..."
              className="w-full px-4 py-3 rounded border border-terminal-green bg-surface-primary text-terminal-green placeholder-text-dim focus:outline-none focus:border-terminal-cyan focus:ring-1 focus:ring-terminal-cyan focus:shadow-lg focus:shadow-terminal-cyan/50 font-mono text-sm min-h-32 resize-none"
            />
          </CardBody>
          <CardFooter>
            <Button
              variant="primary"
              onClick={handleDecode}
              isLoading={decodeMutation.isPending}
              disabled={decodeMutation.isPending || !token.trim()}
              className="uppercase tracking-wider"
            >
              {'>'} DECODE
            </Button>
          </CardFooter>
        </Card>

        {/* Error State */}
        {decodeMutation.isError && (
          <Card className="mb-8 border-terminal-red">
            <CardBody>
              <div className="flex gap-3">
                <AlertCircle className="text-terminal-red flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold text-terminal-red uppercase mb-1">[error]</h3>
                  <p className="text-terminal-green text-sm font-mono">
                    {decodeMutation.error instanceof Error
                      ? decodeMutation.error.message
                      : 'An error occurred while decoding'}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Decoded Results */}
        {decodedData && (
          <div className="space-y-6">
            {/* JWT Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-terminal-cyan">{'>'}</span>
                    <h2 className="text-lg font-semibold text-terminal-green uppercase">Status</h2>
                  </div>
                  {decodedData.info.isExpired ? (
                    <ErrorBadge className="flex items-center gap-2 uppercase tracking-wider font-mono">
                      <AlertCircle size={14} />
                      [EXPIRED]
                    </ErrorBadge>
                  ) : (
                    <Badge variant="success" className="flex items-center gap-2 uppercase tracking-wider font-mono">
                      <CheckCircle size={14} />
                      [VALID]
                    </Badge>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Token Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="text-terminal-cyan">{'>'}</span>
                  <h2 className="text-lg font-semibold text-terminal-green uppercase">Information</h2>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {decodedData.info.algorithm && (
                    <div className="border-l-2 border-terminal-green pl-3">
                      <p className="text-sm text-terminal-cyan mb-1 uppercase">[algorithm]</p>
                      <p className="text-terminal-green font-mono">{decodedData.info.algorithm}</p>
                    </div>
                  )}

                  {decodedData.info.keyId && (
                    <div className="border-l-2 border-terminal-green pl-3">
                      <p className="text-sm text-terminal-cyan mb-1 uppercase">[kid]</p>
                      <p className="text-terminal-green font-mono text-sm truncate">{decodedData.info.keyId}</p>
                    </div>
                  )}

                  {decodedData.info.issuer && (
                    <div className="border-l-2 border-terminal-green pl-3">
                      <p className="text-sm text-terminal-cyan mb-1 uppercase">[iss]</p>
                      <p className="text-terminal-green">{decodedData.info.issuer}</p>
                    </div>
                  )}

                  {decodedData.info.subject && (
                    <div className="border-l-2 border-terminal-green pl-3">
                      <p className="text-sm text-terminal-cyan mb-1 uppercase">[sub]</p>
                      <p className="text-terminal-green">{decodedData.info.subject}</p>
                    </div>
                  )}
                </div>

                {decodedData.info.audience && (
                  <div className="border-l-2 border-terminal-cyan pl-3">
                    <p className="text-sm text-terminal-cyan mb-1 uppercase">[aud]</p>
                    <p className="text-terminal-green">
                      {Array.isArray(decodedData.info.audience)
                        ? decodedData.info.audience.join(', ')
                        : decodedData.info.audience}
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Dates */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="text-terminal-cyan">{'>'}</span>
                  <h2 className="text-lg font-semibold text-terminal-green uppercase flex items-center gap-2">
                    <Clock size={20} />
                    Dates
                  </h2>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                {decodedData.info.issuedAt && (
                  <div className="border-l-2 border-terminal-green pl-3">
                    <p className="text-sm text-terminal-cyan mb-1 uppercase">[iat]</p>
                    <p className="text-terminal-green text-sm font-mono">{decodedData.info.issuedAt}</p>
                  </div>
                )}

                {decodedData.info.expiresAt && (
                  <div className="border-l-2 border-terminal-yellow pl-3">
                    <p className="text-sm text-terminal-cyan mb-1 uppercase">[exp]</p>
                    <p className="text-terminal-green text-sm flex items-center gap-2 font-mono">
                      {decodedData.info.expiresAt}
                      {decodedData.info.isExpired && (
                        <WarningBadge size="sm" className="uppercase tracking-wider">[expired]</WarningBadge>
                      )}
                    </p>
                  </div>
                )}

                {decodedData.info.notBefore && (
                  <div className="border-l-2 border-terminal-green pl-3">
                    <p className="text-sm text-terminal-cyan mb-1 uppercase">[nbf]</p>
                    <p className="text-terminal-green text-sm font-mono">{decodedData.info.notBefore}</p>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="text-terminal-cyan">{'>'}</span>
                  <h2 className="text-lg font-semibold text-terminal-green uppercase">Header</h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div className="bg-surface-secondary p-4 rounded font-mono text-sm text-terminal-green break-all border border-terminal-green/30">
                    {JSON.stringify(decodedData.decoded.header, null, 2)}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      handleCopy(decodedData.decoded.raw.header, 'header')
                    }
                    className="uppercase tracking-wider"
                  >
                    <Copy size={16} />
                    {copiedField === 'header' ? 'Copied' : 'Copy'} Raw
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Payload */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="text-terminal-cyan">{'>'}</span>
                  <h2 className="text-lg font-semibold text-terminal-green uppercase">Payload</h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div className="bg-surface-secondary p-4 rounded font-mono text-sm text-terminal-green break-all overflow-x-auto border border-terminal-green/30">
                    <pre>
                      {JSON.stringify(decodedData.decoded.payload, null, 2)}
                    </pre>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      handleCopy(decodedData.decoded.raw.payload, 'payload')
                    }
                    className="uppercase tracking-wider"
                  >
                    <Copy size={16} />
                    {copiedField === 'payload' ? 'Copied' : 'Copy'} Raw
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Signature */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="text-terminal-cyan">{'>'}</span>
                  <h2 className="text-lg font-semibold text-terminal-green uppercase">Signature</h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div className="bg-surface-secondary p-4 rounded font-mono text-sm text-terminal-green break-all border border-terminal-green/30">
                    {decodedData.decoded.signature}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      handleCopy(decodedData.decoded.raw.signature, 'signature')
                    }
                    className="uppercase tracking-wider"
                  >
                    <Copy size={16} />
                    {copiedField === 'signature' ? 'Copied' : 'Copy'} Raw
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Full Token */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="text-terminal-cyan">{'>'}</span>
                  <h2 className="text-lg font-semibold text-terminal-green uppercase">Full Token</h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div className="bg-surface-secondary p-4 rounded font-mono text-sm text-terminal-green break-all border border-terminal-green/30">
                    {token}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopy(token, 'full')}
                    className="uppercase tracking-wider"
                  >
                    <Copy size={16} />
                    {copiedField === 'full' ? 'Copied' : 'Copy'} Token
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
