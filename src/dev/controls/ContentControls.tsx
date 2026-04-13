import type { ChatMessage } from '../../index';
import { largeStreamContent } from '../constants';

interface ContentControlsProps {
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export const ContentControls = ({ setMessages }: ContentControlsProps) => (
  <div className="dev-controls-group">
    <span className="dev-section-label">Content</span>
    <button
      className="dev-btn primary"
      onClick={() => {
        const agentMsg: ChatMessage = {
          id: `stream-${Date.now()}`,
          text: '',
          sender: 'agent',
          timestamp: new Date(),
          status: 'streaming',
        };
        setMessages(prev => [...prev, agentMsg]);

        let i = 0;
        const interval = setInterval(() => {
          i += 4;
          if (i >= largeStreamContent.length) {
            i = largeStreamContent.length;
            clearInterval(interval);
            setMessages(prev =>
              prev.map(m =>
                m.id === agentMsg.id
                  ? { ...m, text: largeStreamContent, status: 'delivered' }
                  : m
              )
            );
          } else {
            setMessages(prev =>
              prev.map(m =>
                m.id === agentMsg.id
                  ? { ...m, text: largeStreamContent.slice(0, i) }
                  : m
              )
            );
          }
        }, 15);
      }}
    >
      Stream Large
    </button>

    <button
      className="dev-btn secondary"
      onClick={() => {
        const msg: ChatMessage = {
          id: `msg-${Date.now()}`,
          text: 'Here is a photo of some mountains!',
          sender: 'agent',
          timestamp: new Date(),
          status: 'delivered',
          attachments: [
            { id: '1', type: 'image', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', name: 'mountains.jpg' }
          ]
        };
        setMessages(prev => [...prev, msg]);
      }}
    >
      Send 1 Image
    </button>

    <button
      className="dev-btn secondary"
      onClick={() => {
        const msg: ChatMessage = {
          id: `msg-${Date.now()}`,
          text: 'Check out these cool wallpapers',
          sender: 'user',
          timestamp: new Date(),
          status: 'read',
          attachments: [
            { id: 'img1', type: 'image', url: 'https://images.unsplash.com/photo-1506744626753-1436bf6201a0?w=800&q=80', name: 'landscape1.jpg' },
            { id: 'img2', type: 'image', url: 'https://images.unsplash.com/photo-1511576661531-b34d7da5d0bb?w=800&q=80', name: 'landscape2.jpg' },
            { id: 'img3', type: 'image', url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80', name: 'landscape3.jpg' },
            { id: 'img4', type: 'image', url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80', name: 'landscape4.jpg' },
            { id: 'img5', type: 'image', url: 'https://images.unsplash.com/photo-1434725039720-aaad6dd32dfe?w=800&q=80', name: 'landscape5.jpg' }
          ]
        };
        setMessages(prev => [...prev, msg]);
      }}
    >
      Send 5 Images
    </button>
  </div>
);
