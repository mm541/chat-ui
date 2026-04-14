import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import type { SuggestedReply } from '../../types';

export interface SuggestedRepliesProps {
  suggestions: SuggestedReply[];
  onSelect: (suggestion: SuggestedReply) => void;
  className?: string;
  /** Injected className for individual chips */
  chipClassName?: string;
}

export const SuggestedReplies: React.FC<SuggestedRepliesProps> = ({
  suggestions,
  onSelect,
  className,
  chipClassName,
}) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={clsx('chat-ui-suggestions', className)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {suggestions.map((s, idx) => (
          <motion.button
            key={s.id}
            className={clsx('chat-ui-suggestion-chip', chipClassName)}
            onClick={() => onSelect(s)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05, duration: 0.2 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            {s.icon && <span className="chat-ui-suggestion-icon">{s.icon}</span>}
            {s.label}
          </motion.button>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};
