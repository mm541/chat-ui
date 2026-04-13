import clsx from 'clsx';
import type { ChatMessage } from '../index';
import { useCopyToClipboard } from '../index';

// ─── Copy Button (needs hook, so it's a component) ──────────────────
export const CopyButton = ({ msg }: { msg: ChatMessage }) => {
  const { isCopied, copy } = useCopyToClipboard(2000);
  return (
    <button
      className="chat-ui-action-btn"
      onClick={() => copy(msg.text || '')}
      aria-label="Copy to clipboard"
    >
      {isCopied ? '✅' : '📋'}
    </button>
  );
};

// ─── Render Props ────────────────────────────────────────────────────

export const renderCustomMessage = (msg: ChatMessage) => {
  if (msg.payload?.type === 'image') {
    return (
      <div className={clsx('dev-payload-img-wrapper', msg.sender === 'user' ? 'sent' : 'received')}>
        <img src={msg.payload.url} alt="Payload" className="dev-payload-img" />
      </div>
    );
  }
  return undefined;
};

export const renderActionBar = (msg: ChatMessage) => {
  if (msg.sender === 'user') return null;
  return (
    <div className="dev-action-bar">
      <CopyButton msg={msg} />
      <button className="chat-ui-action-btn">🔄</button>
      <button className="chat-ui-action-btn">👍</button>
    </div>
  );
};

export const renderQuote = (msg: ChatMessage) => {
  return <i>"{msg.text?.slice(0, 30)}..."</i>;
};

export const renderAvatar = (msg: ChatMessage) => (
  <div className={clsx('dev-avatar-custom', msg.sender === 'user' ? 'dev-avatar-user' : 'dev-avatar-ai')}>
    {msg.sender === 'user' ? 'U' : 'AI'}
  </div>
);

export const renderInputActions = () => (
  <div className="dev-input-actions-wrapper">
    <button className="chat-ui-action-btn">😊</button>
    <button className="chat-ui-action-btn">🎤</button>
    <button className="chat-ui-action-btn">📎</button>
  </div>
);

export const renderInputToolbar = () => (
  <div className="dev-input-toolbar-note">
    AI models can make mistakes.
  </div>
);

export const renderDateSeparator = (date: Date) => (
  <div className="dev-date-separator">
    {date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
  </div>
);

export const createRenderEmptyState = (handleSendMessage: (text: string) => void) => () => (
  <div className="dev-empty-state">
    <div className="dev-empty-state-icon">✨</div>
    <h2 className="dev-empty-state-title">How can I help you today?</h2>
    <div className="dev-ideas-grid">
      {['Plan a trip', 'Write a story', 'Debug my code', 'Explain quantum physics'].map(idea => (
        <button key={idea} onClick={() => handleSendMessage(idea)} className="dev-idea-btn">
          {idea}
        </button>
      ))}
    </div>
  </div>
);
