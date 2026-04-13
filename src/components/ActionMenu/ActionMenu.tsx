import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { useChat } from '../../context/ChatContext';
import type { ChatInputAction } from '../../types';

export interface ActionMenuProps {
  actions: ChatInputAction[];
  renderActionMenu?: (actions: ChatInputAction[], isOpen: boolean, onClose: () => void) => React.ReactNode;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({ actions, renderActionMenu }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { dictionary, classNames } = useChat();

  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeMenu]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeMenu]);

  const handleActionClick = (action: ChatInputAction) => {
    if (action.disabled) return;
    action.onClick();
    closeMenu();
  };

  return (
    <div className="chat-ui-action-menu-root" ref={menuRef}>
      {/* The "+" trigger button */}
      <motion.button
        className={clsx("chat-ui-action-trigger", classNames?.actionMenuTrigger)}
        onClick={toggleMenu}
        aria-label={isOpen ? dictionary.actionMenuCloseAriaLabel : dictionary.actionMenuOpenAriaLabel}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Plus size={22} />
      </motion.button>

      {/* The popover */}
      <AnimatePresence>
        {isOpen && (
          renderActionMenu ? (
            renderActionMenu(actions, isOpen, closeMenu)
          ) : (
            <motion.div
              className={clsx("chat-ui-action-popover", classNames?.actionMenuPopover)}
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <div className="chat-ui-action-popover-grid" {...{ role: 'menu' }}>
                {actions.map((action, index) => (
                  <motion.button
                    key={action.id}
                    className={clsx(
                      'chat-ui-action-item',
                      action.disabled && 'chat-ui-action-item--disabled',
                      classNames?.actionMenuItem
                    )}
                    onClick={() => handleActionClick(action)}
                    disabled={action.disabled}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04, type: 'spring', stiffness: 400, damping: 25 }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    role="menuitem"
                  >
                    <span
                      className="chat-ui-action-item-icon"
                      ref={(el) => {
                        if (el && action.color) {
                          el.style.backgroundColor = action.color;
                        }
                      }}
                    >
                      {action.icon}
                    </span>
                    <span className="chat-ui-action-item-label">{action.label}</span>
                    {action.description && (
                      <span className="chat-ui-action-item-desc">{action.description}</span>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
};
