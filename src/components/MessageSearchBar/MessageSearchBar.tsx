import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import type { ChatMessage } from '../../types';
import { useChat } from '../../context/ChatContext';

export interface MessageSearchBarProps {
  messages: ChatMessage[];
  /** Called when the user navigates to a match — the parent should scroll to it. */
  onNavigateToMatch?: (messageId: string) => void;
  /** Called when search is closed. */
  onClose?: () => void;
}

export const MessageSearchBar: React.FC<MessageSearchBarProps> = ({
  messages,
  onNavigateToMatch,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { dictionary, classNames } = useChat();

  // Filter messages by query
  const matches = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return messages.filter(m => m.text?.toLowerCase().includes(q));
  }, [messages, query]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setCurrentIndex(0);
    onClose?.();
  }, [onClose]);

  // Open on Ctrl+F / Cmd+F
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Reset index when matches change
  useEffect(() => {
    // eslint-disable-next-line
    setCurrentIndex(0);
    if (matches.length > 0) {
      onNavigateToMatch?.(matches[0].id);
    }
  }, [matches, onNavigateToMatch]);

  const navigate = useCallback((direction: 'prev' | 'next') => {
    if (matches.length === 0) return;
    let newIndex: number;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % matches.length;
    } else {
      newIndex = (currentIndex - 1 + matches.length) % matches.length;
    }
    setCurrentIndex(newIndex);
    onNavigateToMatch?.(matches[newIndex].id);
  }, [matches, currentIndex, onNavigateToMatch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      navigate(e.shiftKey ? 'prev' : 'next');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`chat-ui-search-bar ${classNames?.searchBar || ''}`} role="search" aria-label="Search messages">
      <div className="chat-ui-search-input-wrapper">
        <Search size={16} className="chat-ui-search-icon" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={dictionary.searchPlaceholder}
          className="chat-ui-search-input"
          aria-label={dictionary.searchPlaceholder}
        />
        {query && matches.length > 0 && (
          <span className="chat-ui-search-count" aria-live="polite">
            {currentIndex + 1} of {matches.length}
          </span>
        )}
        {query && matches.length === 0 && (
          <span className="chat-ui-search-count no-results" aria-live="polite">
            No results
          </span>
        )}
      </div>
      <div className="chat-ui-search-actions">
        <button
          className="chat-ui-search-nav-btn"
          onClick={() => navigate('prev')}
          disabled={matches.length === 0}
          aria-label={dictionary.searchPrevAriaLabel}
          title={dictionary.searchPrevAriaLabel}
        >
          <ChevronUp size={16} />
        </button>
        <button
          className="chat-ui-search-nav-btn"
          onClick={() => navigate('next')}
          disabled={matches.length === 0}
          aria-label={dictionary.searchNextAriaLabel}
          title={dictionary.searchNextAriaLabel}
        >
          <ChevronDown size={16} />
        </button>
        <button
          className="chat-ui-search-close-btn"
          onClick={handleClose}
          aria-label={dictionary.searchCloseAriaLabel}
          title={dictionary.searchCloseAriaLabel}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
