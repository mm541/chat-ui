import type { ChatMessage, ChatControllerRef } from '../../index';
import { initialMessages } from '../constants';

interface StateControlsProps {
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  chatRef: React.RefObject<ChatControllerRef | null>;
}

export const StateControls = ({ setMessages, chatRef }: StateControlsProps) => (
  <div className="dev-controls-group">
    <span className="dev-section-label">State</span>
    <button className="dev-btn" onClick={() => setMessages([])}>
      Empty State
    </button>
    <button className="dev-btn" onClick={() => setMessages(initialMessages)}>
      Reset Chat
    </button>
    <button
      className="dev-btn"
      onClick={() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            text: 'System alert: User triggered external action',
            sender: 'system',
            timestamp: new Date(),
          },
        ]);
        setTimeout(() => chatRef.current?.scrollToBottom(), 50);
      }}
    >
      Push Alert
    </button>
  </div>
);
