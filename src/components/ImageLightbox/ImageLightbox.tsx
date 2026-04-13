import React, { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { createPortal } from 'react-dom';
import type { ChatMessageAttachment } from '../../types';
import './ImageLightbox.css';

export interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: ChatMessageAttachment[];
  initialIndex?: number;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Sync state if reopened with different initialIndex
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  // Auto-focus the close button when lightbox opens (a11y)
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft') handlePrev();
    
    // Focus trap: keep Tab within the lightbox
    if (e.key === 'Tab' && overlayRef.current) {
      const focusable = overlayRef.current.querySelectorAll<HTMLElement>(
        'button, a[href], [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }, [onClose, handleNext, handlePrev]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  const content = (
    <AnimatePresence>
      <motion.div
        className="chat-ui-lightbox-overlay"
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={`Image viewer — ${currentImage.name || `image ${currentIndex + 1} of ${images.length}`}`}
      >
        <button
          ref={closeButtonRef}
          className="chat-ui-lightbox-close"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close image viewer"
        >
          <X size={24} />
        </button>

        {images.length > 1 && (
          <>
            <button className="chat-ui-lightbox-nav prev" onClick={handlePrev} aria-label="Previous image">
              <ChevronLeft size={36} />
            </button>
            <button className="chat-ui-lightbox-nav next" onClick={handleNext} aria-label="Next image">
              <ChevronRight size={36} />
            </button>
            <div className="chat-ui-lightbox-counter" aria-live="polite">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}

        <motion.div
          className="chat-ui-lightbox-content"
          key={currentImage.id} // Re-animate if image changes
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()} // Prevent close when clicking image
        >
          <img
            src={currentImage.url}
            alt={currentImage.name || `Attachment ${currentIndex + 1}`}
            className="chat-ui-lightbox-img"
          />
          {currentImage.name && (
            <div className="chat-ui-lightbox-footer">
              <span className="chat-ui-lightbox-title">{currentImage.name}</span>
              <a 
                href={currentImage.url} 
                download 
                target="_blank" 
                rel="noopener noreferrer"
                className="chat-ui-lightbox-download"
                aria-label={`Download ${currentImage.name}`}
              >
                <Download size={18} />
              </a>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};
