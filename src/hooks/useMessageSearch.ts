import { useMemo, useState, useCallback } from 'react';
import type { ChatMessage } from '../types';

export interface UseMessageSearchOptions {
  /** Fields to search in. Defaults to ['text'] */
  fields?: ('text' | 'id')[];
  /** Case-insensitive search. Defaults to true */
  caseSensitive?: boolean;
}

export interface UseMessageSearchReturn {
  /** Current search query */
  query: string;
  /** Set the search query */
  setQuery: (query: string) => void;
  /** Filtered messages matching the query */
  results: ChatMessage[];
  /** Number of matches found */
  resultCount: number;
  /** Whether a search is active */
  isSearching: boolean;
  /** Clear the search */
  clear: () => void;
}

export const useMessageSearch = (
  messages: ChatMessage[],
  options: UseMessageSearchOptions = {}
): UseMessageSearchReturn => {
  const [query, setQuery] = useState('');
  const { fields = ['text'], caseSensitive = false } = options;

  const results = useMemo(() => {
    if (!query.trim()) return messages;

    const search = caseSensitive ? query.trim() : query.trim().toLowerCase();

    return messages.filter((msg) =>
      fields.some((field) => {
        const value = msg[field];
        if (typeof value !== 'string') return false;
        const target = caseSensitive ? value : value.toLowerCase();
        return target.includes(search);
      })
    );
  }, [messages, query, fields, caseSensitive]);

  const clear = useCallback(() => setQuery(''), []);

  return {
    query,
    setQuery,
    results,
    resultCount: results.length,
    isSearching: query.trim().length > 0,
    clear,
  };
};
