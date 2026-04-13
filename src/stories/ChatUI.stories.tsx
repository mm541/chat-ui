import type { Meta, StoryObj } from '@storybook/react';
import React, { useState, useEffect, useCallback } from 'react';
import { ChatUI } from '../components/ChatUI';
import type { ChatMessage } from '../types';

const meta: Meta<typeof ChatUI> = {
  title: 'Components/ChatUI',
  component: ChatUI,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [(Story) => (
    <div 
      className="chat-ui-story-decorator"
      ref={(el) => {
        if (el) {
          el.style.height = '100vh';
          el.style.width = '100%';
        }
      }}
    >
      <Story />
    </div>
  )],
};

export default meta;
type Story = StoryObj<typeof ChatUI>;

// ===== Helpers =====
const sampleMessages: ChatMessage[] = [
  { id: '1', sender: 'agent', text: 'Hello! How can I help you today?', timestamp: new Date(Date.now() - 60000 * 5) },
  { id: '2', sender: 'user', text: 'Can you explain **React hooks**?', timestamp: new Date(Date.now() - 60000 * 4) },
  { id: '3', sender: 'agent', text: 'Sure! React hooks are functions that let you use state and lifecycle features in function components.\n\n- `useState` — local state\n- `useEffect` — side effects\n- `useRef` — mutable refs\n- `useMemo` — memoized values\n\nHere\'s a quick example:\n\n```tsx\nconst [count, setCount] = useState(0);\n\nuseEffect(() => {\n  document.title = `Count: ${count}`;\n}, [count]);\n```\n\nWant me to explain any specific hook?', timestamp: new Date(Date.now() - 60000 * 3) },
  { id: '4', sender: 'user', text: 'What about useCallback?', timestamp: new Date(Date.now() - 60000 * 2) },
  { id: '5', sender: 'agent', text: '`useCallback` memoizes a function so it maintains the same reference across renders — useful for passing callbacks to child components.\n\n```tsx\nconst handleClick = useCallback(() => {\n  setItems(prev => [...prev, newItem]);\n}, [newItem]);\n```\n\n> **Tip:** Only use it when the function is a dependency of `useMemo` or is passed to a memoized child.', timestamp: new Date(Date.now() - 60000) },
];

// ===== Stories =====

/** Default dark theme with markdown messages */
export const Default: Story = {
  render: () => {
    const ChatDemo = () => {
      const [messages, setMessages] = useState<ChatMessage[]>(sampleMessages);
      const handleSend = (text: string) => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'user',
          text,
          timestamp: new Date(),
        }]);
      };
      return <ChatUI messages={messages} onSendMessage={handleSend} headerTitle="AI Assistant" headerSubtitle="Online" />;
    };
    return <ChatDemo />;
  },
};

/** Light theme variant */
export const LightTheme: Story = {
  render: () => {
    const ChatDemo = () => {
      const [messages, setMessages] = useState<ChatMessage[]>(sampleMessages);
      return <ChatUI messages={messages} onSendMessage={() => {}} headerTitle="Light Mode" theme="light" />;
    };
    return <ChatDemo />;
  },
};

/** Streaming text with blinking cursor */
export const Streaming: Story = {
  render: () => {
    const StreamingDemo = () => {
      const fullText = "Here's a **streaming response** with `code` and even a code block:\n\n```python\ndef hello():\n    print('Hello, World!')\n```\n\nPretty cool, right?";
      const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', sender: 'user', text: 'Show me streaming', timestamp: new Date() },
        { id: '2', sender: 'agent', text: '', status: 'streaming', timestamp: new Date() },
      ]);

      useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
          if (i >= fullText.length) {
            setMessages(prev => prev.map(m => m.id === '2' ? { ...m, status: 'delivered' } : m));
            clearInterval(interval);
            return;
          }
          i += 3;
          setMessages(prev => prev.map(m => m.id === '2' ? { ...m, text: fullText.slice(0, i) } : m));
        }, 50);
        return () => clearInterval(interval);
      }, []);

      return <ChatUI messages={messages} onSendMessage={() => {}} headerTitle="Streaming Demo" />;
    };
    return <StreamingDemo />;
  },
};

/** Message grouping — clustered bubbles with asymmetric radii */
export const MessageGrouping: Story = {
  render: () => {
    const now = Date.now();
    const grouped: ChatMessage[] = [
      { id: '1', sender: 'user', text: 'Hey', timestamp: new Date(now - 10000) },
      { id: '2', sender: 'user', text: 'How are you?', timestamp: new Date(now - 9000) },
      { id: '3', sender: 'user', text: 'I have a question about React', timestamp: new Date(now - 8000) },
      { id: '4', sender: 'agent', text: 'Hi there! 👋', timestamp: new Date(now - 6000) },
      { id: '5', sender: 'agent', text: 'I\'m doing great, thanks for asking!', timestamp: new Date(now - 5000) },
      { id: '6', sender: 'agent', text: 'What\'s your question?', timestamp: new Date(now - 4000) },
      { id: '7', sender: 'system', text: 'Topic: React Hooks', timestamp: new Date(now - 3000) },
      { id: '8', sender: 'user', text: 'Single message after system', timestamp: new Date(now - 1000) },
    ];
    return <ChatUI messages={grouped} onSendMessage={() => {}} headerTitle="Grouping Demo" />;
  },
};

/** Reactions and edited messages */
export const ReactionsAndEdited: Story = {
  render: () => {
    const ReactionsDemo = () => {
      const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', sender: 'user', text: 'Check out this feature!', timestamp: new Date(), reactions: [{ emoji: '👍', count: 3, reacted: true }, { emoji: '🎉', count: 1, reacted: false }] },
        { id: '2', sender: 'agent', text: 'This message was edited', timestamp: new Date(), isEdited: true },
        { id: '3', sender: 'user', text: 'Can you react to this?', timestamp: new Date(), reactions: [{ emoji: '❤️', count: 5, reacted: false }] },
      ]);

      const handleReaction = useCallback((msg: ChatMessage, emoji: string) => {
        setMessages(prev => prev.map(m => {
          if (m.id !== msg.id) return m;
          const existing = m.reactions?.find(r => r.emoji === emoji);
          if (existing) {
            return { ...m, reactions: m.reactions!.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, reacted: true } : r) };
          }
          return { ...m, reactions: [...(m.reactions || []), { emoji, count: 1, reacted: true }] };
        }));
      }, []);

      return <ChatUI messages={messages} onSendMessage={() => {}} onReaction={handleReaction} headerTitle="Reactions Demo" />;
    };
    return <ReactionsDemo />;
  },
};

/** Custom empty state */
export const EmptyState: Story = {
  render: () => (
    <ChatUI
      messages={[]}
      onSendMessage={() => {}}
      headerTitle="New Chat"
      renderEmptyState={() => (
        <div 
          ref={(el) => {
            if (el) {
              el.style.textAlign = 'center';
              el.style.opacity = '0.5';
            }
          }}
        >
          <div 
            ref={(el) => {
              if (el) {
                el.style.fontSize = '3rem';
                el.style.marginBottom = '8px';
              }
            }}
          >💬</div>
          <div>Start a conversation!</div>
        </div>
      )}
    />
  ),
};

/** System messages */
export const SystemMessages: Story = {
  render: () => {
    const msgs: ChatMessage[] = [
      { id: '1', sender: 'system', text: 'Chat started', timestamp: new Date(Date.now() - 60000) },
      { id: '2', sender: 'agent', text: 'Welcome! I\'m your AI assistant.', timestamp: new Date(Date.now() - 50000) },
      { id: '3', sender: 'system', text: 'User upgraded to Pro', timestamp: new Date(Date.now() - 30000) },
      { id: '4', sender: 'user', text: 'Thanks!', timestamp: new Date() },
    ];
    return <ChatUI messages={msgs} onSendMessage={() => {}} headerTitle="System Messages" />;
  },
};

/** Spanish localization via custom dictionary */
export const SpanishLocalization: Story = {
  render: () => {
    const esDictionary = {
      inputPlaceholder: "Escribe un mensaje...",
      sendButtonAriaLabel: "Enviar mensaje",
      statusSent: "Enviado",
      statusDelivered: "Entregado",
      searchPlaceholder: "Buscar mensajes...",
    };
    return (
      <ChatUI 
        messages={sampleMessages} 
        onSendMessage={() => {}} 
        dictionary={esDictionary}
        headerTitle="Asistente IA" 
        headerSubtitle="En línea" 
      />
    );
  },
};

/** Deep styling via classNames (Tailwind example) */
export const CustomStyling: Story = {
  render: () => (
    <ChatUI
      messages={sampleMessages}
      onSendMessage={() => {}}
      headerTitle="Styled Chat"
      classNames={{
        chatRoot: 'border-2 border-indigo-500 rounded-xl overflow-hidden shadow-2xl',
        header: 'bg-indigo-600 text-white',
        bubbleSent: 'bg-indigo-500 text-white shadow-md',
        bubbleReceived: 'bg-slate-100 text-slate-800',
        inputContainer: 'border-t-2 border-indigo-200 bg-slate-50',
      }}
    />
  ),
};

/** Interactive Pinned Messages */
export const PinnedMessages: Story = {
  render: () => {
    const msgs: ChatMessage[] = [
      ...sampleMessages,
      { id: 'pin-1', sender: 'agent', text: '📌 This is a pinned message with important context!', timestamp: new Date(), isPinned: true },
      { id: 'pin-2', sender: 'user', text: 'Another pinned message about the project goals.', timestamp: new Date(), isPinned: true },
    ];
    return <ChatUI messages={msgs} onSendMessage={() => {}} headerTitle="Pinned Messages" />;
  },
};

