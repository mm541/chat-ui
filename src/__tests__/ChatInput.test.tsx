
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChatInput } from '../components/Input';
import { ChatProvider } from '../context/ChatContext';

const renderWithProvider = (providerProps = {}) => {
  const onSend = vi.fn();
  return {
    onSend,
    ...render(
      <ChatProvider
        messages={[]}
        onSendMessage={onSend}
        {...providerProps}
      >
        <ChatInput />
      </ChatProvider>
    ),
  };
};

describe('ChatInput', () => {
  it('renders textarea with default placeholder', () => {
    renderWithProvider();
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('placeholder', 'Type a message...');
  });

  it('uses custom placeholder from context', () => {
    renderWithProvider({ placeholder: 'Ask me anything...' });
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('placeholder', 'Ask me anything...');
  });

  it('sends message on Enter key', () => {
    const { onSend } = renderWithProvider();
    const textarea = screen.getByRole('textbox');

    fireEvent.change(textarea, { target: { value: 'Hello!' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    expect(onSend).toHaveBeenCalledWith('Hello!');
  });

  it('does not send on Shift+Enter (newline)', () => {
    const { onSend } = renderWithProvider();
    const textarea = screen.getByRole('textbox');

    fireEvent.change(textarea, { target: { value: 'Hello!' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

    expect(onSend).not.toHaveBeenCalled();
  });

  it('does not send empty messages', () => {
    const { onSend } = renderWithProvider();
    const textarea = screen.getByRole('textbox');

    fireEvent.change(textarea, { target: { value: '   ' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    expect(onSend).not.toHaveBeenCalled();
  });

  it('clears input after sending', () => {
    renderWithProvider();
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

    fireEvent.change(textarea, { target: { value: 'Test message' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    expect(textarea.value).toBe('');
  });

  it('disables send button when input is empty', () => {
    renderWithProvider();
    const sendBtn = screen.getByLabelText('Send message');
    expect(sendBtn).toBeDisabled();
  });

  it('enables send button when input has text', () => {
    renderWithProvider();
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Hi' } });

    const sendBtn = screen.getByLabelText('Send message');
    expect(sendBtn).not.toBeDisabled();
  });
});
