'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';

interface AnnouncerContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AnnouncerContext = createContext<AnnouncerContextType | null>(null);

/**
 * useAnnouncer - Hook to announce messages to screen readers
 *
 * Usage:
 * ```tsx
 * const { announce } = useAnnouncer();
 *
 * // Polite announcement (waits for current speech to finish)
 * announce('API key validated successfully');
 *
 * // Assertive announcement (interrupts current speech)
 * announce('Error: Invalid API key format', 'assertive');
 * ```
 */
export function useAnnouncer() {
  const context = useContext(AnnouncerContext);
  if (!context) {
    throw new Error('useAnnouncer must be used within an AnnouncerProvider');
  }
  return context;
}

interface AnnouncerProviderProps {
  children: ReactNode;
}

/**
 * AnnouncerProvider - Provides screen reader announcement capabilities
 *
 * This component creates two live regions:
 * - One for polite announcements (waits for user to finish reading)
 * - One for assertive announcements (interrupts immediately)
 *
 * Wrap your app with this provider to enable the useAnnouncer hook.
 */
export function AnnouncerProvider({ children }: AnnouncerProviderProps) {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');
  const politeTimeoutRef = useRef<NodeJS.Timeout>();
  const assertiveTimeoutRef = useRef<NodeJS.Timeout>();

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (priority === 'assertive') {
      // Clear any pending assertive announcement
      if (assertiveTimeoutRef.current) {
        clearTimeout(assertiveTimeoutRef.current);
      }
      // Clear first to ensure screen readers detect the change
      setAssertiveMessage('');
      // Set the new message after a brief delay
      assertiveTimeoutRef.current = setTimeout(() => {
        setAssertiveMessage(message);
        // Clear after announcement
        assertiveTimeoutRef.current = setTimeout(() => {
          setAssertiveMessage('');
        }, 1000);
      }, 100);
    } else {
      // Clear any pending polite announcement
      if (politeTimeoutRef.current) {
        clearTimeout(politeTimeoutRef.current);
      }
      // Clear first to ensure screen readers detect the change
      setPoliteMessage('');
      // Set the new message after a brief delay
      politeTimeoutRef.current = setTimeout(() => {
        setPoliteMessage(message);
        // Clear after announcement
        politeTimeoutRef.current = setTimeout(() => {
          setPoliteMessage('');
        }, 1000);
      }, 100);
    }
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (politeTimeoutRef.current) clearTimeout(politeTimeoutRef.current);
      if (assertiveTimeoutRef.current) clearTimeout(assertiveTimeoutRef.current);
    };
  }, []);

  return (
    <AnnouncerContext.Provider value={{ announce }}>
      {children}
      {/* Screen reader live regions - visually hidden but announced */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </AnnouncerContext.Provider>
  );
}

/**
 * Standalone Announcer component for simpler use cases
 * Use this when you just need to announce a single message
 */
export function ScreenReaderAnnouncement({
  message,
  priority = 'polite',
}: {
  message: string;
  priority?: 'polite' | 'assertive';
}) {
  if (!message) return null;

  return (
    <div
      role={priority === 'assertive' ? 'alert' : 'status'}
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}
