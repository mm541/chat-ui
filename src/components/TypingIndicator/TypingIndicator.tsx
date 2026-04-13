import React from 'react';
import { motion } from 'framer-motion';
import { useChat } from '../../context/ChatContext';

export const TypingIndicator: React.FC = () => {
  const { classNames } = useChat();
  const dotTransition = {
    duration: 0.6,
    repeat: Infinity,
    ease: "easeInOut" as const
  };

  return (
    <div className={`chat-ui-typing-indicator ${classNames?.typingIndicator || ''}`}>
      <motion.div
        className="chat-ui-typing-dot"
        animate={{ y: [0, -5, 0] }}
        transition={{ ...dotTransition, delay: 0 }}
      />
      <motion.div
        className="chat-ui-typing-dot"
        animate={{ y: [0, -5, 0] }}
        transition={{ ...dotTransition, delay: 0.2 }}
      />
      <motion.div
        className="chat-ui-typing-dot"
        animate={{ y: [0, -5, 0] }}
        transition={{ ...dotTransition, delay: 0.4 }}
      />
    </div>
  );
};
