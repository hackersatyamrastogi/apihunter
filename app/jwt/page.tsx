'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardBody, CardHeader, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, ErrorBadge, WarningBadge } from '@/components/ui/Badge';
import { AlertCircle, CheckCircle, Copy, Clock, Edit, Lock, Key, Zap } from 'lucide-react';
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

type TabType = 'decode' | 'edit' | 'crack';

export default function JWTToolPage() {
  const [activeTab, setActiveTab] = useState<TabType>('decode');
  const [token, setToken] = useState('');
  const [decodedData, setDecodedData] = useState<DecodedResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Edit mode states
  const [editHeader, setEditHeader] = useState('{\n  "alg": "HS256",\n  "typ": "JWT"\n}');
  const [editPayload, setEditPayload] = useState('{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}');
  const [editSecret, setEditSecret] = useState('');
  const [editMode, setEditMode] = useState<'sign' | 'none'>('none');
  const [editSignature, setEditSignature] = useState('');

  // Crack mode states
  const [crackWordlist, setCrackWordlist] = useState('');
  const [crackUseCommon, setCrackUseCommon] = useState(true);
  const [crackResult, setCrackResult] = useState<any>(null);

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
      // Auto-populate edit fields
      setEditHeader(JSON.stringify(data.decoded.header, null, 2));
      setEditPayload(JSON.stringify(data.decoded.payload, null, 2));
    },
  });

  const encodeMutation = useMutation({
    mutationFn: async () => {
      const header = JSON.parse(editHeader);
      const payload = JSON.parse(editPayload);

      const response = await fetch('/api/jwt/encode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          header,
          payload,
          secret: editSecret,
          mode: editMode,
          signature: editSignature,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to encode JWT');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setToken(data.token);
      setActiveTab('decode');
      setTimeout(() => decodeMutation.mutate(), 100);
    },
  });

  const crackMutation = useMutation({
    mutationFn: async () => {
      if (!token.trim()) {
        throw new Error('Please enter a JWT token to crack');
      }

      const response = await fetch('/api/jwt/crack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token.trim(),
          wordlist: crackWordlist,
          useCommon: crackUseCommon,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to crack JWT');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setCrackResult(data);
    },
  });

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="bg-background-primary min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-terminal-cyan text-xl">{'>'}</span>
          <h1 className="text-3xl font-bold text-terminal-green uppercase tracking-wider">
            JWT Toolkit
          </h1>
        </div>
        <p className="text-terminal-cyan mb-8 ml-6">
          Decode, Edit, and Crack JWT tokens - All-in-one security testing tool
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('decode')}
            className={`px-6 py-3 font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'decode'
                ? 'bg-terminal-green text-background-primary'
                : 'bg-surface-primary text-terminal-green border border-terminal-green hover:bg-surface-secondary'
            }`}
          >
            <Key size={18} />
            Decode & Analyze
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-6 py-3 font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'edit'
                ? 'bg-terminal-cyan text-background-primary'
                : 'bg-surface-primary text-terminal-cyan border border-terminal-cyan hover:bg-surface-secondary'
            }`}
          >
            <Edit size={18} />
            Edit & Sign
          </button>
          <button
            onClick={() => setActiveTab('crack')}
            className={`px-6 py-3 font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'crack'
                ? 'bg-terminal-yellow text-background-primary'
                : 'bg-surface-primary text-terminal-yellow border border-terminal-yellow hover:bg-surface-secondary'
            }`}
          >
            <Zap size={18} />
            Crack Secret
          </button>
        </div>

        {/* Decode Tab */}
        {activeTab === 'decode' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="text-terminal-cyan">{'>'}</span>
                  <h2 className="text-lg font-semibold text-terminal-green uppercase">JWT Token Input</h2>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                <textarea
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste your JWT token here (e.g., eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
                  className="w-full px-4 py-3 rounded border border-terminal-green bg-surface-primary text-terminal-green placeholder-text-dim focus:outline-none focus:border-terminal-cyan focus:ring-1 focus:ring-terminal-cyan focus:shadow-lg focus:shadow-terminal-cyan/50 font-mono text-sm min-h-32 resize-none"
                />
              </CardBody>
              <CardFooter className="flex gap-3">
                <Button
                  variant="primary"
                  onClick={() => decodeMutation.mutate()}
                  isLoading={decodeMutation.isPending}
                  disabled={decodeMutation.isPending || !token.trim()}
                  className="uppercase tracking-wider"
                >
                  <Key size={16} />
                  Decode & Analyze
                </Button>
                {token && (
                  <Button
                    variant="secondary"
                    onClick={() => handleCopy(token, 'token-input')}
                    className="uppercase tracking-wider"
                  >
                    <Copy size={16} />
                    {copiedField === 'token-input' ? 'Copied' : 'Copy'}
                  </Button>
                )}
              </CardFooter>
            </Card>

            {decodeMutation.isError && (
              <Card className="border-terminal-red">
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

            {decodedData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Status */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-terminal-cyan">{'>'}</span>
                          <h2 className="text-lg font-semibold text-terminal-green uppercase">Status</h2>
                        </div>
                        {decodedData.info.isExpired ? (
                          <ErrorBadge className="flex items-center gap-2 uppercase">
                            <AlertCircle size={14} />
                            Expired
                          </ErrorBadge>
                        ) : (
                          <Badge variant="success" className="flex items-center gap-2 uppercase">
                            <CheckCircle size={14} />
                            Valid
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
                        <h2 className="text-lg font-semibold text-terminal-green uppercase">Claims</h2>
                      </div>
                    </CardHeader>
                    <CardBody className="space-y-3">
                      {decodedData.info.algorithm && (
                        <div className="border-l-2 border-terminal-green pl-3">
                          <p className="text-xs text-terminal-cyan mb-1 uppercase">Algorithm</p>
                          <p className="text-terminal-green font-mono font-semibold">{decodedData.info.algorithm}</p>
                        </div>
                      )}
                      {decodedData.info.issuer && (
                        <div className="border-l-2 border-terminal-cyan pl-3">
                          <p className="text-xs text-terminal-cyan mb-1 uppercase">Issuer (iss)</p>
                          <p className="text-terminal-green font-mono text-sm">{decodedData.info.issuer}</p>
                        </div>
                      )}
                      {decodedData.info.subject && (
                        <div className="border-l-2 border-terminal-cyan pl-3">
                          <p className="text-xs text-terminal-cyan mb-1 uppercase">Subject (sub)</p>
                          <p className="text-terminal-green font-mono text-sm">{decodedData.info.subject}</p>
                        </div>
                      )}
                      {decodedData.info.audience && (
                        <div className="border-l-2 border-terminal-cyan pl-3">
                          <p className="text-xs text-terminal-cyan mb-1 uppercase">Audience (aud)</p>
                          <p className="text-terminal-green font-mono text-sm">
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
                        <Clock size={18} className="text-terminal-cyan" />
                        <h2 className="text-lg font-semibold text-terminal-green uppercase">Timestamps</h2>
                      </div>
                    </CardHeader>
                    <CardBody className="space-y-3">
                      {decodedData.info.issuedAt && (
                        <div className="border-l-2 border-terminal-green pl-3">
                          <p className="text-xs text-terminal-cyan mb-1 uppercase">Issued At (iat)</p>
                          <p className="text-terminal-green text-sm font-mono">{decodedData.info.issuedAt}</p>
                        </div>
                      )}
                      {decodedData.info.expiresAt && (
                        <div className="border-l-2 border-terminal-yellow pl-3">
                          <p className="text-xs text-terminal-cyan mb-1 uppercase">Expires At (exp)</p>
                          <p className="text-terminal-green text-sm font-mono flex items-center gap-2">
                            {decodedData.info.expiresAt}
                            {decodedData.info.isExpired && (
                              <WarningBadge size="sm" className="uppercase">Expired</WarningBadge>
                            )}
                          </p>
                        </div>
                      )}
                      {decodedData.info.notBefore && (
                        <div className="border-l-2 border-terminal-green pl-3">
                          <p className="text-xs text-terminal-cyan mb-1 uppercase">Not Before (nbf)</p>
                          <p className="text-terminal-green text-sm font-mono">{decodedData.info.notBefore}</p>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Header */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-terminal-cyan">{'>'}</span>
                          <h2 className="text-lg font-semibold text-terminal-green uppercase">Header</h2>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCopy(JSON.stringify(decodedData.decoded.header, null, 2), 'header')}
                        >
                          <Copy size={14} />
                          {copiedField === 'header' ? 'Copied' : 'Copy'}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <pre className="bg-surface-secondary p-4 rounded font-mono text-xs text-terminal-green overflow-x-auto border border-terminal-green/30">
                        {JSON.stringify(decodedData.decoded.header, null, 2)}
                      </pre>
                    </CardBody>
                  </Card>

                  {/* Payload */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-terminal-cyan">{'>'}</span>
                          <h2 className="text-lg font-semibold text-terminal-green uppercase">Payload</h2>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCopy(JSON.stringify(decodedData.decoded.payload, null, 2), 'payload')}
                        >
                          <Copy size={14} />
                          {copiedField === 'payload' ? 'Copied' : 'Copy'}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <pre className="bg-surface-secondary p-4 rounded font-mono text-xs text-terminal-green overflow-x-auto border border-terminal-green/30 max-h-64 overflow-y-auto">
                        {JSON.stringify(decodedData.decoded.payload, null, 2)}
                      </pre>
                    </CardBody>
                  </Card>

                  {/* Signature */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lock size={18} className="text-terminal-cyan" />
                          <h2 className="text-lg font-semibold text-terminal-green uppercase">Signature</h2>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCopy(decodedData.decoded.signature, 'signature')}
                        >
                          <Copy size={14} />
                          {copiedField === 'signature' ? 'Copied' : 'Copy'}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <div className="bg-surface-secondary p-4 rounded font-mono text-xs text-terminal-green break-all border border-terminal-green/30">
                        {decodedData.decoded.signature}
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Tab */}
        {activeTab === 'edit' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Edit size={18} className="text-terminal-cyan" />
                  <h2 className="text-lg font-semibold text-terminal-green uppercase">Edit JWT Components</h2>
                </div>
              </CardHeader>
              <CardBody className="space-y-6">
                {/* Header Editor */}
                <div>
                  <label className="block text-terminal-cyan text-sm mb-2 uppercase">Header (JSON)</label>
                  <textarea
                    value={editHeader}
                    onChange={(e) => setEditHeader(e.target.value)}
                    className="w-full px-4 py-3 rounded border border-terminal-green bg-surface-primary text-terminal-green font-mono text-sm min-h-32 resize-none focus:outline-none focus:border-terminal-cyan focus:ring-1 focus:ring-terminal-cyan"
                  />
                </div>

                {/* Payload Editor */}
                <div>
                  <label className="block text-terminal-cyan text-sm mb-2 uppercase">Payload (JSON)</label>
                  <textarea
                    value={editPayload}
                    onChange={(e) => setEditPayload(e.target.value)}
                    className="w-full px-4 py-3 rounded border border-terminal-green bg-surface-primary text-terminal-green font-mono text-sm min-h-48 resize-none focus:outline-none focus:border-terminal-cyan focus:ring-1 focus:ring-terminal-cyan"
                  />
                </div>

                {/* Signature Mode */}
                <div className="space-y-3">
                  <label className="block text-terminal-cyan text-sm uppercase">Signature Mode</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="editMode"
                        value="none"
                        checked={editMode === 'none'}
                        onChange={(e) => setEditMode('none')}
                        className="accent-terminal-green"
                      />
                      <span className="text-terminal-green">No Signature / None Algorithm</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="editMode"
                        value="sign"
                        checked={editMode === 'sign'}
                        onChange={(e) => setEditMode('sign')}
                        className="accent-terminal-green"
                      />
                      <span className="text-terminal-green">Sign with Secret (HMAC)</span>
                    </label>
                  </div>
                </div>

                {/* Secret Input */}
                {editMode === 'sign' && (
                  <div>
                    <label className="block text-terminal-cyan text-sm mb-2 uppercase">Secret Key</label>
                    <input
                      type="text"
                      value={editSecret}
                      onChange={(e) => setEditSecret(e.target.value)}
                      placeholder="Enter secret key for signing"
                      className="w-full px-4 py-3 rounded border border-terminal-green bg-surface-primary text-terminal-green font-mono text-sm focus:outline-none focus:border-terminal-cyan focus:ring-1 focus:ring-terminal-cyan"
                    />
                  </div>
                )}

                {editMode === 'none' && (
                  <div>
                    <label className="block text-terminal-cyan text-sm mb-2 uppercase">Custom Signature (Optional)</label>
                    <input
                      type="text"
                      value={editSignature}
                      onChange={(e) => setEditSignature(e.target.value)}
                      placeholder="Leave empty for unsigned token"
                      className="w-full px-4 py-3 rounded border border-terminal-green bg-surface-primary text-terminal-green font-mono text-sm focus:outline-none focus:border-terminal-cyan focus:ring-1 focus:ring-terminal-cyan"
                    />
                  </div>
                )}
              </CardBody>
              <CardFooter>
                <Button
                  variant="primary"
                  onClick={() => encodeMutation.mutate()}
                  isLoading={encodeMutation.isPending}
                  disabled={encodeMutation.isPending}
                  className="uppercase tracking-wider"
                >
                  <Edit size={16} />
                  Generate Token
                </Button>
              </CardFooter>
            </Card>

            {encodeMutation.isError && (
              <Card className="border-terminal-red">
                <CardBody>
                  <div className="flex gap-3">
                    <AlertCircle className="text-terminal-red flex-shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-terminal-red uppercase mb-1">[error]</h3>
                      <p className="text-terminal-green text-sm font-mono">
                        {encodeMutation.error instanceof Error ? encodeMutation.error.message : 'Failed to encode JWT'}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        )}

        {/* Crack Tab */}
        {activeTab === 'crack' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap size={18} className="text-terminal-yellow" />
                  <h2 className="text-lg font-semibold text-terminal-green uppercase">Crack JWT Secret</h2>
                </div>
              </CardHeader>
              <CardBody className="space-y-6">
                <div className="bg-surface-secondary border-l-4 border-terminal-yellow p-4 rounded">
                  <p className="text-terminal-yellow text-sm">
                    <strong>Note:</strong> This feature attempts to crack HMAC-signed (HS256/HS384/HS512) JWT tokens using a wordlist.
                    Only works on weak secrets. RSA/ECDSA tokens cannot be cracked.
                  </p>
                </div>

                <div>
                  <label className="block text-terminal-cyan text-sm mb-2 uppercase">JWT Token</label>
                  <textarea
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste JWT token to crack..."
                    className="w-full px-4 py-3 rounded border border-terminal-green bg-surface-primary text-terminal-green font-mono text-sm min-h-32 resize-none focus:outline-none focus:border-terminal-cyan focus:ring-1 focus:ring-terminal-cyan"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="useCommon"
                    checked={crackUseCommon}
                    onChange={(e) => setCrackUseCommon(e.target.checked)}
                    className="accent-terminal-green"
                  />
                  <label htmlFor="useCommon" className="text-terminal-green cursor-pointer">
                    Use common weak secrets wordlist (~40 entries)
                  </label>
                </div>

                <div>
                  <label className="block text-terminal-cyan text-sm mb-2 uppercase">Custom Wordlist (Optional)</label>
                  <textarea
                    value={crackWordlist}
                    onChange={(e) => setCrackWordlist(e.target.value)}
                    placeholder="Enter custom secrets (one per line or comma-separated)&#10;mysecret123&#10;company-secret&#10;p@ssw0rd"
                    className="w-full px-4 py-3 rounded border border-terminal-green bg-surface-primary text-terminal-green font-mono text-sm min-h-32 resize-none focus:outline-none focus:border-terminal-cyan focus:ring-1 focus:ring-terminal-cyan"
                  />
                </div>
              </CardBody>
              <CardFooter>
                <Button
                  variant="primary"
                  onClick={() => crackMutation.mutate()}
                  isLoading={crackMutation.isPending}
                  disabled={crackMutation.isPending || !token.trim()}
                  className="uppercase tracking-wider bg-terminal-yellow text-background-primary hover:bg-terminal-yellow/90"
                >
                  <Zap size={16} />
                  {crackMutation.isPending ? 'Cracking...' : 'Start Cracking'}
                </Button>
              </CardFooter>
            </Card>

            {crackMutation.isError && (
              <Card className="border-terminal-red">
                <CardBody>
                  <div className="flex gap-3">
                    <AlertCircle className="text-terminal-red flex-shrink-0" size={24} />
                    <div>
                      <h3 className="font-semibold text-terminal-red uppercase mb-1">[error]</h3>
                      <p className="text-terminal-green text-sm font-mono">
                        {crackMutation.error instanceof Error ? crackMutation.error.message : 'Failed to crack JWT'}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {crackResult && (
              <Card className={crackResult.success ? 'border-terminal-green' : 'border-terminal-yellow'}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {crackResult.success ? (
                      <CheckCircle className="text-terminal-green" size={20} />
                    ) : (
                      <AlertCircle className="text-terminal-yellow" size={20} />
                    )}
                    <h2 className="text-lg font-semibold text-terminal-green uppercase">
                      {crackResult.success ? 'Secret Found!' : 'No Match Found'}
                    </h2>
                  </div>
                </CardHeader>
                <CardBody className="space-y-4">
                  {crackResult.success ? (
                    <>
                      <div className="bg-terminal-green/10 border-l-4 border-terminal-green p-4 rounded">
                        <p className="text-terminal-cyan text-sm mb-2 uppercase">Cracked Secret:</p>
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-terminal-green font-mono font-bold text-lg break-all">
                            {crackResult.secret}
                          </p>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCopy(crackResult.secret, 'cracked-secret')}
                          >
                            <Copy size={14} />
                            {copiedField === 'cracked-secret' ? 'Copied' : 'Copy'}
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="border-l-2 border-terminal-green pl-3">
                          <p className="text-terminal-cyan uppercase text-xs mb-1">Attempts</p>
                          <p className="text-terminal-green font-mono">{crackResult.attemptsCount}</p>
                        </div>
                        <div className="border-l-2 border-terminal-green pl-3">
                          <p className="text-terminal-cyan uppercase text-xs mb-1">Total Secrets</p>
                          <p className="text-terminal-green font-mono">{crackResult.totalSecrets}</p>
                        </div>
                        <div className="border-l-2 border-terminal-green pl-3">
                          <p className="text-terminal-cyan uppercase text-xs mb-1">Duration</p>
                          <p className="text-terminal-green font-mono">{crackResult.duration}ms</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-terminal-yellow">{crackResult.message}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="border-l-2 border-terminal-yellow pl-3">
                          <p className="text-terminal-cyan uppercase text-xs mb-1">Secrets Tried</p>
                          <p className="text-terminal-green font-mono">{crackResult.totalSecrets}</p>
                        </div>
                        <div className="border-l-2 border-terminal-yellow pl-3">
                          <p className="text-terminal-cyan uppercase text-xs mb-1">Duration</p>
                          <p className="text-terminal-green font-mono">{crackResult.duration}ms</p>
                        </div>
                      </div>
                      <p className="text-terminal-cyan text-sm">
                        Try adding more secrets to your custom wordlist or use a specialized JWT cracking tool for larger wordlists.
                      </p>
                    </>
                  )}
                </CardBody>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
