import React from 'react';
import { clsx } from 'clsx';
import type { PresenceStatus } from '../../types';

export interface PresenceIndicatorProps {
  status: PresenceStatus;
  renderPresence?: (status: PresenceStatus) => React.ReactNode;
  className?: string;
}

const statusLabels: Record<PresenceStatus, string> = {
  online: 'Online',
  offline: 'Offline',
  away: 'Away',
  busy: 'Do not disturb',
};

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  status,
  renderPresence,
  className,
}) => {
  if (renderPresence) {
    return <>{renderPresence(status)}</>;
  }

  return (
    <span
      className={clsx('chat-ui-presence', `chat-ui-presence-${status}`, className)}
      role="status"
      aria-label={statusLabels[status]}
      title={statusLabels[status]}
    />
  );
};
