import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MessageBubble } from '../components/MessageBubble';
import { ChatProvider } from '../context/ChatContext';
import type { ChatMessage } from '../types';

// Helper to render within context
const wrap = (ui: React.ReactElement, props = {}) =>
  render(
    <ChatProvider messages={[]} onSendMessage={vi.fn()} {...props}>
      {ui}
    </ChatProvider>
  );

const ts = (minutesAgo: number) => new Date(Date.now() - minutesAgo * 60000);

const makeMsg = (overrides: Partial<ChatMessage> = {}): ChatMessage => ({
  id: Math.random().toString(),
  text: 'test',
  sender: 'agent',
  timestamp: ts(0),
  ...overrides,
});

describe('Message Grouping — Visual Clustering', () => {
  it('applies group-first class to first message in group', () => {
    const { container } = wrap(
      <MessageBubble message={makeMsg()} groupPosition="first" />
    );
    expect(container.querySelector('.group-first')).toBeTruthy();
  });

  it('applies group-middle class to middle message', () => {
    const { container } = wrap(
      <MessageBubble message={makeMsg()} groupPosition="middle" />
    );
    expect(container.querySelector('.group-middle')).toBeTruthy();
  });

  it('applies group-last class to last message', () => {
    const { container } = wrap(
      <MessageBubble message={makeMsg()} groupPosition="last" />
    );
    expect(container.querySelector('.group-last')).toBeTruthy();
  });

  it('does NOT apply group classes for "single" messages', () => {
    const { container } = wrap(
      <MessageBubble message={makeMsg()} groupPosition="single" />
    );
    const wrapperEl = container.querySelector('.chat-ui-bubble-wrapper');
    expect(wrapperEl?.className).not.toContain('group-');
  });
});

describe('Message Reactions', () => {
  it('renders reaction badges when message has reactions', () => {
    const msg = makeMsg({
      reactions: [
        { emoji: '👍', count: 3, reacted: false },
        { emoji: '❤️', count: 1, reacted: true },
      ],
    });
    const { container } = wrap(<MessageBubble message={msg} />);
    const badges = container.querySelectorAll('.chat-ui-reaction-badge');
    expect(badges).toHaveLength(2);
    expect(badges[0].textContent).toContain('👍');
    expect(badges[1].textContent).toContain('❤️');
  });

  it('applies "reacted" class when user has reacted', () => {
    const msg = makeMsg({
      reactions: [{ emoji: '🎉', count: 1, reacted: true }],
    });
    const { container } = wrap(<MessageBubble message={msg} />);
    const badge = container.querySelector('.chat-ui-reaction-badge');
    expect(badge).toHaveClass('reacted');
  });

  it('does not render reactions section when no reactions', () => {
    const msg = makeMsg({ reactions: [] });
    const { container } = wrap(<MessageBubble message={msg} />);
    expect(container.querySelector('.chat-ui-reactions')).toBeNull();
  });

  it('calls onReaction when clicking a reaction badge', () => {
    const onReaction = vi.fn();
    const msg = makeMsg({
      reactions: [{ emoji: '👍', count: 1, reacted: false }],
    });
    const { container } = wrap(<MessageBubble message={msg} />, { onReaction });
    const badge = container.querySelector('.chat-ui-reaction-badge') as HTMLElement;
    badge.click();
    expect(onReaction).toHaveBeenCalledWith(msg, '👍');
  });
});

describe('Edited Badge', () => {
  it('shows edited badge when isEdited is true', () => {
    const msg = makeMsg({ isEdited: true });
    const { container } = wrap(<MessageBubble message={msg} />);
    const badge = container.querySelector('.chat-ui-edited-badge');
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toContain('edited');
  });

  it('does not show edited badge when isEdited is false/undefined', () => {
    const msg = makeMsg({ isEdited: false });
    const { container } = wrap(<MessageBubble message={msg} />);
    expect(container.querySelector('.chat-ui-edited-badge')).toBeNull();
  });
});

describe('Streaming Markdown', () => {
  it('uses StreamingMarkdownText when status is streaming', () => {
    const msg = makeMsg({ status: 'streaming', text: 'Loading **data**...' });
    const { container } = wrap(<MessageBubble message={msg} />);
    // Should still render the text
    expect(container.textContent).toContain('Loading');
  });

  it('uses standard MarkdownText when status is not streaming', () => {
    const msg = makeMsg({ status: 'delivered', text: '**Bold text**' });
    const { container } = wrap(<MessageBubble message={msg} />);
    const strong = container.querySelector('strong');
    expect(strong).toBeTruthy();
    expect(strong?.textContent).toBe('Bold text');
  });

  it('shows streaming cursor during streaming', () => {
    const msg = makeMsg({ status: 'streaming', text: 'test' });
    const { container } = wrap(<MessageBubble message={msg} />);
    expect(container.querySelector('.chat-ui-streaming-cursor')).toBeTruthy();
  });

  it('hides streaming cursor when not streaming', () => {
    const msg = makeMsg({ status: 'delivered', text: 'test' });
    const { container } = wrap(<MessageBubble message={msg} />);
    expect(container.querySelector('.chat-ui-streaming-cursor')).toBeNull();
  });
});

describe('Edge Cases', () => {
  it('renders empty message (no text, no payload)', () => {
    const msg = makeMsg({ text: undefined });
    const { container } = wrap(<MessageBubble message={msg} />);
    expect(container.querySelector('.chat-ui-bubble')).toBeTruthy();
  });

  it('renders system badge for system messages', () => {
    const msg = makeMsg({ sender: 'system', text: 'User joined' });
    const { container } = wrap(<MessageBubble message={msg} />);
    expect(container.querySelector('.chat-ui-system-badge')).toBeTruthy();
    expect(container.querySelector('.chat-ui-system-badge')?.textContent).toBe('User joined');
  });

  it('renders message with very long text without crashing', () => {
    const longText = 'x'.repeat(50000);
    const msg = makeMsg({ text: longText });
    expect(() => wrap(<MessageBubble message={msg} />)).not.toThrow();
  });

  it('handles special characters in message text', () => {
    const msg = makeMsg({ text: '<script>alert("xss")</script>' });
    const { container } = wrap(<MessageBubble message={msg} />);
    expect(container.querySelector('script')).toBeNull(); // XSS safe
    expect(container.textContent).toContain('alert("xss")');
  });
});
