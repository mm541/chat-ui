import React from 'react';
import { Pin, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChatMessage } from '../../types';
import { useChat } from '../../context/ChatContext';

export interface PinnedBannerProps {
  pinnedMessages: ChatMessage[];
  onJump?: (msg: ChatMessage) => void;
  className?: string;
}

export const PinnedBanner: React.FC<PinnedBannerProps> = ({
  pinnedMessages,
  onJump,
  className,
}) => {
  const { dictionary, classNames } = useChat();

  if (!pinnedMessages || pinnedMessages.length === 0) return null;

  const latest = pinnedMessages[pinnedMessages.length - 1];

  return (
    <AnimatePresence>
      <motion.div
        className={`chat-ui-pinned-banner ${classNames?.pinnedBanner || ''} ${className || ''}`}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => onJump?.(latest)}
        role="button"
        tabIndex={0}
        aria-label={`${dictionary.pinnedMessageAriaLabel} ${latest.text?.slice(0, 50)}`}
      >
        <Pin size={14} className="chat-ui-pinned-icon" />
        <div className="chat-ui-pinned-text">
          {latest.text?.slice(0, 100)}{(latest.text?.length || 0) > 100 ? '…' : ''}
        </div>
        {pinnedMessages.length > 1 && (
          <span className="chat-ui-pinned-count">{pinnedMessages.length}</span>
        )}
        <ChevronRight size={14} className="chat-ui-pinned-arrow" />
      </motion.div>
    </AnimatePresence>
  );
};
