<p align="center">
  <img src="https://img.shields.io/npm/v/chat-ui?style=flat-square&color=7c3aed" />
  <img src="https://img.shields.io/badge/React-18%2B-61dafb?style=flat-square" />
  <img src="https://img.shields.io/badge/TypeScript-First-3178c6?style=flat-square" />
  <img src="https://img.shields.io/badge/License-MIT-22c55e?style=flat-square" />
</p>

# 💬 Chat UI

A **production-ready**, highly customizable conversational UI component library for React. Built with TypeScript, powered by Framer Motion, and designed with a modular architecture that lets you use the defaults, override any piece, or go completely headless.

```bash
npm install chat-ui
```

---

## ✨ Features

| Feature | Description | Opt-in Prop |
|---------|-------------|-------------|
| **Markdown Streaming** | Real-time markdown rendering during LLM streaming | Always on |
| **Suggested Replies** | Clickable action chips after agent messages | `suggestions` |
| **Voice Input** | Browser-native speech-to-text (Web Speech API) | `enableVoiceInput` |
| **Slash Commands** | `/command` palette with keyboard navigation | `slashCommands` |
| **Text-to-Speech** | Read-aloud button on agent messages (SpeechSynthesis) | `enableTTS` |
| **Message Pinning** | Pin messages with a sticky banner | `onPinMessage` |
| **Unread Badge** | "N new" count when scrolled away | `showUnreadBadge` |
| **Drag & Drop Zone** | Full-container file drop overlay | `renderDropZone` |
| **Presence Indicator** | Online/away/busy/offline status dot | `presence` |
| **Action Menu** | Expandable "+" button with rich actions | `inputActions` |
| **Image Lightbox** | Gallery viewer for image attachments | Always on |
| **Virtualized List** | `@tanstack/react-virtual` for 10K+ messages | Always on |
| **Sub-microsecond Sizing** | `@chenglou/pretext` for ultra-fast off-DOM height calculations | Always on |
| **Theming** | Dark/Light/Custom tokens via CSS variables with IDE autocomplete | `theme` |
| **Character Counter** | Input length validation with visual over-limit state | `maxInputLength` |
| **Custom Send/Attach** | Replace the send or attach button with any custom UI | `renderSendButton` |
| **Message Search** | Full-text message search with highlighting | `useMessageSearch` |

---

## 🚀 Quick Start

```tsx
import { ChatUI } from 'chat-ui';
import type { ChatMessage } from 'chat-ui';
import 'chat-ui/dist/chat-ui.css';
import { useState } from 'react';

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! How can I help you?',
      sender: 'agent',
      timestamp: new Date(),
    },
  ]);

  const handleSend = (text: string) => {
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), text, sender: 'user', timestamp: new Date() },
    ]);
    // Call your LLM API here...
  };

  return (
    <ChatUI
      messages={messages}
      onSendMessage={handleSend}
      headerTitle="My Chat App"
      theme="dark"
    />
  );
}
```

---

## 📖 API Reference

### `<ChatUI>` Props

#### Core

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `messages` | `ChatMessage[]` | **required** | Array of messages to display |
| `onSendMessage` | `(text: string) => void` | **required** | Called when user sends a message |
| `theme` | `'dark' \| 'light' \| ChatTokens` | `'dark'` | Theme mode or custom CSS variables with autocomplete |
| `placeholder` | `string` | `'Type a message...'` | Input placeholder text |
| `isTyping` | `boolean` | `false` | Show typing indicator |
| `headerTitle` | `string` | `'Chat'` | Header title text |
| `headerSubtitle` | `string` | — | Header subtitle text |
| `headerAvatar` | `React.ReactNode` | — | Custom header avatar |
| `className` | `string` | — | Root container class |
| `classNames` | `ChatClassNames` | — | Per-element class overrides (e.g. Tailwind) |
| `dictionary` | `Partial<ChatDictionary>`| — | UI string overrides for Localization (i18n) |
| `allowEditing` | `boolean` | `false` | Enable inline message editing (pencil icon on hover) |
| `onEditMessage` | `(id: string, text: string) => void` | — | Fires when user successfully saves an edited message |
| `onInputChange` | `(text: string) => void` | — | Fires on every keystroke in the input |
| `maxInputLength` | `number` | — | Max characters. Disables send + shows red when exceeded |
| `showCharacterCount` | `boolean` | `false` | Show a `[45/500]` counter near the send button |
| `renderSendButton` | `(disabled, onClick) => ReactNode` | — | Replace the default send button |
| `renderAttachButton` | `(onAttach) => ReactNode` | — | Replace the default paperclip button |

#### Suggested Replies

```tsx
<ChatUI
  suggestions={[
    { id: '1', label: 'Tell me more', icon: <Sparkles size={14} /> },
    { id: '2', label: 'Give me an example' },
    { id: '3', label: 'Explain simply', value: 'Explain that in simpler terms' },
  ]}
  onSuggestionClick={(s) => console.log('Selected:', s.label)}
  // OR: renderSuggestions={(suggestions, onClick) => <MyChips ... />}
/>
```

**Type:**
```ts
interface SuggestedReply {
  id: string;
  label: string;
  icon?: React.ReactNode;
  value?: string; // sent as the message if different from label
}
```

---

#### Voice Input

```tsx
<ChatUI
  enableVoiceInput
  voiceInputLocale="en-US"
  onVoiceTranscript={(text) => console.log('Transcript:', text)}
  // OR: renderVoiceButton={(isListening, toggle) => <MyMicButton ... />}
/>
```

**Headless hook:**
```tsx
import { useVoiceInput } from 'chat-ui';

const { isListening, isSupported, transcript, start, stop, toggle } = useVoiceInput({
  locale: 'en-US',
  onTranscript: (text) => console.log(text),
});
```

> **Browser support:** Chrome, Edge, Safari. Returns `isSupported: false` in Firefox.

---

#### Slash Commands

```tsx
<ChatUI
  slashCommands={[
    { id: '1', label: 'Generate Image', shortcut: '/image', description: 'Create an image from a prompt' },
    { id: '2', label: 'Clear Chat', shortcut: '/clear', icon: <Trash size={16} />, action: () => setMessages([]) },
  ]}
  onSlashCommand={(cmd) => console.log('Command:', cmd.shortcut)}
  // OR: renderSlashMenu={(commands, selectedIndex, onSelect) => <MyMenu ... />}
/>
```

**Type:**
```ts
interface SlashCommand {
  id: string;
  label: string;
  shortcut: string;
  description?: string;
  icon?: React.ReactNode;
  /** Optional custom behavior defined per-command */
  action?: () => void;
}
```

**Headless hook:**
```tsx
import { useSlashCommands } from 'chat-ui';

const { isOpen, filteredCommands, selectedIndex, handleInputChange, handleKeyDown, selectCommand, close } =
  useSlashCommands({
    commands: myCommands,
    onSelect: (cmd) => console.log(cmd),
  });
```

---

#### Text-to-Speech

```tsx
<ChatUI
  enableTTS
  ttsVoice="Google US English"
  ttsRate={1.2}
  // OR: renderTTSButton={(isSpeaking, toggle) => <MySpeakerBtn ... />}
/>
```

**Headless hook:**
```tsx
import { useTextToSpeech } from 'chat-ui';

const { isSpeaking, isSupported, speak, stop, toggle } = useTextToSpeech({
  voice: 'Google US English',
  rate: 1.0,
});
```

---

#### Message Pinning

```tsx
<ChatUI
  onPinMessage={(msg) => {
    // Update the message's isPinned flag in your state
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isPinned: !m.isPinned } : m));
  }}
  // OR: renderPinnedBanner={(pinnedMsgs, onJump) => <MyBanner ... />}
/>
```

**Pinned Banner** will automatically show pinned messages (those with `isPinned: true`):

```tsx
import { PinnedBanner } from 'chat-ui';

const pinned = messages.filter(m => m.isPinned);
<PinnedBanner pinnedMessages={pinned} onJump={(msg) => scrollTo(msg.id)} />
```

---

#### Unread Badge

```tsx
import { UnreadBadge } from 'chat-ui';

<UnreadBadge count={5} onClick={() => scrollToBottom()} />
```

Or via ChatUI prop:
```tsx
<ChatUI
  showUnreadBadge
  renderUnreadBadge={(count, onClick) => <MyBadge count={count} onClick={onClick} />}
/>
```

---

#### Drag & Drop Zone

```tsx
import { DropZone } from 'chat-ui';

<DropZone isDragging={isDragging} text="Drop files here" />

// Or customize via ChatUI:
<ChatUI renderDropZone={(isDragging) => isDragging ? <MyOverlay /> : null} />
```

---

#### Presence Indicator

```tsx
import { PresenceIndicator } from 'chat-ui';

<PresenceIndicator status="online" />
<PresenceIndicator status="away" />
<PresenceIndicator status="busy" />
<PresenceIndicator status="offline" />

// Or via ChatUI:
<ChatUI
  presence="online"
  renderPresence={(status) => <MyCustomDot status={status} />}
/>
```

**Type:** `'online' | 'offline' | 'away' | 'busy'`

---

#### Action Menu

```tsx
<ChatUI
  inputActions={[
    { id: 'photo', label: 'Photo', icon: <Camera size={20} />, onClick: () => openPhotoPicker(), color: '#8b5cf6' },
    { id: 'file', label: 'File', icon: <FileText size={20} />, onClick: () => openFilePicker(), color: '#3b82f6' },
  ]}
  // showActionBar={false}  // hide the "+" trigger
  // renderActionMenu={(actions, isOpen, onClose) => <MyMenu ... />}
/>
```

---

#### Input Behavior & Character Counter

```tsx
<ChatUI
  onInputChange={(text) => console.log('Typing:', text.length)}
  maxInputLength={500}
  showCharacterCount
/>
```

When `maxInputLength` is set:
- The textarea turns **red** when the limit is exceeded
- The send button is **disabled**
- The counter displays `45/500` and goes red on overflow

---

#### Custom Send & Attach Buttons

```tsx
<ChatUI
  renderSendButton={(disabled, onClick) => (
    <button disabled={disabled} onClick={onClick} className="my-send">
      Send ✨
    </button>
  )}
  renderAttachButton={(onAttach) => (
    <button onClick={onAttach}>📎 Files</button>
  )}
/>
```

---

### Render-Prop Overrides

Every visual element can be fully customized via render-props:

| Prop | Description |
|------|-------------|
| `renderMessage` | Override the entire message bubble |
| `renderMessageActions` | Custom action buttons (copy, reply, etc.) |
| `renderText` | Custom text/markdown renderer |
| `renderAvatar` | Custom avatar component |
| `renderHeader` | Custom header component |
| `renderTimestamp` | Custom timestamp display |
| `renderReactions` | Custom reactions UI |
| `renderAttachment` | Custom attachment renderer |
| `renderInputActions` | Custom input area action bar |
| `renderInputToolbar` | Custom toolbar above the input |
| `renderEmptyState` | Custom empty state when no messages |
| `renderDateSeparator` | Custom date divider |
| `renderQuotePreview` | Custom reply-to preview |
| `renderSuggestions` | Custom suggested reply chips |
| `renderVoiceButton` | Custom mic button |
| `renderSlashMenu` | Custom slash command popup |
| `renderTTSButton` | Custom text-to-speech button |
| `renderPinnedBanner` | Custom pinned message banner |
| `renderUnreadBadge` | Custom unread count badge |
| `renderDropZone` | Custom drag-drop overlay |
| `renderPresence` | Custom presence indicator |
| `renderSendButton` | Custom send button |
| `renderAttachButton` | Custom attach/paperclip button |

---

### `ChatMessage` Type

```ts
interface ChatMessage<TMeta = Record<string, unknown>> {
  id: string;
  text?: string;
  payload?: any;                    // Custom rich media (images, forms, etc.)
  sender: 'user' | 'agent' | 'system';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed' | 'streaming';
  replyTo?: ChatMessage;
  reactions?: MessageReaction[];
  attachments?: ChatMessageAttachment[];
  isEdited?: boolean;
  isPinned?: boolean;
  suggestions?: SuggestedReply[];   // Per-message suggested replies
  meta?: TMeta;                     // Your custom metadata
}
```

The `meta` field is generic — attach any typed metadata without fighting `any`:

```ts
type MyMeta = { threadId: string; avatarUrl: string };
const msg: ChatMessage<MyMeta> = {
  id: '1', sender: 'user', timestamp: new Date(),
  text: 'Hello!',
  meta: { threadId: 'thread-42', avatarUrl: '/avatar.png' },
};
```

---

## 🎨 Theming

### Built-in Themes

```tsx
<ChatUI theme="dark" />   // Default: Deep dark glassmorphic
<ChatUI theme="light" />  // Clean light mode
```

### Custom Tokens (`ChatTokens`)

The `ChatTokens` interface gives you **full IDE autocomplete** for every CSS variable the library reads:

```tsx
import type { ChatTokens } from 'chat-ui';

<ChatUI
  theme={{
    '--c-bg': '#0a0a1a',
    '--c-primary': '#8b5cf6',
    '--c-sent-bg': '#6d28d9',
    '--c-received-bg': '#1e1b4b',
    '--c-bubble-radius': '20px',
    '--font-family': '"Inter", sans-serif',
    '--c-border': 'rgba(139, 92, 246, 0.2)',
  }}
/>
```

**All typed tokens:**

| Token | Description |
|-------|-------------|
| `--c-primary` | Accent color |
| `--c-bg` | Main background |
| `--c-surface` | Card/panel backgrounds |
| `--c-surface-alt` | Alternate surface |
| `--c-border` | Border color |
| `--c-text` | Primary text color |
| `--c-text-muted` | Muted/secondary text |
| `--c-sent-bg` | Sent bubble background |
| `--c-received-bg` | Received bubble background |
| `--c-bubble-radius` | Bubble corner radius |
| `--font-family` | Root font family |
| `--chat-input-radius` | Input bar corner radius |

Custom tokens (`--my-var`) are also supported via an index signature.

### Available CSS Variables

| Variable | Description | Default (Dark) |
|----------|-------------|----------------|
| `--c-bg` | Main background | `#0a0f1c` |
| `--c-primary` | Accent color | `#6366f1` |
| `--c-primary-subtle` | Subtle primary | `rgba(99,102,241,0.12)` |
| `--c-bubble-sent` | Sent message bubble | `linear-gradient(...)` |
| `--c-bubble-received` | Received message bubble | `rgba(30,32,50,0.85)` |
| `--c-surface-glass` | Glassmorphic surfaces | `rgba(18,20,36,0.7)` |
| `--c-surface-border` | Border color | `rgba(255,255,255,0.06)` |
| `--c-text-main` | Primary text | `rgba(255,255,255,0.95)` |
| `--c-text-muted` | Muted text | `rgba(255,255,255,0.45)` |
| `--c-radius-lg` | Large border radius | `16px` |
| `--c-radius-full` | Pill border radius | `9999px` |
| `--c-shadow-glow` | Primary glow shadow | `0 0 20px ...` |
| `--c-font-size-base` | Base font size | `0.9375rem` |

### Tailwind CSS & Deep Overrides

Use the `classNames` prop to deep-inject utility classes into any structural node:

```tsx
<ChatUI
  classNames={{
    chatRoot: 'my-custom-chat-shadow rounded-2xl border',
    bubbleSent: 'bg-indigo-600 text-white shadow-md',
    bubbleReceived: 'bg-slate-100 text-slate-900',
    systemMessage: 'bg-amber-100 text-amber-800 rounded-full',
    suggestedReply: 'border-indigo-300 hover:bg-indigo-50',
    reactionBadge: 'bg-transparent border',
    sendButtonActive: 'ring-2 ring-indigo-400',
    inputArea: 'bg-slate-50 rounded-2xl',
    attachmentItem: 'rounded-xl overflow-hidden shadow',
    textarea: 'focus:ring-2 focus:ring-indigo-500',
    actionMenuPopover: 'bg-white rounded-lg shadow-xl',
  }}
/>
```

---

## 🌍 Localization (i18n)

Every single built-in string (placeholders, tooltips, ARIA labels, statuses) is connected to a global `ChatDictionary`. You can easily localize the entire framework by passing a custom dictionary:

```tsx
<ChatUI
  dictionary={{
    inputPlaceholder: "Escribe un mensaje...",
    sendButtonAriaLabel: "Enviar mensaje",
    statusSent: "Enviado",
    statusDelivered: "Entregado",
    contextMenuCopy: "Copiar",
    searchPlaceholder: "Buscar mensajes...",
    unreadBadgeText: (count) => `${count} nuevos mensajes`,
  }}
/>
```

## 🧱 Architecture

### Customization Levels

Every feature follows the **3-level customization** pattern:

1. **Level 1 — Use the default UI** → Zero code, just pass a prop
2. **Level 2 — Render-prop override** → `renderX` for visual customization
3. **Level 3 — Headless hook** → `useX` for full behavioral control

```
┌─────────────────────────────────────────────┐
│  Level 3: Headless Hooks                    │
│  useVoiceInput, useSlashCommands, useTTS... │
├─────────────────────────────────────────────┤
│  Level 2: Render-prop Overrides             │
│  renderVoiceButton, renderSlashMenu...      │
├─────────────────────────────────────────────┤
│  Level 1: Default Components                │
│  <VoiceInput />, <SlashCommands />...       │
└─────────────────────────────────────────────┘
```

### File Structure

```
src/
├── components/
│   ├── ChatUI/           # Root wrapper + compound component
│   ├── MessageList/      # Virtualized message list
│   ├── MessageBubble/    # Individual message rendering
│   ├── Input/            # Text input + file handling
│   ├── Header/           # Chat header bar
│   ├── Markdown/         # Streaming markdown renderer
│   ├── SuggestedReplies/ # Chip-style quick actions
│   ├── VoiceInput/       # Mic button + pulse animation
│   ├── SlashCommands/    # Command palette popup
│   ├── TextToSpeech/     # Read-aloud button
│   ├── PinnedBanner/     # Pinned message sticky bar
│   ├── UnreadBadge/      # New message count pill
│   ├── DropZone/         # Drag-drop file overlay
│   ├── PresenceIndicator/# Online status dot
│   ├── ActionMenu/       # Expandable "+" actions
│   ├── ImageLightbox/    # Gallery viewer
│   └── ...
├── hooks/
│   ├── useVoiceInput.ts    # Web Speech API
│   ├── useSlashCommands.ts # Command filtering + keyboard nav
│   ├── useTextToSpeech.ts  # SpeechSynthesis API
│   ├── useMessageSearch.ts # Full-text search
│   └── ...
├── context/
│   └── ChatContext.tsx     # Central state + render-props
├── types.ts                # All TypeScript interfaces
├── style.css               # CSS barrel (imports all component CSS)
└── index.ts                # Public API exports
```

---

## 🧪 Development

```bash
# Install dependencies
npm install

# Start dev playground
npm run dev

# Build library
npm run build

# Type check
npx tsc --noEmit
```

### Dev Playground Features

The development playground (`src/dev/App.tsx`) demonstrates:

- ✅ **Gemini API integration** — chat with a real LLM
- ✅ **Suggested replies** — chips appear after each agent response
- ✅ **Voice input** — mic button next to send
- ✅ **Slash commands** — type `/` to see the command palette
- ✅ **Text-to-speech** — speaker icon on agent messages
- ✅ **Action menu** — "+" button with photo, file, voice, location, poll
- ✅ **Streaming markdown** — real-time rendering with syntax highlighting
- ✅ **Theme switching** — dark, light, and custom themes
- ✅ **Model selection** — switch between Gemini models
- ✅ **Localization demo** — toggle between English and Spanish UI via dictionary override

---

## 📦 Exports

### Components

| Import | Description |
|--------|-------------|
| `ChatUI` | Main chat component (compound) |
| `MessageList` | Virtualized message list |
| `MessageBubble` | Single message bubble |
| `ChatInput` | Text input area |
| `ChatHeader` | Header bar |
| `MarkdownText` | Markdown renderer |
| `StreamingMarkdownText` | Streaming markdown renderer |
| `SuggestedReplies` | Quick action chips |
| `VoiceInput` | Mic button |
| `SlashCommands` | Command palette |
| `TextToSpeech` | Read-aloud button |
| `PinnedBanner` | Pinned message bar |
| `UnreadBadge` | New message count |
| `DropZone` | File drop overlay |
| `PresenceIndicator` | Status dot |
| `ActionMenu` | Expandable actions |
| `ImageLightbox` | Gallery viewer |
| `TypingIndicator` | Animated dots |

### Hooks

| Import | Description |
|--------|-------------|
| `useVoiceInput` | Web Speech API for voice-to-text |
| `useSlashCommands` | Command filtering + keyboard nav |
| `useTextToSpeech` | SpeechSynthesis API |
| `useMessageSearch` | Full-text message search |
| `useCopyToClipboard` | Clipboard utility |
| `useKeyboardShortcuts` | Keyboard shortcut handler |
| `useChat` | Access ChatContext from children |

### Types

```ts
import type {
  ChatMessage,
  ChatMessageAttachment,
  MessageReaction,
  SuggestedReply,
  SlashCommand,
  PresenceStatus,
  ChatTheme,
  ChatTokens,
  ChatClassNames,
  ChatDictionary,
  ChatControllerRef,
  ChatInputAction,
  ChatUIProps,
} from 'chat-ui';
```

---

## 📄 License

MIT © [Mohd Moazzam](https://github.com/mm541)
