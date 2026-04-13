import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';

describe('useCopyToClipboard', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('should start with isCopied = false', () => {
    const { result } = renderHook(() => useCopyToClipboard());
    expect(result.current.isCopied).toBe(false);
  });

  it('should set isCopied to true after copy', async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy('hello');
    });

    expect(result.current.isCopied).toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello');
  });

  it('should reset isCopied after the interval', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCopyToClipboard(1000));

    await act(async () => {
      await result.current.copy('test');
    });

    expect(result.current.isCopied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1100);
    });

    expect(result.current.isCopied).toBe(false);
    vi.useRealTimers();
  });

  it('should return false when clipboard is not available', async () => {
    Object.assign(navigator, { clipboard: undefined });
    const { result } = renderHook(() => useCopyToClipboard());

    let returnValue: boolean | undefined;
    await act(async () => {
      returnValue = await result.current.copy('test');
    });

    expect(returnValue).toBe(false);
    expect(result.current.isCopied).toBe(false);
  });
});
