'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  CheckCircle,
  Package,
  Key,
  Terminal,
  Shield,
  Activity,
  Menu,
  X
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Scan Key', href: '/validate', icon: CheckCircle },
  { name: 'Providers', href: '/providers', icon: Package },
  { name: 'JWT Decoder', href: '/jwt', icon: Key },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Focus trap inside drawer
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return;

    const drawer = drawerRef.current;
    const focusableElements = drawer.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    drawer.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => drawer.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleDrawer = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-border-primary shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              ref={triggerRef}
              onClick={toggleDrawer}
              aria-expanded={isOpen}
              aria-controls="mobile-nav-drawer"
              aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="p-2 -ml-2 rounded-lg text-text-secondary hover:text-terminal-cyan hover:bg-surface-tertiary transition-colors focus:outline-none focus:ring-2 focus:ring-terminal-cyan"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-2">
              <Terminal className="w-6 h-6 text-terminal-cyan" />
              <span className="text-lg font-bold text-text-primary">
                API<span className="text-terminal-cyan">HUNTER</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Activity className="w-4 h-4 text-terminal-green" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-terminal-green rounded-full animate-pulse"></span>
            </div>
            <span className="text-xs text-terminal-green uppercase tracking-wider hidden sm:inline">Online</span>
          </div>
        </div>
      </header>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Drawer */}
      <nav
        ref={drawerRef}
        id="mobile-nav-drawer"
        role="navigation"
        aria-label="Main navigation"
        className={`
          lg:hidden fixed top-0 left-0 z-50 h-full w-72 max-w-[85vw]
          bg-white shadow-2xl transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-primary">
          <div className="flex items-center gap-3">
            <Terminal className="w-7 h-7 text-terminal-cyan" />
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                API<span className="text-terminal-cyan">HUNTER</span>
              </h2>
              <p className="text-xs text-text-dim uppercase tracking-widest">v1.0.0</p>
            </div>
          </div>
          <button
            onClick={closeDrawer}
            aria-label="Close navigation menu"
            className="p-2 rounded-lg text-text-secondary hover:text-terminal-red hover:bg-surface-tertiary transition-colors focus:outline-none focus:ring-2 focus:ring-terminal-cyan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Indicator */}
        <div className="px-4 py-3 border-b border-border-primary bg-surface-secondary">
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

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeDrawer}
                  aria-current={isActive ? 'page' : undefined}
                  className={`
                    flex items-center gap-3 px-4 py-4 rounded-lg transition-all duration-200
                    min-h-[48px]
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
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-primary bg-surface-secondary">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-terminal-cyan" />
            <span className="text-xs text-terminal-cyan uppercase tracking-wider">Security Mode</span>
          </div>
          <div className="text-xs text-text-secondary space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-terminal-cyan" aria-hidden="true">{'>'}</span>
              <span>Authorized Testing Only</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-terminal-cyan" aria-hidden="true">{'>'}</span>
              <span>No Data Stored</span>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
