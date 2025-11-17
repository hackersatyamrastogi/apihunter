import React from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle, History, Package } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  // Structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'APIHunter',
    applicationCategory: 'SecurityApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    operatingSystem: 'Web',
    description: 'Professional API key validation and JWT security testing tool for penetration testers, security researchers, and bug bounty hunters. Supports 100+ cloud providers including AWS, Azure, GCP, Cloudflare, GitHub, and Stripe.',
    author: {
      '@type': 'Person',
      name: 'Satyam Rastogi',
      url: 'https://satyamrastogi.com',
      jobTitle: 'Director of Information Security & DevOps',
      sameAs: [
        'https://github.com/hackersatyamrastogi',
        'https://linkedin.com/in/satyamrastogi',
      ],
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      ratingCount: '1',
    },
    featureList: [
      'Validate 100+ API providers',
      'JWT token decoder',
      'JWT token editor and signer',
      'JWT secret cracker',
      'Custom HTTP request tester',
      'Validation history tracking',
      'Secret redaction and encryption',
      'Docker deployment support',
    ],
    screenshot: 'https://apihunter.dev/screenshot.png',
  };

  return (
    <div className="bg-background-primary min-h-screen">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section */}
      <section className="bg-background-primary py-20 border-b border-terminal-green relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-terminal-green rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-terminal-cyan rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-4 flex items-center justify-center gap-2">
              <span className="text-terminal-cyan text-lg font-mono">{'>'}</span>
              <span className="text-terminal-green text-sm uppercase tracking-wider">INITIALIZED</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-terminal-green mb-4">
              APIHunter
            </h1>
            <p className="text-xl text-terminal-cyan mb-2">Security Testing Terminal</p>
            <p className="text-base text-terminal-green opacity-80 mb-8">
              Full-stack API key validation tool for security researchers and penetration testers
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/validate">
                <Button size="lg" variant="primary">
                  {'>'} SCAN KEYS
                </Button>
              </Link>
              <Link href="/providers">
                <Button size="lg" variant="secondary">
                  {'>'} BROWSE PROVIDERS
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer Section - Terminal Style */}
      <section className="bg-background-primary border-b border-terminal-red py-8 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="border-l-4 border-terminal-red pl-6">
              <div className="flex gap-3 items-start">
                <AlertCircle className="text-terminal-red flex-shrink-0 mt-1" size={24} />
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-terminal-red uppercase tracking-wider mb-2">
                    LEGAL NOTICE
                  </h2>
                  <p className="text-terminal-green text-sm leading-relaxed">
                    APIHunter is designed for authorized security testing and penetration testing purposes only.
                    Validating API keys without proper authorization is <span className="text-terminal-red font-bold">ILLEGAL</span> and <span className="text-terminal-red font-bold">UNETHICAL</span>.
                    Always obtain written permission from the API provider or service owner before testing.
                    The developers are not responsible for misuse of this tool. Use responsibly and legally.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center gap-3">
            <span className="text-terminal-cyan text-lg">{'>'}</span>
            <h2 className="text-3xl font-bold text-terminal-green uppercase tracking-wider">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Validate API Key Card */}
            <Link href="/validate">
              <Card hoverable className="h-full group hover:shadow-lg hover:shadow-terminal-green/50 transition-all">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-terminal-green bg-opacity-10 rounded">
                      <CheckCircle className="text-terminal-green" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-terminal-green uppercase">
                      Validate Key
                    </h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <p className="text-terminal-cyan text-sm mb-4">
                    Test API keys against various providers to determine validity and security status.
                  </p>
                  <div className="text-xs text-terminal-green opacity-60 font-mono">[action_scan]</div>
                </CardBody>
              </Card>
            </Link>

            {/* View History Card */}
            <Link href="/history">
              <Card hoverable className="h-full group hover:shadow-lg hover:shadow-terminal-green/50 transition-all">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-terminal-green bg-opacity-10 rounded">
                      <History className="text-terminal-green" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-terminal-green uppercase">
                      View History
                    </h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <p className="text-terminal-cyan text-sm mb-4">
                    Browse past validations and review their results and metadata.
                  </p>
                  <div className="text-xs text-terminal-green opacity-60 font-mono">[action_history]</div>
                </CardBody>
              </Card>
            </Link>

            {/* Browse Providers Card */}
            <Link href="/providers">
              <Card hoverable className="h-full group hover:shadow-lg hover:shadow-terminal-green/50 transition-all">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-terminal-green bg-opacity-10 rounded">
                      <Package className="text-terminal-green" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-terminal-green uppercase">
                      Providers
                    </h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <p className="text-terminal-cyan text-sm mb-4">
                    Explore all available API providers and their validation methods.
                  </p>
                  <div className="text-xs text-terminal-green opacity-60 font-mono">[action_browse]</div>
                </CardBody>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
