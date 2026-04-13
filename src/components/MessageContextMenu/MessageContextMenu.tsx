import React, { useState, useEffect, useRef } from 'react';
import { Copy, Pencil, Trash2, Reply, MoreHorizontal } from 'lucide-react';
import type { ChatMessage } from '../../types';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { useChat } from '../../context/ChatContext';

export interface MessageContextMenuProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  onReply?: (message: ChatMessage) => void;
  onEdit?: (message: ChatMessage) => void;
  onDelete?: (message: ChatMessage) => void;
}

interface MenuPosition {
  x: number;
  y: number;
}

export const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
  message,
  isOwnMessage,
  onReply,
  onEdit,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ x: 0, y: 0 });
  const [showTrigger, setShowTrigger] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { copy, isCopied } = useCopyToClipboard(1500);
  const { dictionary, classNames } = useChat();

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const openMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPosition({ x: rect.left, y: rect.bottom + 4 });
    setIsOpen(true);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
  };

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const menuItems = [
    {
      icon: <Reply size={14} />,
      label: dictionary.contextMenuReply,
      onClick: () => onReply?.(message),
      show: !!onReply,
    },
    {
      icon: isCopied ? <Copy size={14} /> : <Copy size={14} />,
      label: isCopied ? dictionary.contextMenuCopied : dictionary.contextMenuCopy,
      onClick: () => copy(message.text || ''),
      show: !!message.text,
    },
    {
      icon: <Pencil size={14} />,
      label: dictionary.contextMenuEdit,
      onClick: () => onEdit?.(message),
      show: isOwnMessage && !!onEdit,
    },
    {
      icon: <Trash2 size={14} />,
      label: dictionary.contextMenuDelete,
      onClick: () => onDelete?.(message),
      show: isOwnMessage && !!onDelete,
      danger: true,
    },
  ].filter(item => item.show);

  return (
    <div
      className="chat-ui-context-menu-anchor"
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setShowTrigger(true)}
      onMouseLeave={() => setShowTrigger(false)}
    >
      {/* ⋯ trigger button */}
      <button
        ref={triggerRef}
        className={`chat-ui-context-trigger ${showTrigger || isOpen ? 'visible' : ''} ${classNames?.contextMenuTrigger || ''}`}
        onClick={openMenu}
        aria-label={dictionary.contextMenuAriaLabel}
        title={dictionary.contextMenuAriaLabel}
        aria-haspopup="menu"
        {...{ 'aria-expanded': isOpen || false }}
      >
        <MoreHorizontal size={16} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={`chat-ui-context-menu ${classNames?.contextMenuPopover || ''}`}
          role="menu"
          aria-label={dictionary.contextMenuAriaLabel}
          ref={(el) => {
            (menuRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
            if (el) {
              el.style.left = `${position.x}px`;
              el.style.top = `${position.y}px`;
            }
          }}
        >
          {menuItems.map((item) => (
            <button
              key={item.label}
              className={`chat-ui-context-menu-item ${item.danger ? 'danger' : ''} ${classNames?.contextMenuItem || ''}`}
              onClick={() => handleAction(item.onClick)}
              role="menuitem"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
