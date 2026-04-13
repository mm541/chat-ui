import React from 'react';
import { Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../../context/ChatContext';

export interface DropZoneProps {
  isDragging: boolean;
  text?: string;
  renderOverlay?: (isDragging: boolean) => React.ReactNode;
  className?: string;
}

export const DropZone: React.FC<DropZoneProps> = ({
  isDragging,
  text = 'Drop files here',
  renderOverlay,
  className,
}) => {
  const { dictionary, classNames } = useChat();
  const defaultText = dictionary.dropZoneText || 'Drop files here';
  const displayText = text || defaultText;
  if (renderOverlay) {
    return <>{renderOverlay(isDragging)}</>;
  }

  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div
          className={`chat-ui-drop-zone ${classNames?.dropZone || ''} ${className || ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="chat-ui-drop-zone-inner">
            <Upload size={40} />
            <span>{displayText}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
