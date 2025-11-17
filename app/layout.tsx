import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/ui/Sidebar';
import { QueryProvider } from '@/components/providers/QueryProvider';

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://apihunter.dev'),
  title: {
    default: 'APIHunter - API Key Validation & JWT Security Testing Tool by Satyam Rastogi',
    template: '%s | APIHunter - Security Testing Tool',
  },
  description: 'Professional API key validation and JWT security testing tool for penetration testers, security researchers, and bug bounty hunters. Validate 100+ cloud providers (AWS, Azure, GCP, Cloudflare), decode/edit/crack JWT tokens, and perform comprehensive API security assessments. Created by Satyam Rastogi, Director of Information Security.',
  keywords: [
    'API key validation',
    'API key scanner',
    'API security testing',
    'JWT decoder',
    'JWT cracker',
    'JWT security',
    'penetration testing',
    'security testing tool',
    'bug bounty',
    'cloud security',
    'API key checker',
    'token validation',
    'Satyam Rastogi',
    'APIHunter',
    'API scanner',
    'credential validation',
    'AWS key validation',
    'Azure key validation',
    'GCP key validation',
    'Cloudflare API token',
    'GitHub token validation',
    'Stripe key validation',
    'API pentesting',
    'Red Team tools',
    'security researcher tools',
    'OSINT tools',
    'cybersecurity tools',
    'ethical hacking',
    'Black Hat tools',
    'DEFCON tools',
  ],
  authors: [
    { name: 'Satyam Rastogi', url: 'https://satyamrastogi.com' },
  ],
  creator: 'Satyam Rastogi',
  publisher: 'Satyam Rastogi',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://apihunter.dev',
    title: 'APIHunter - Professional API Key Validation & JWT Security Testing',
    description: 'Validate API keys for 100+ providers, decode/crack JWT tokens, and perform comprehensive API security testing. Built by Satyam Rastogi for security researchers.',
    siteName: 'APIHunter',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'APIHunter - API Security Testing Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'APIHunter - API Key Validation & JWT Testing Tool',
    description: 'Professional security testing tool for API keys and JWT tokens. 100+ providers supported.',
    creator: '@satyamrastogi',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://apihunter.dev',
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={jetbrainsMono.className}>
        <QueryProvider>
          <div className="flex h-screen overflow-hidden bg-background-primary">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 ml-64 flex flex-col overflow-hidden">
              {/* Top Bar */}
              <header className="bg-white border-b border-border-primary px-6 py-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-terminal-cyan text-sm font-mono">{'>'}</span>
                    <span className="text-terminal-cyan text-sm uppercase tracking-wider font-semibold">Authorized Security Testing Only</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-secondary font-mono">
                    <span>Session: <span className="text-terminal-green font-semibold">ACTIVE</span></span>
                    <span className="text-border-primary">|</span>
                    <span>Time: <span className="text-terminal-cyan">{new Date().toLocaleTimeString()}</span></span>
                  </div>
                </div>
              </header>

              {/* Page Content */}
              <main className="flex-1 overflow-auto p-6">
                {children}
              </main>

              {/* Footer */}
              <footer className="bg-white border-t border-border-primary px-6 py-4 shadow-sm">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs text-text-secondary font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-terminal-cyan">{'>'}</span>
                      <span>APIHunter - For authorized security testing only</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Use responsibly</span>
                      <span className="text-border-primary">|</span>
                      <span className="text-terminal-red font-semibold">No warranty provided</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs border-t border-border-primary pt-3">
                    <span className="text-text-secondary">Made with</span>
                    <span className="text-terminal-red text-base">♥</span>
                    <span className="text-text-secondary">by</span>
                    <a
                      href="https://satyamrastogi.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-terminal-cyan hover:text-terminal-green transition-colors font-semibold hover:underline"
                    >
                      Satyam Rastogi
                    </a>
                    <span className="text-border-primary">|</span>
                    <span className="text-text-secondary">Director of Information Security & DevOps</span>
                    <span className="text-border-primary">|</span>
                    <a
                      href="https://github.com/hackersatyamrastogi/apihunter"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-terminal-cyan hover:text-terminal-green transition-colors hover:underline"
                    >
                      GitHub
                    </a>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
