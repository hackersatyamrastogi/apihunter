import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/ui/Sidebar';
import MobileNav from '@/components/ui/MobileNav';
import SkipLink from '@/components/ui/SkipLink';
import { QueryProvider } from '@/components/providers/QueryProvider';

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.apihunter.app'),
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
    url: 'https://www.apihunter.app',
    title: 'APIHunter - Professional API Key Validation & JWT Security Testing',
    description: 'Validate API keys for 100+ providers, decode/crack JWT tokens, and perform comprehensive API security testing. Built by Satyam Rastogi for security researchers.',
    siteName: 'APIHunter',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'APIHunter - API Key Validation & JWT Testing Tool',
    description: 'Professional security testing tool for API keys and JWT tokens. 100+ providers supported.',
    creator: '@satyamrastogi',
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
    canonical: 'https://www.apihunter.app',
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
        <SkipLink />
        <QueryProvider>
          <div className="flex h-screen overflow-hidden bg-background-primary">
            {/* Mobile Navigation - visible on small screens */}
            <MobileNav />

            {/* Desktop Sidebar - hidden on mobile */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 lg:ml-64 flex flex-col overflow-hidden pt-14 lg:pt-0">
              {/* Top Bar - hidden on mobile (mobile has its own header) */}
              <header className="hidden lg:block bg-white border-b border-border-primary px-6 py-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-terminal-cyan text-sm font-mono" aria-hidden="true">{'>'}</span>
                    <span className="text-terminal-cyan text-sm uppercase tracking-wider font-semibold">Authorized Security Testing Only</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-secondary font-mono">
                    <span>Session: <span className="text-terminal-green font-semibold">ACTIVE</span></span>
                    <span className="text-border-primary" aria-hidden="true">|</span>
                    <span>Time: <span className="text-terminal-cyan">{new Date().toLocaleTimeString()}</span></span>
                  </div>
                </div>
              </header>

              {/* Page Content */}
              <main id="main-content" className="flex-1 overflow-auto p-4 lg:p-6">
                {children}
              </main>

              {/* Footer */}
              <footer className="bg-white border-t border-border-primary px-4 lg:px-6 py-3 lg:py-4 shadow-sm">
                <div className="flex flex-col gap-2 lg:gap-3">
                  {/* Top row - stacks on mobile */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-text-secondary font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-terminal-cyan" aria-hidden="true">{'>'}</span>
                      <span>APIHunter - For authorized security testing only</span>
                    </div>
                    <div className="flex items-center gap-2 ml-4 sm:ml-0">
                      <span className="hidden sm:inline">Use responsibly</span>
                      <span className="hidden sm:inline text-border-primary" aria-hidden="true">|</span>
                      <span className="text-terminal-red font-semibold">No warranty provided</span>
                    </div>
                  </div>
                  {/* Bottom row - credit section */}
                  <div className="flex flex-wrap items-center justify-center gap-2 lg:gap-3 text-xs border-t border-border-primary pt-2 lg:pt-3">
                    <span className="text-text-secondary">Made with</span>
                    <span className="text-terminal-red text-base" aria-label="love">♥</span>
                    <span className="text-text-secondary">by</span>
                    <a
                      href="https://satyamrastogi.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-terminal-cyan hover:text-terminal-green transition-colors font-semibold hover:underline min-h-[44px] flex items-center"
                    >
                      Satyam Rastogi
                    </a>
                    <span className="text-border-primary hidden sm:inline" aria-hidden="true">|</span>
                    <div className="flex items-center gap-3">
                      <a
                        href="https://linkedin.com/in/satyamrastogi"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-terminal-cyan hover:text-terminal-green transition-colors p-2 -m-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="LinkedIn profile"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                      <a
                        href="https://github.com/hackersatyamrastogi"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-terminal-cyan hover:text-terminal-green transition-colors p-2 -m-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="GitHub profile"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </a>
                    </div>
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
