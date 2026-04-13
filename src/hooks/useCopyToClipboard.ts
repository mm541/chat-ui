import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Copies text to clipboard with a visual "copied" state that auto-resets.
 * Uses navigator.clipboard when available (HTTPS/localhost), falls back to
 * execCommand('copy') for HTTP contexts (e.g. mobile over LAN).
 */
export function useCopyToClipboard(resetInterval = 2000) {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Cleanup timeout on unmount to prevent memory leaks / state updates on unmounted components
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const markCopied = useCallback(() => {
    setIsCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsCopied(false), resetInterval);
  }, [resetInterval]);

  /**
   * Legacy fallback: creates a temporary textarea, selects it, and runs
   * document.execCommand('copy'). Works on mobile HTTP contexts where
   * navigator.clipboard is unavailable.
   */
  const legacyCopy = useCallback((text: string): boolean => {
    const textarea = document.createElement('textarea');
    textarea.value = text;

    // Move off-screen to avoid flicker
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    textarea.style.opacity = '0';

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    let success = false;
    try {
      success = document.execCommand('copy');
    } catch {
      success = false;
    }

    document.body.removeChild(textarea);
    return success;
  }, []);

  const copy = useCallback(
    async (text: string) => {
      // Prefer async clipboard API (requires secure context)
      if (navigator?.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(text);
          markCopied();
          return true;
        } catch {
          // Fall through to legacy
        }
      }

      // Fallback for mobile HTTP / older browsers
      const success = legacyCopy(text);
      if (success) {
        markCopied();
      } else {
        console.warn('Copy failed: neither clipboard API nor execCommand worked');
        setIsCopied(false);
      }
      return success;
    },
    [markCopied, legacyCopy]
  );

  return { isCopied, copy };
}
