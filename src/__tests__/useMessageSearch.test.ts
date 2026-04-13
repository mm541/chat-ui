import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useMessageSearch } from '../hooks/useMessageSearch';
import type { ChatMessage } from '../types';

const makeMessages = (): ChatMessage[] => [
  { id: '1', text: 'Hello world', sender: 'user', timestamp: new Date('2024-01-01') },
  { id: '2', text: 'How are you?', sender: 'agent', timestamp: new Date('2024-01-01') },
  { id: '3', text: 'I am fine, thanks!', sender: 'user', timestamp: new Date('2024-01-02') },
  { id: '4', text: 'Great to hear that', sender: 'agent', timestamp: new Date('2024-01-02') },
  { id: '5', text: 'Hello again', sender: 'user', timestamp: new Date('2024-01-03') },
];

describe('useMessageSearch', () => {
  it('returns all messages when query is empty', () => {
    const messages = makeMessages();
    const { result } = renderHook(() => useMessageSearch(messages));
    expect(result.current.results).toHaveLength(5);
    expect(result.current.isSearching).toBe(false);
  });

  it('filters messages by text', () => {
    const messages = makeMessages();
    const { result } = renderHook(() => useMessageSearch(messages));

    act(() => {
      result.current.setQuery('Hello');
    });

    expect(result.current.results).toHaveLength(2);
    expect(result.current.isSearching).toBe(true);
    expect(result.current.resultCount).toBe(2);
  });

  it('is case-insensitive by default', () => {
    const messages = makeMessages();
    const { result } = renderHook(() => useMessageSearch(messages));

    act(() => {
      result.current.setQuery('hello');
    });

    expect(result.current.results).toHaveLength(2);
  });

  it('supports case-sensitive search', () => {
    const messages = makeMessages();
    const { result } = renderHook(() =>
      useMessageSearch(messages, { caseSensitive: true })
    );

    act(() => {
      result.current.setQuery('hello');
    });

    expect(result.current.results).toHaveLength(0);
  });

  it('clears search with clear()', () => {
    const messages = makeMessages();
    const { result } = renderHook(() => useMessageSearch(messages));

    act(() => {
      result.current.setQuery('Hello');
    });
    expect(result.current.results).toHaveLength(2);

    act(() => {
      result.current.clear();
    });
    expect(result.current.results).toHaveLength(5);
    expect(result.current.isSearching).toBe(false);
  });

  it('returns empty when nothing matches', () => {
    const messages = makeMessages();
    const { result } = renderHook(() => useMessageSearch(messages));

    act(() => {
      result.current.setQuery('nonexistent_term_xyz');
    });

    expect(result.current.results).toHaveLength(0);
    expect(result.current.resultCount).toBe(0);
  });

  it('handles whitespace-only query as empty', () => {
    const messages = makeMessages();
    const { result } = renderHook(() => useMessageSearch(messages));

    act(() => {
      result.current.setQuery('   ');
    });

    expect(result.current.results).toHaveLength(5);
    expect(result.current.isSearching).toBe(false);
  });
});
