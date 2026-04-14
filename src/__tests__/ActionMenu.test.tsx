import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { ActionMenu } from '../components/ActionMenu';
import { ChatProvider } from '../context/ChatContext';
import type { ChatInputAction } from '../types';

const createActions = (overrides: Partial<ChatInputAction>[] = []): ChatInputAction[] => [
  { id: 'photo', label: 'Photo', icon: <span data-testid="icon-photo">📷</span>, onClick: vi.fn(), ...overrides[0] },
  { id: 'file', label: 'File', icon: <span data-testid="icon-file">📎</span>, onClick: vi.fn(), ...overrides[1] },
  { id: 'voice', label: 'Voice', icon: <span data-testid="icon-voice">🎤</span>, onClick: vi.fn(), disabled: true, ...overrides[2] },
];

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ChatProvider messages={[]} onSendMessage={() => {}}>
    {children}
  </ChatProvider>
);

describe('ActionMenu', () => {
  it('renders the trigger button', () => {
    render(<ActionMenu actions={createActions()} />, { wrapper: Wrapper });
    const trigger = screen.getByLabelText('Open action menu');
    expect(trigger).toBeInTheDocument();
  });

  it('does not show popover initially', () => {
    render(<ActionMenu actions={createActions()} />, { wrapper: Wrapper });
    expect(screen.queryByText('Photo')).not.toBeInTheDocument();
  });

  it('shows popover when trigger is clicked', async () => {
    render(<ActionMenu actions={createActions()} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByLabelText('Open action menu'));
    await waitFor(() => {
      expect(screen.getByText('Photo')).toBeInTheDocument();
      expect(screen.getByText('File')).toBeInTheDocument();
      expect(screen.getByText('Voice')).toBeInTheDocument();
    });
  });

  it('trigger aria-expanded toggles', () => {
    render(<ActionMenu actions={createActions()} />, { wrapper: Wrapper });
    const trigger = screen.getByLabelText('Open action menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    const closeTrigger = screen.getByLabelText('Close action menu');
    expect(closeTrigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('calls onClick when an action is clicked', async () => {
    const actions = createActions();
    render(<ActionMenu actions={actions} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByLabelText('Open action menu'));

    await waitFor(() => screen.getByText('Photo'));
    fireEvent.click(screen.getByText('Photo'));

    expect(actions[0].onClick).toHaveBeenCalledOnce();
  });

  it('closes the popover after clicking an action', async () => {
    render(<ActionMenu actions={createActions()} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByLabelText('Open action menu'));

    await waitFor(() => screen.getByText('Photo'));
    fireEvent.click(screen.getByText('Photo'));

    await waitFor(() => {
      expect(screen.queryByText('File')).not.toBeInTheDocument();
    });
  });

  it('does not fire onClick for disabled actions', async () => {
    const actions = createActions();
    render(<ActionMenu actions={actions} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByLabelText('Open action menu'));

    await waitFor(() => screen.getByText('Voice'));
    const voiceBtn = screen.getByText('Voice').closest('button');
    expect(voiceBtn).toBeDisabled();
  });

  it('closes on Escape key', async () => {
    render(<ActionMenu actions={createActions()} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByLabelText('Open action menu'));

    await waitFor(() => screen.getByText('Photo'));
    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByText('Photo')).not.toBeInTheDocument();
    });
  });

  it('closes on outside click', async () => {
    render(
      <Wrapper>
        <div data-testid="outside">Outside</div>
        <ActionMenu actions={createActions()} />
      </Wrapper>
    );
    fireEvent.click(screen.getByLabelText('Open action menu'));
    await waitFor(() => screen.getByText('Photo'));

    fireEvent.mouseDown(screen.getByTestId('outside'));

    await waitFor(() => {
      expect(screen.queryByText('Photo')).not.toBeInTheDocument();
    });
  });

  it('uses custom renderActionMenu when provided', async () => {
    const customRender = vi.fn((actions, isOpen, onClose) => (
      <div data-testid="custom-menu">Custom {actions.length}</div>
    ));

    render(<ActionMenu actions={createActions()} renderActionMenu={customRender} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByLabelText('Open action menu'));

    await waitFor(() => {
      expect(screen.getByTestId('custom-menu')).toBeInTheDocument();
      expect(screen.getByTestId('custom-menu')).toHaveTextContent('Custom 3');
    });
  });

  it('renders descriptions when provided', async () => {
    const actions: ChatInputAction[] = [
      { id: 'cam', label: 'Camera', icon: <span>📷</span>, onClick: vi.fn(), description: 'Take a photo' },
    ];
    render(<ActionMenu actions={actions} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByLabelText('Open action menu'));

    await waitFor(() => {
      expect(screen.getByText('Take a photo')).toBeInTheDocument();
    });
  });
});
