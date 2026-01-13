'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  CheckCircle,
  Package,
  Key,
  Terminal,
  Shield,
  Activity
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Scan Key', href: '/validate', icon: CheckCircle },
  { name: 'Providers', href: '/providers', icon: Package },
  { name: 'JWT Decoder', href: '/jwt', icon: Key },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden lg:flex w-64 bg-white border-r border-border-primary flex-col h-screen fixed left-0 top-0 z-50 shadow-sm"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo/Header */}
      <div className="p-6 border-b border-border-primary">
        <div className="flex items-center gap-3">
          <Terminal className="w-8 h-8 text-terminal-cyan" />
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-wider">
              API<span className="text-terminal-cyan">HUNTER</span>
            </h1>
            <p className="text-xs text-text-dim uppercase tracking-widest">v1.0.0</p>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="px-6 py-3 border-b border-border-primary bg-surface-secondary">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Activity className="w-4 h-4 text-terminal-green" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-terminal-green rounded-full animate-pulse"></span>
          </div>
          <span className="text-xs text-terminal-green uppercase tracking-wider">System Online</span>
        </div>
        <div className="mt-1 text-xs text-text-secondary font-mono">
          <span className="text-terminal-cyan">{'>'}</span> 185 providers loaded
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive
                    ? 'sidebar-active'
                    : 'text-text-secondary hover:text-terminal-green hover:bg-surface-tertiary border-l-2 border-transparent hover:border-terminal-green'
                  }
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium uppercase tracking-wide text-sm">{item.name}</span>
                {isActive && (
                  <span className="ml-auto text-terminal-cyan text-xs" aria-hidden="true">{'>'}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border-primary bg-surface-secondary">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-terminal-cyan" />
          <span className="text-xs text-terminal-cyan uppercase tracking-wider">Security Mode</span>
        </div>
        <div className="text-xs text-text-secondary space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-terminal-cyan">{'>'}</span>
            <span>Authorized Testing Only</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-terminal-cyan">{'>'}</span>
            <span>No Data Stored</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
