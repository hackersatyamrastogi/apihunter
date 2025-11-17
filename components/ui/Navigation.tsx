'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  Home,
  CheckCircle,
  History,
  Package,
  Key,
  Zap,
  Settings,
  Menu,
  X,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Dashboard',
    icon: <Home size={20} />,
  },
  {
    href: '/validate',
    label: 'New Validation',
    icon: <CheckCircle size={20} />,
  },
  {
    href: '/history',
    label: 'History',
    icon: <History size={20} />,
  },
  {
    href: '/providers',
    label: 'Providers',
    icon: <Package size={20} />,
  },
  {
    href: '/jwt',
    label: 'JWT Decoder',
    icon: <Key size={20} />,
  },
  {
    href: '/custom-test',
    label: 'Custom Test',
    icon: <Zap size={20} />,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: <Settings size={20} />,
  },
];

export default function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-surface-primary border-b border-border-primary sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 font-bold text-xl text-accent-primary">
            <span>APIHunter</span>
          </Link>

          {/* Desktop Nav Items */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded transition-colors duration-200 text-sm',
                  isActive(item.href)
                    ? 'bg-accent-primary text-white'
                    : 'text-text-secondary hover:bg-surface-secondary'
                )}
              >
                {item.icon}
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-accent-primary">
            APIHunter
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded hover:bg-surface-secondary transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-border-primary">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded transition-colors duration-200',
                  isActive(item.href)
                    ? 'bg-accent-primary text-white'
                    : 'text-text-secondary hover:bg-surface-secondary'
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
