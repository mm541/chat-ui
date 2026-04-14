import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { MessageBubble } from '../components/MessageBubble';
import { ChatInput } from '../components/Input';
import { ChatProvider } from '../context/ChatContext';
import type { ChatMessage } from '../types';

const wrap = (ui: React.ReactElement, props = {}) =>
  render(
    <ChatProvider messages={[]} onSendMessage={vi.fn()} {...props}>
      {ui}
    </ChatProvider>
  );

const makeMsg = (overrides: Partial<ChatMessage> = {}): ChatMessage => ({
  id: '1',
  text: 'Hello world',
  sender: 'agent',
  timestamp: new Date(),
  ...overrides,
});

describe('Accessibility — ARIA Roles & Attributes', () => {
  // Message Bubble
  it('message bubble has role="article"', () => {
    wrap(<MessageBubble message={makeMsg()} />);
    const article = screen.getByRole('article');
    expect(article).toBeInTheDocument();
  });

  it('user message has correct aria-label', () => {
    wrap(<MessageBubble message={makeMsg({ sender: 'user' })} />);
    const article = screen.getByRole('article');
    expect(article).toHaveAttribute('aria-label', 'Message from you');
  });

  it('agent message has correct aria-label', () => {
    wrap(<MessageBubble message={makeMsg({ sender: 'agent' })} />);
    const article = screen.getByRole('article');
    expect(article).toHaveAttribute('aria-label', 'Message from the assistant');
  });

  it('system message has role="status"', () => {
    wrap(<MessageBubble message={makeMsg({ sender: 'system' })} />);
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
  });

  // Input
  it('textarea has aria-label', () => {
    wrap(<ChatInput />);
    const textarea = screen.getByLabelText('Type a message...');
    expect(textarea).toBeInTheDocument();
  });

  it('send button has aria-label', () => {
    wrap(<ChatInput />);
    const btn = screen.getByLabelText('Send message');
    expect(btn).toBeInTheDocument();
  });

  it('send button is disabled when input is empty', () => {
    wrap(<ChatInput />);
    const btn = screen.getByLabelText('Send message');
    expect(btn).toBeDisabled();
  });

  // Keyboard Navigation
  it('textarea can be focused', () => {
    wrap(<ChatInput />);
    const textarea = screen.getByRole('textbox');
    textarea.focus();
    expect(document.activeElement).toBe(textarea);
  });

  it('Enter submits and clears input', () => {
    const onSend = vi.fn();
    wrap(<ChatInput />, { onSendMessage: onSend });
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    
    fireEvent.change(textarea, { target: { value: 'Hello' } });
    fireEvent.keyDown(textarea, { key: 'Enter' });
    
    expect(onSend).toHaveBeenCalledWith('Hello');
    expect(textarea.value).toBe('');
  });

  it('Shift+Enter does not submit', () => {
    const onSend = vi.fn();
    wrap(<ChatInput />, { onSendMessage: onSend });
    const textarea = screen.getByRole('textbox');
    
    fireEvent.change(textarea, { target: { value: 'Hello' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
    
    expect(onSend).not.toHaveBeenCalled();
  });
});

describe('Accessibility — Screen Reader Support', () => {
  it('reaction badges are interactive buttons', () => {
    const msg = makeMsg({
      reactions: [{ emoji: '👍', count: 2, reacted: false }],
    });
    const { container } = wrap(<MessageBubble message={msg} />);
    const button = container.querySelector('.chat-ui-reaction-badge');
    expect(button?.tagName).toBe('BUTTON');
  });

  it('links in markdown open in new tab with noopener', () => {
    const msg = makeMsg({ text: '[Click](https://example.com)' });
    wrap(<MessageBubble message={msg} />);
    const link = screen.getByText('Click');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
