import React from 'react';
import { clsx } from 'clsx';
import { Sparkles } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export interface ChatHeaderProps {
  title?: string;
  subtitle?: string;
  avatar?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  title = 'Chat',
  subtitle,
  avatar,
  actions,
  className,
}) => {
  const { classNames: globalClassNames } = useChat();
  return (
    <div className={clsx('chat-ui-header', globalClassNames?.header, className)} role="banner" aria-label={title}>
      <div className="chat-ui-header-left">
        {avatar || (
          <div className="chat-ui-header-avatar-default">
            <Sparkles size={16} color="white" />
          </div>
        )}
        <div>
          <div className={clsx('chat-ui-header-title', globalClassNames?.headerTitle)}>{title}</div>
          {subtitle && (
            <div className={clsx('chat-ui-header-subtitle', globalClassNames?.headerSubtitle)}>
               <div className="chat-ui-header-status-dot" />
               {subtitle}
            </div>
          )}
        </div>
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
};
