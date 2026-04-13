import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MediaAttachments } from '../components/MediaAttachments';
import { ChatProvider } from '../context/ChatContext';
import type { ChatMessageAttachment } from '../types';

const wrap = (ui: React.ReactElement, providerProps = {}) =>
  render(
    <ChatProvider messages={[]} onSendMessage={vi.fn()} {...providerProps}>
      {ui}
    </ChatProvider>
  );

const makeImage = (id: string, url = `https://picsum.photos/${id}`): ChatMessageAttachment => ({
  id,
  type: 'image',
  url,
  name: `image-${id}.jpg`,
});

const makeFile = (id: string): ChatMessageAttachment => ({
  id,
  type: 'file',
  url: `https://example.com/${id}.pdf`,
  name: `document-${id}.pdf`,
});

describe('MediaAttachments', () => {
  it('renders nothing when attachments is empty', () => {
    const { container } = wrap(<MediaAttachments attachments={[]} />);
    expect(container.querySelector('.chat-ui-media-attachments')).toBeNull();
  });

  it('renders a single image', () => {
    wrap(<MediaAttachments attachments={[makeImage('1')]} />);
    const img = screen.getByAltText('image-1.jpg');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://picsum.photos/1');
  });

  it('applies grid-1 class for single image', () => {
    const { container } = wrap(<MediaAttachments attachments={[makeImage('1')]} />);
    expect(container.querySelector('.chat-ui-media-grid-1')).toBeInTheDocument();
  });

  it('applies grid-2 class for two images', () => {
    const { container } = wrap(
      <MediaAttachments attachments={[makeImage('1'), makeImage('2')]} />
    );
    expect(container.querySelector('.chat-ui-media-grid-2')).toBeInTheDocument();
  });

  it('applies grid-3 class for three images', () => {
    const { container } = wrap(
      <MediaAttachments attachments={[makeImage('1'), makeImage('2'), makeImage('3')]} />
    );
    expect(container.querySelector('.chat-ui-media-grid-3')).toBeInTheDocument();
  });

  it('applies grid-4-plus class for four+ images', () => {
    const { container } = wrap(
      <MediaAttachments attachments={[makeImage('1'), makeImage('2'), makeImage('3'), makeImage('4')]} />
    );
    expect(container.querySelector('.chat-ui-media-grid-4-plus')).toBeInTheDocument();
  });

  it('shows +N overlay for more than 4 images', () => {
    const { container } = wrap(
      <MediaAttachments attachments={[makeImage('1'), makeImage('2'), makeImage('3'), makeImage('4'), makeImage('5'), makeImage('6')]} />
    );
    const overlay = container.querySelector('.chat-ui-media-more-overlay');
    expect(overlay).toBeInTheDocument();
    expect(overlay?.textContent).toBe('+2');
  });

  it('calls onImageClick when image is clicked', () => {
    const onClick = vi.fn();
    wrap(<MediaAttachments attachments={[makeImage('1')]} onImageClick={onClick} />);
    fireEvent.click(screen.getByAltText('image-1.jpg'));
    expect(onClick).toHaveBeenCalledWith(0, expect.objectContaining({ id: '1' }));
  });

  it('image containers are keyboard accessible when clickable', () => {
    const onClick = vi.fn();
    const { container } = wrap(
      <MediaAttachments attachments={[makeImage('1')]} onImageClick={onClick} />
    );
    const imgContainer = container.querySelector('.chat-ui-media-img-container');
    expect(imgContainer).toHaveAttribute('role', 'button');
    expect(imgContainer).toHaveAttribute('tabIndex', '0');

    fireEvent.keyDown(imgContainer!, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders non-image files as links', () => {
    wrap(<MediaAttachments attachments={[makeFile('1')]} />);
    const link = screen.getByText(/document-1.pdf/);
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('uses renderAttachment override from context', () => {
    const customRender = vi.fn((file) =>
      React.createElement('div', { 'data-testid': 'custom-file' }, file.name)
    );
    wrap(<MediaAttachments attachments={[makeFile('1')]} />, {
      renderAttachment: customRender,
    });
    expect(screen.getByTestId('custom-file')).toHaveTextContent('document-1.pdf');
  });

  it('renders images with lazy loading', () => {
    wrap(<MediaAttachments attachments={[makeImage('1')]} />);
    const img = screen.getByAltText('image-1.jpg');
    expect(img).toHaveAttribute('loading', 'lazy');
  });
});
