import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { MessageBubble } from '../components/MessageBubble';
import { ChatProvider } from '../context/ChatContext';
import type { ChatMessage } from '../types';

const meta: Meta<typeof MessageBubble> = {
  title: 'Components/MessageBubble',
  component: MessageBubble,
  decorators: [(Story) => (
    <ChatProvider messages={[]} onSendMessage={() => {}}>
      <div 
        className="chat-ui-root" 
        style={{ padding: '24px', maxWidth: '600px', background: 'var(--c-bg, #09090b)' }}
        onContextMenu={(e) => e.preventDefault()} // Context menu is custom
      >
        <Story />
      </div>
    </ChatProvider>
  )],
  argTypes: {
    message: { control: 'object' },
    groupPosition: {
      control: 'select',
      options: ['single', 'first', 'middle', 'last'],
      description: 'Controls border radii for consecutive messages',
    },
    isConsecutive: {
      control: 'boolean',
    }
  },
};

export default meta;
type Story = StoryObj<typeof MessageBubble>;

const baseMsg: ChatMessage = {
  id: '1',
  sender: 'agent',
  text: 'Hello! How can I help you today?',
  timestamp: new Date(),
};

export const AgentMessage: Story = {
  args: {
    message: baseMsg,
  },
};

export const UserMessage: Story = {
  args: {
    message: { ...baseMsg, sender: 'user', text: 'I have a question about React hooks' },
  },
};

export const SystemMessage: Story = {
  args: {
    message: { ...baseMsg, sender: 'system', text: 'Chat session started' },
  },
};

export const WithReactions: Story = {
  args: {
    message: {
      ...baseMsg,
      reactions: [
        { emoji: '👍', count: 5, reacted: true },
        { emoji: '❤️', count: 2, reacted: false },
        { emoji: '😄', count: 1, reacted: false },
      ],
    },
  },
};

export const WithAttachments: Story = {
  args: {
    message: {
      ...baseMsg,
      text: 'Here are the design assets you requested:',
      attachments: [
        { id: 'img1', type: 'image', url: 'https://images.unsplash.com/photo-1506744626753-1436bf6201a0?w=800&q=80', name: 'landscape.jpg' },
        { id: 'img2', type: 'image', url: 'https://images.unsplash.com/photo-1511576661531-b34d7da5d0bb?w=800&q=80', name: 'mountains.jpg' },
      ],
    },
  },
};

export const CustomAttachmentRender: Story = {
  render: () => (
    <ChatProvider 
      messages={[]} 
      onSendMessage={() => {}}
      renderAttachment={(att) => (
        <div style={{ padding: '12px', background: 'purple', color: 'white', borderRadius: '8px' }}>
          Custom Renderer: {att.name}
        </div>
      )}
    >
      <div className="chat-ui-root" style={{ padding: '24px', maxWidth: '600px', background: 'var(--c-bg, #09090b)' }}>
        <MessageBubble 
          message={{ 
            ...baseMsg, 
            text: 'I attached a non-image file!',
            attachments: [{ id: 'file1', type: 'file', url: '#', name: 'super-secret-doc.pdf' }]
          }} 
        />
      </div>
    </ChatProvider>
  )
};

export const EditedMessage: Story = {
  args: {
    message: { ...baseMsg, isEdited: true, text: 'This message was corrected.' },
  },
};

export const StreamingMessage: Story = {
  args: {
    message: { ...baseMsg, status: 'streaming', text: 'Typing out a response with **markdown**...' },
  },
};

export const MessageStatuses: Story = {
  render: () => (
    <ChatProvider messages={[]} onSendMessage={() => {}}>
      <div 
        ref={(el) => {
          if (el) {
            el.style.display = 'flex';
            el.style.flexDirection = 'column';
            el.style.gap = '8px';
          }
        }}
      >
        <MessageBubble message={{ ...baseMsg, sender: 'user', status: 'sending', text: 'Sending...', id: '1' }} />
        <MessageBubble message={{ ...baseMsg, sender: 'user', status: 'sent', text: 'Sent', id: '2' }} />
        <MessageBubble message={{ ...baseMsg, sender: 'user', status: 'delivered', text: 'Delivered', id: '3' }} />
        <MessageBubble message={{ ...baseMsg, sender: 'user', status: 'read', text: 'Read', id: '4' }} />
      </div>
    </ChatProvider>
  ),
};

export const GroupPositions: Story = {
  render: () => (
    <ChatProvider messages={[]} onSendMessage={() => {}}>
      <div 
        ref={(el) => {
          if (el) {
            el.style.display = 'flex';
            el.style.flexDirection = 'column';
            el.style.gap = '2px';
          }
        }}
      >
        <MessageBubble message={{ ...baseMsg, text: 'First in group', id: '1' }} groupPosition="first" />
        <MessageBubble message={{ ...baseMsg, text: 'Middle message', id: '2' }} groupPosition="middle" isConsecutive />
        <MessageBubble message={{ ...baseMsg, text: 'Last in group', id: '3' }} groupPosition="last" isConsecutive />
      </div>
    </ChatProvider>
  ),
};

export const WithCustomClasses: Story = {
  render: () => (
    <ChatProvider 
      messages={[]} 
      onSendMessage={() => {}}
      classNames={{
        bubbleSent: 'bg-emerald-600 text-white rounded-none shadow-none',
        timestamp: 'text-emerald-300 italic',
      }}
    >
      <div className="chat-ui-root" style={{ padding: '24px', maxWidth: '600px', background: 'var(--c-bg, #09090b)' }}>
        <MessageBubble message={{ ...baseMsg, sender: 'user', text: 'Custom themed bubble via global context injection.' }} />
      </div>
    </ChatProvider>
  ),
};

