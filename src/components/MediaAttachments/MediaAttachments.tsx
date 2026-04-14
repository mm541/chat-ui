import React from 'react';
import clsx from 'clsx';
import { useChat } from '../../context/ChatContext';
import type { ChatMessageAttachment } from '../../types';
import './MediaAttachments.css';

export interface MediaAttachmentsProps {
  attachments: ChatMessageAttachment[];
  onImageClick?: (index: number, attachment: ChatMessageAttachment) => void;
  className?: string;
}

export const MediaAttachments: React.FC<MediaAttachmentsProps> = ({
  attachments,
  onImageClick,
  className,
}) => {
  const { renderAttachment, classNames } = useChat();

  if (!attachments || attachments.length === 0) return null;

  // Split attachments by type
  const images = attachments.filter((a) => a.type === 'image');
  const others = attachments.filter((a) => a.type !== 'image');

  // Determine grid layout class based on number of images
  const gridClass =
    images.length === 1
      ? 'chat-ui-media-grid-1'
      : images.length === 2
      ? 'chat-ui-media-grid-2'
      : images.length === 3
      ? 'chat-ui-media-grid-3'
      : 'chat-ui-media-grid-4-plus';

  return (
    <div className={clsx('chat-ui-media-attachments', className)}>
      {images.length > 0 && (
        <div className={clsx('chat-ui-media-grid', gridClass)}>
          {images.slice(0, 4).map((img, idx) => (
            <div
              key={img.id}
              className={clsx('chat-ui-media-img-container', classNames?.attachmentItem)}
              onClick={() => onImageClick?.(idx, img)}
              role={onImageClick ? 'button' : undefined}
              tabIndex={onImageClick ? 0 : undefined}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onImageClick?.(idx, img);
                }
              }}
            >
              <img src={img.url} alt={img.name || 'Attachment'} className="chat-ui-media-img" loading="lazy" />
              {/* Overlay for +N more images if there are more than 4 */}
              {idx === 3 && images.length > 4 && (
                <div className="chat-ui-media-more-overlay">
                  +{images.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Other files fallback (e.g. PDFs, docs) */}
      {others.length > 0 && (
        <div className="chat-ui-media-files">
          {others.map((file) => (
            <div key={file.id} className={clsx('chat-ui-media-file-item', classNames?.attachmentItem)}>
              {renderAttachment ? (
                renderAttachment(file)
              ) : (
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="chat-ui-media-file-link">
                  📄 {file.name || 'document'}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
