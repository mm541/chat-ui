import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SlashCommand } from '../../types';
import { useChat } from '../../context/ChatContext';

export interface SlashCommandsProps {
  commands: SlashCommand[];
  selectedIndex: number;
  onSelect: (command: SlashCommand) => void;
  className?: string;
}

export const SlashCommands: React.FC<SlashCommandsProps> = ({
  commands,
  selectedIndex,
  onSelect,
  className,
}) => {
  const { dictionary, classNames: globalClassNames } = useChat();

  if (commands.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={`chat-ui-slash-menu ${globalClassNames?.slashMenu || ''} ${className || ''}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.15 }}
      >
        <div role="listbox" aria-label={dictionary.slashCommandsAriaLabel} className="chat-ui-slash-listbox">
          {commands.map((cmd, idx) => (
            <button
              key={cmd.id}
              className={`chat-ui-slash-item ${globalClassNames?.slashMenuItem || ''} ${idx === selectedIndex ? 'selected' : ''}`}
              onClick={() => onSelect(cmd)}
              role="option"
              {...{ 'aria-selected': idx === selectedIndex }}
            >
              {cmd.icon && <span className="chat-ui-slash-icon">{cmd.icon}</span>}
              <div className="chat-ui-slash-label-col">
                <span className="chat-ui-slash-shortcut">{cmd.shortcut}</span>
                <span className="chat-ui-slash-label">{cmd.label}</span>
                {cmd.description && (
                  <span className="chat-ui-slash-desc">{cmd.description}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
