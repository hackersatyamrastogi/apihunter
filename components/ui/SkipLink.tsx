'use client';

/**
 * SkipLink - Accessibility component for keyboard navigation
 *
 * This component provides a "Skip to main content" link that:
 * - Is visually hidden by default
 * - Becomes visible when focused (keyboard users tabbing)
 * - Allows users to bypass navigation and jump directly to content
 *
 * This is a WCAG 2.1 Level A requirement (Success Criterion 2.4.1)
 */
export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="
        sr-only focus:not-sr-only
        focus:fixed focus:top-4 focus:left-4 focus:z-[100]
        focus:px-4 focus:py-3 focus:rounded-lg
        focus:bg-terminal-cyan focus:text-white
        focus:font-semibold focus:text-sm focus:uppercase focus:tracking-wider
        focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-terminal-cyan
        transition-all
      "
    >
      Skip to main content
    </a>
  );
}
