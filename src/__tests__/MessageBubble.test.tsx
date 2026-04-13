import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MessageBubble } from '../components/MessageBubble';
import { ChatProvider } from '../context/ChatContext';
import type { ChatMessage } from '../types';

const makeMessage = (overrides: Partial<ChatMessage> = {}): ChatMessage => ({
  id: 'test-1',
  text: 'Hello world',
  sender: 'agent',
  timestamp: new Date('2024-01-01'),
  ...overrides,
});

const renderWithProvider = (ui: React.ReactElement, providerProps = {}) => {
  return render(
    <ChatProvider
      messages={[]}
      onSendMessage={vi.fn()}
      {...providerProps}
    >
      {ui}
    </ChatProvider>
  );
};

describe('MessageBubble', () => {
  it('renders message text', () => {
    renderWithProvider(<MessageBubble message={makeMessage()} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders system messages with badge class', () => {
    const { container } = renderWithProvider(
      <MessageBubble message={makeMessage({ sender: 'system', text: 'System alert' })} />
    );
    const badge = container.querySelector('.chat-ui-system-badge');
    expect(badge).toBeInTheDocument();
    expect(badge?.textContent).toBe('System alert');
  });

  it('applies sent class for user messages', () => {
    const { container } = renderWithProvider(
      <MessageBubble message={makeMessage({ sender: 'user' })} />
    );
    const wrapper = container.querySelector('.chat-ui-bubble-wrapper');
    expect(wrapper).toHaveClass('sent');
  });

  it('applies received class for agent messages', () => {
    const { container } = renderWithProvider(
      <MessageBubble message={makeMessage({ sender: 'agent' })} />
    );
    const wrapper = container.querySelector('.chat-ui-bubble-wrapper');
    expect(wrapper).toHaveClass('received');
  });

  it('applies group position classes', () => {
    const { container } = renderWithProvider(
      <MessageBubble message={makeMessage()} groupPosition="first" />
    );
    const wrapper = container.querySelector('.chat-ui-bubble-wrapper');
    expect(wrapper).toHaveClass('group-first');
  });

  it('applies group-middle class', () => {
    const { container } = renderWithProvider(
      <MessageBubble message={makeMessage()} groupPosition="middle" />
    );
    const outerContainer = container.querySelector('.chat-ui-bubble-container');
    expect(outerContainer).toHaveClass('group-middle');
  });

  it('does not apply group class for single position', () => {
    const { container } = renderWithProvider(
      <MessageBubble message={makeMessage()} groupPosition="single" />
    );
    const wrapper = container.querySelector('.chat-ui-bubble-wrapper');
    expect(wrapper).not.toHaveClass('group-single');
  });

  it('renders markdown by default (no renderText override)', () => {
    const { container } = renderWithProvider(
      <MessageBubble message={makeMessage({ text: '**bold text**' })} />
    );
    const strong = container.querySelector('strong');
    expect(strong).toBeInTheDocument();
    expect(strong?.textContent).toBe('bold text');
  });

  it('uses renderText override when provided', () => {
    renderWithProvider(
      <MessageBubble message={makeMessage({ text: 'custom' })} />,
      { renderText: (text: string) => React.createElement('span', { 'data-testid': 'custom' }, text.toUpperCase()) }
    );
    expect(screen.getByTestId('custom')).toHaveTextContent('CUSTOM');
  });

  it('shows streaming cursor when status is streaming', () => {
    const { container } = renderWithProvider(
      <MessageBubble message={makeMessage({ status: 'streaming', text: 'Loading' })} />
    );
    const cursor = container.querySelector('.chat-ui-streaming-cursor');
    expect(cursor).toBeInTheDocument();
  });
});
