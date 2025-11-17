import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/ui/Sidebar';
import { QueryProvider } from '@/components/providers/QueryProvider';

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'APIHunter - API Key Validation Tool',
  description: 'Full-stack API key validation tool for security researchers and penetration testers',
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
              <footer className="bg-white border-t border-border-primary px-6 py-3 shadow-sm">
                <div className="flex items-center justify-between text-xs text-text-secondary font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-terminal-cyan">{'>'}</span>
                    <span>APIHunter - For authorized testing only</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Use responsibly</span>
                    <span className="text-border-primary">|</span>
                    <span className="text-terminal-red font-semibold">No warranty provided</span>
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
