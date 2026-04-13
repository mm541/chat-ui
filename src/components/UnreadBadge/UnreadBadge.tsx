import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export interface UnreadBadgeProps {
  count: number;
  onClick: () => void;
  className?: string;
}

export const UnreadBadge: React.FC<UnreadBadgeProps> = ({
  count,
  onClick,
  className,
}) => {
  const { dictionary, classNames } = useChat();

  if (count <= 0) return null;

  return (
    <AnimatePresence>
      <motion.button
        className={`chat-ui-unread-badge ${classNames?.unreadBadge || ''} ${className || ''}`}
        onClick={onClick}
        initial={{ opacity: 0, y: 10, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        aria-label={dictionary.unreadBadgeText(count)}
      >
        <ChevronDown size={14} />
        <span>{dictionary.unreadBadgeText(count)}</span>
      </motion.button>
    </AnimatePresence>
  );
};
