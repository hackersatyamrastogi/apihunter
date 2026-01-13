'use client';

import React, { useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { AlertCircle, CheckCircle, Lock, Database, Shield } from 'lucide-react';

export default function SettingsPage() {
  const [historyEnabled, setHistoryEnabled] = useState(true);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [proxyUrl, setProxyUrl] = useState('');
  const [proxyUsername, setProxyUsername] = useState('');
  const [proxyPassword, setProxyPassword] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Store settings in localStorage
    const settings = {
      historyEnabled,
      encryptionEnabled,
      proxyUrl,
      proxyUsername,
      proxyPassword,
    };

    localStorage.setItem('apihunter-settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-background-primary min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-terminal-cyan text-xl">{'>'}</span>
          <h1 className="text-3xl font-bold text-terminal-green uppercase tracking-wider">Settings</h1>
        </div>

        {/* Success Message */}
        {saved && (
          <Card className="mb-6 border-terminal-green">
            <CardBody>
              <div className="flex gap-3">
                <CheckCircle className="text-terminal-green flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold text-terminal-green uppercase">[success]</h3>
                  <p className="text-terminal-cyan text-sm font-mono">Settings saved successfully.</p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* History Settings */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Database className="text-terminal-green" size={24} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-terminal-cyan">{'>'}</span>
                  <h2 className="text-lg font-semibold text-terminal-green uppercase">History Storage</h2>
                </div>
                <p className="text-terminal-cyan text-sm mt-1">Manage how validation results are stored</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="space-y-4 border-t border-terminal-green pt-4">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex items-start gap-3 flex-1">
                <input
                  type="checkbox"
                  id="historyEnabled"
                  checked={historyEnabled}
                  onChange={(e) => setHistoryEnabled(e.target.checked)}
                  className="w-5 h-5 min-w-[20px] mt-0.5 rounded cursor-pointer accent-terminal-green"
                />
                <div>
                  <label htmlFor="historyEnabled" className="block text-terminal-green font-medium cursor-pointer uppercase min-h-[44px] flex items-center">
                    Enable History
                  </label>
                  <p className="text-terminal-cyan text-sm mt-1">
                    Store validation results and metadata for future reference. History is stored with encrypted
                    secret fingerprints to protect sensitive data.
                  </p>
                </div>
              </div>
              {historyEnabled && (
                <Badge variant="success" size="sm" className="badge-valid uppercase self-start" isStatus>
                  [enabled]
                </Badge>
              )}
            </div>

            {historyEnabled && (
              <div className="bg-surface-secondary p-4 rounded text-sm text-terminal-cyan border border-terminal-green/30">
                <p className="font-medium text-terminal-green mb-2 uppercase">[data stored]</p>
                <ul className="space-y-1 ml-4 font-mono text-terminal-green terminal-line">
                  <li>Provider name and category</li>
                  <li>Validation result status (valid/invalid/error)</li>
                  <li>Metadata (account info, permissions, roles)</li>
                  <li>HTTP status and response duration</li>
                  <li>Encrypted fingerprint of the API key (not the key itself)</li>
                </ul>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Encryption Settings */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Lock className="text-terminal-cyan" size={24} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-terminal-cyan">{'>'}</span>
                  <h2 className="text-lg font-semibold text-terminal-green uppercase">Encryption</h2>
                </div>
                <p className="text-terminal-cyan text-sm mt-1">Control encryption of sensitive data</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="space-y-4 border-t border-terminal-green pt-4">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex items-start gap-3 flex-1">
                <input
                  type="checkbox"
                  id="encryptionEnabled"
                  checked={encryptionEnabled}
                  onChange={(e) => setEncryptionEnabled(e.target.checked)}
                  className="w-5 h-5 min-w-[20px] mt-0.5 rounded cursor-pointer accent-terminal-green disabled:opacity-50"
                  disabled={!historyEnabled}
                  aria-describedby="encryption-help"
                />
                <div>
                  <label
                    htmlFor="encryptionEnabled"
                    className={`block font-medium cursor-pointer uppercase min-h-[44px] flex items-center ${
                      !historyEnabled ? 'text-text-muted' : 'text-terminal-green'
                    }`}
                  >
                    Enable Encryption
                  </label>
                  <p id="encryption-help" className="text-terminal-cyan text-sm mt-1">
                    Use client-side encryption for API keys and sensitive metadata. Requires history storage to be
                    enabled.
                  </p>
                </div>
              </div>
              {encryptionEnabled && (
                <Badge variant="success" size="sm" className="badge-valid uppercase self-start" isStatus>
                  [enabled]
                </Badge>
              )}
            </div>

            <div className="bg-surface-secondary border border-terminal-cyan rounded p-4 text-sm">
              <div className="flex gap-2">
                <AlertCircle className="text-terminal-cyan flex-shrink-0 mt-0.5" size={18} />
                <div className="text-terminal-cyan">
                  <p className="font-medium text-terminal-green mb-1 uppercase">[encryption info]</p>
                  <p className="font-mono">
                    When enabled, API keys and metadata are encrypted client-side using a key derived from your
                    browser session. Encryption keys are never sent to the server.
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Proxy Settings */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="text-terminal-yellow" size={24} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-terminal-cyan">{'>'}</span>
                  <h2 className="text-lg font-semibold text-terminal-green uppercase">Proxy</h2>
                </div>
                <p className="text-terminal-cyan text-sm mt-1">Configure HTTP/HTTPS proxy for validation requests</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="space-y-4 border-t border-terminal-green pt-4">
            <Input
              label="Proxy URL"
              type="url"
              placeholder="http://proxy.example.com:8080"
              value={proxyUrl}
              onChange={(e) => setProxyUrl(e.target.value)}
              helperText="Leave empty to disable proxy"
            />

            {proxyUrl && (
              <>
                <Input
                  label="Proxy Username (Optional)"
                  placeholder="username"
                  value={proxyUsername}
                  onChange={(e) => setProxyUsername(e.target.value)}
                />

                <Input
                  label="Proxy Password (Optional)"
                  type="password"
                  placeholder="password"
                  value={proxyPassword}
                  onChange={(e) => setProxyPassword(e.target.value)}
                />
              </>
            )}

            <div className="bg-surface-secondary border border-terminal-yellow rounded p-4 text-sm">
              <div className="flex gap-2">
                <AlertCircle className="text-terminal-yellow flex-shrink-0 mt-0.5" size={18} />
                <div className="text-terminal-cyan">
                  <p className="font-medium text-terminal-yellow uppercase mb-1">[note]</p>
                  <p className="font-mono">
                    Proxy settings are stored locally in your browser and not sent to the server. They are applied
                    to all API validation requests.
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Save Button */}
        <Button
          variant="primary"
          size="lg"
          onClick={handleSave}
          className="w-full md:w-auto uppercase tracking-wider"
        >
          {'>'} SAVE
        </Button>

        {/* Security Notes */}
        <Card className="mt-8 border-terminal-red">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="text-terminal-red">!</span>
              <h2 className="text-lg font-semibold text-terminal-red uppercase">Security Notes</h2>
            </div>
          </CardHeader>
          <CardBody className="space-y-3 text-sm text-terminal-cyan font-mono">
            <div className="border-l-2 border-terminal-red pl-3">
              <p className="font-medium text-terminal-red uppercase mb-1">[responsibility]</p>
              <p>
                Only validate API keys that you have permission to test. Unauthorized testing is illegal and
                unethical.
              </p>
            </div>

            <div className="border-l-2 border-terminal-green pl-3">
              <p className="font-medium text-terminal-green uppercase mb-1">[protection]</p>
              <p>
                API keys are never stored in plain text. Only encrypted fingerprints are saved for validation
                tracking.
              </p>
            </div>

            <div className="border-l-2 border-terminal-cyan pl-3">
              <p className="font-medium text-terminal-cyan uppercase mb-1">[storage]</p>
              <p>
                All settings and encryption keys are stored locally in your browser. They are not transmitted to
                external servers.
              </p>
            </div>

            <div className="border-l-2 border-terminal-yellow pl-3">
              <p className="font-medium text-terminal-yellow uppercase mb-1">[caution]</p>
              <p>
                Validation results may contain sensitive information. Consider disabling history storage if testing
                in shared environments.
              </p>
            </div>

            <div className="border-l-2 border-terminal-red pl-3">
              <p className="font-medium text-terminal-red uppercase mb-1">[https_required]</p>
              <p>
                Always use HTTPS when accessing this tool. Unencrypted connections may expose API keys and
                credentials.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
