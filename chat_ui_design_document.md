# Plug-and-Play Chat UI: Project Design Document

## 1. Vision & Core Objectives

A universal, highly optimized, plug-and-play **conversational UI engine** for React. This is **NOT just for messaging apps.** It is designed to power any interface that involves a conversation-like flow:

- 💬 **Person-to-Person Messaging** (WhatsApp, Telegram, Slack-style)
- 🤖 **AI Assistants & LLM Interfaces** (ChatGPT, Claude, Gemini-style)
- 🎧 **Customer Support Widgets** (Intercom, Zendesk-style)
- 🏥 **Domain-Specific Chat** (Telemedicine consultations, Legal Q&A, EdTech tutoring)
- 🛒 **Conversational Commerce** (Chatbots that show product carousels, order tracking)
- 🎮 **In-App/In-Game Chat** (Embedded chat panels inside dashboards or games)
- 📋 **Interactive Forms & Workflows** (Step-by-step conversational form filling)

**Key Goals:**
- **Zero-Friction Integration:** A single `<ChatUI />` drop-in component for any React project.
- **Obsessive Performance:** 60fps scrolling with 50,000+ messages. Sub-microsecond layout calculations. Zero layout thrashing.
- **Maximum Customizability:** Every visual element is overridable. Every behavior is hookable. Everything is optional.
- **Responsive by Default:** Adapts flawlessly from a 280px floating widget to a full-screen desktop layout using container-aware intelligence.
- **Universal:** Works for human-to-human chat, human-to-AI chat, bot-to-human chat, or any other conversational pattern.

---

## 2. Technology Stack & Rationale

| Technology | Purpose & Rationale |
| :--- | :--- |
| **React + TypeScript** | Core framework. Strong typing ensures a robust, self-documenting API for consumers. |
| **Vite** | Bundler in Library Mode. Blazing fast dev server + optimized Rollup builds for exporting as a distributable package. |
| **@chenglou/pretext** | Revolutionary DOM-less text measurement. Uses Canvas APIs to compute exact text dimensions off-screen in sub-microsecond time, completely avoiding layout reflow. |
| **@tanstack/react-virtual** | Headless UI virtualization. Paired with Pretext, enables rendering 50,000+ varying-height items with mathematically perfect scroll positioning. |
| **@tanstack/react-query** | *(Optional/Plug-in)* Async state management for message fetching, cache invalidation, infinite scroll loading, and optimistic UI updates. |
| **Vanilla CSS (CSS Variables)** | Un-opinionated styling via CSS custom properties. Explicitly avoids Tailwind/Emotion/Styled-Components to ensure pure plug-and-play compatibility with ANY consumer project. |
| **Lucide-React** | Lightweight, crisp, customizable iconography (Send, Attach, Avatars, Copy, Retry, etc.). |
| **Framer Motion** | Silky, GPU-accelerated micro-animations (message slide-in, expand/collapse, typing indicator pulses) for a distinctly premium, polished feel. |

---

## 3. Core Architecture

### Component Tree
Every piece is modular. Use the full suite or cherry-pick individual components.

1. **`ChatProvider`**: React Context provider managing state (messages, users, typing indicators, connection status).
2. **`ChatUI`**: The main orchestrator wrapper.
3. **`ChatUI.Header`**: Chat title, online/offline status, action buttons *(optional)*.
4. **`ChatUI.MessageList`**: The virtualized, performance-optimized scroll container.
5. **`ChatUI.MessageBubble`**: Individual message rendering (supports `sent`, `received`, `system`, `ai`, `custom` variants).
6. **`ChatUI.Input`**: Auto-expanding textarea with attachment triggers and send button.
7. **`ChatUI.TypingIndicator`**: Animated typing/thinking indicator *(optional)*.
8. **`ChatUI.ActionBar`**: Message-level actions like Copy, Reply, React, Regenerate *(optional)*.

### The Theming Engine
Ships a `default.css` that uses CSS custom properties. Consumers override variables in their own CSS—no build tool dependency required:

```css
.chat-container {
  --chat-bg: #ffffff;
  --chat-surface: #f8fafc;
  --chat-primary: #3b82f6;
  --chat-text: #1f2937;
  --chat-text-muted: #6b7280;
  --chat-bubble-sent-bg: var(--chat-primary);
  --chat-bubble-sent-text: #ffffff;
  --chat-bubble-received-bg: #f3f4f6;
  --chat-bubble-received-text: var(--chat-text);
  --chat-radius: 12px;
  --chat-font-family: 'Inter', system-ui, sans-serif;
  --chat-font-size: 14px;
  --chat-spacing: 8px;
  --chat-input-bg: #ffffff;
  --chat-border: #e5e7eb;
  --chat-shadow: 0 4px 24px rgba(0,0,0,0.08);
}
```
Dark mode? Override `--chat-bg: #0f172a`. Brand colors? Override `--chat-primary: #your-brand`. Done.

---

## 4. Advanced Features

### A. Blazing Fast Virtualization (The "Pretext" Advantage)
Most chat UIs struggle with variable-height items. Traditional approaches render everything to the DOM first, measure heights, then update the virtualizer—causing visible scroll jumps and jank.

**Our approach eliminates this entirely:**
1. Text content is run through `@chenglou/pretext`'s `prepare()` + `layout()` pipeline.
2. Exact pixel heights are computed **before the message ever touches the DOM**.
3. These pre-calculated heights are fed directly into `@tanstack/react-virtual`.
4. Result: **Mathematically perfect scroll positions. Zero jank. Zero reflows. Pure 60fps.**

### B. Compound Components & Render Props
Everything is composable and overridable:

```tsx
// Minimal setup — everything included by default
<ChatUI messages={messages} onSend={handleSend} />

// Full control — pick and choose every piece
<ChatUI theme="dark">
  <ChatUI.Header title="Support Chat" />
  <ChatUI.MessageList
     renderMessage={(msg) => <MyCustomBubble data={msg} />}
  />
  <ChatUI.Input placeholder="Type a message..." />
</ChatUI>

// Extreme customization — only use the virtualized engine
<ChatUI>
  <ChatUI.MessageList messages={messages} />
  <MyEntirelyCustomInputArea />
</ChatUI>
```

### C. Extreme Responsiveness (Container Queries)
We use CSS Container Queries (`@container`) instead of media queries. The UI adapts to **the container it lives in**, not the screen:

| Mode | Container Width | Behavior |
| :--- | :--- | :--- |
| **Micro-Widget** | < 360px | Compact bubbles, icon-only header, minimal padding. Perfect for floating support widgets. |
| **Mobile** | 360px – 480px | Full mobile chat experience. Stacked layouts, touch-optimized tap targets. |
| **Sidebar** | 480px – 720px | Optimized for side-panel integrations within larger apps. |
| **Desktop** | 720px – 1024px | Comfortable reading widths, expanded message actions. |
| **Widescreen** | > 1024px | Multi-column capable, side-by-side media rendering, max content width capping. |

Drop `<ChatUI>` inside a 300px modal, a 500px sidebar, or a full-page route—it formats itself flawlessly every time.

### D. AI Assistant Chat Capabilities (LLM Integration)
First-class support for AI chat interfaces:

1. **Streaming Text (Token-by-Token):** Architecture supports a "currently streaming" message state. The streaming message dynamically resizes in real-time, then locks into the optimized Pretext measurement once the stream completes.
2. **Markdown & Code Blocks:** Via `renderMessage`, consumers can pipe content through `react-markdown` + `react-syntax-highlighter` or any renderer they choose.
3. **AI-Specific UI Elements:**
   - `<ChatUI.TypingIndicator />` — Animated thinking/processing state.
   - `<ChatUI.ActionBar />` — Copy, Regenerate, Thumbs Up/Down below AI responses.
   - "Stop Generating" button integration.
   - Token count / model info display slots.

### E. Rich Media & Arbitrary Custom Components
Support for **any** React component inside the chat flow:

- **Custom Payload Pattern:** Messages can be structured objects (`{ type: 'carousel', images: [...] }`, `{ type: 'video', url: '...' }`, `{ type: 'form', fields: [...] }`). The `renderCustomPayload` prop returns any arbitrary React component.
- **Smart Height Strategy:** Text messages use Pretext (instant, off-DOM). Custom components (carousels, videos, charts) use `@tanstack/react-virtual`'s `ResizeObserver`-based dynamic measurement. Both strategies coexist seamlessly in the same list.

### F. Accessibility (a11y)
Non-negotiable for enterprise adoption:

- Full **ARIA roles** (`role="log"`, `aria-live="polite"` for new messages).
- Complete **keyboard navigation** (Tab through messages, Enter to send, Escape to dismiss).
- **Screen reader announcements** for incoming messages and state changes.
- **Focus management** for reply threads and modal interactions.
- High contrast mode support via CSS variable overrides.

### G. RTL (Right-to-Left) Support
A single `dir="rtl"` prop mirrors the entire layout:

- Message bubbles flip alignment.
- Input area, icons, and timestamps reposition correctly.
- Full support for Arabic, Hebrew, Urdu, and other RTL languages.
- CSS logical properties (`margin-inline-start` instead of `margin-left`) used throughout.

### H. Message States & Delivery Indicators
Visual feedback for message lifecycle:

- ⏳ **Pending** — Message is being sent (optimistic UI, appears immediately).
- ✓ **Sent** — Server acknowledged receipt.
- ✓✓ **Delivered** — Recipient's device received the message.
- ✓✓ (blue) **Read** — Recipient has seen the message.
- ❌ **Failed** — Send failed, with a "Retry" action.

All states are optional — enable only what your use case needs.

### I. Replies & Threading
Support for contextual conversations:

- **Inline Replies:** Tap/click to reply to a specific message. The reply shows a preview of the original message above the response.
- **Thread View:** Optionally expand a message into a threaded sub-conversation (Slack-style).
- Fully compatible with the virtualized list — threads don't break scroll performance.

### J. Clipboard Paste & Drag-and-Drop
Modern file input capabilities:

- **Paste from Clipboard:** `Ctrl+V` an image directly into the chat input. Preview appears before sending.
- **Drag-and-Drop:** Drag files onto the chat window. Drop zone highlights with visual feedback.
- File type validation, size limits, and preview thumbnails — all configurable.

### K. Event Hooks & Programmable API
Every meaningful interaction exposes a callback:

```tsx
<ChatUI
  onMessageSend={(msg) => { /* ... */ }}
  onMessageReceive={(msg) => { /* ... */ }}
  onTypingStart={() => { /* ... */ }}
  onTypingStop={() => { /* ... */ }}
  onScrollToTop={() => { /* load older messages */ }}
  onScrollToBottom={() => { /* mark as read */ }}
  onMessageReaction={(msgId, emoji) => { /* ... */ }}
  onFileUpload={(file) => { /* ... */ }}
  onError={(error) => { /* ... */ }}
/>
```

### L. SSR & Framework Compatibility
- Fully compatible with **Next.js** (App Router & Pages Router), **Remix**, and **Astro**.
- Proper `"use client"` directives where needed.
- No `window` or `document` access during server-side rendering.

---

## 5. Performance & Optimization Strategy

This is the beating heart of the library. Performance is not an afterthought — it is the #1 architectural priority.

### 5.1 Rendering Pipeline

```
Message Data
    │
    ▼
┌─────────────────────────────┐
│  Pretext: prepare() + layout()  │  ← Sub-microsecond height calculation (off-DOM)
│  (Text messages only)           │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│  TanStack Virtual               │  ← Only renders messages visible in viewport
│  (Windowed rendering)           │     + small overscan buffer
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│  Framer Motion                  │  ← GPU-accelerated animations
│  (transform/opacity only)       │     No layout-triggering properties
└─────────────────────────────┘
    │
    ▼
   DOM (only 20-30 nodes rendered at any time, regardless of total message count)
```

### 5.2 Specific Optimizations

| Optimization | Detail |
| :--- | :--- |
| **Virtualized Rendering** | Only ~20-30 DOM nodes exist at any time, even with 50,000+ messages in the list. |
| **Pre-Calculated Heights** | Pretext computes text heights via Canvas API without touching the DOM. Zero layout reflow. |
| **Memoized Components** | `React.memo` + `useMemo` + `useCallback` throughout. Re-renders only what changed. |
| **GPU-Only Animations** | Framer Motion animates only `transform` and `opacity` — properties that bypass the browser's layout and paint phases entirely. |
| **Lazy Asset Loading** | Images, videos, and heavy media use `IntersectionObserver` to load only when they scroll into view. |
| **Debounced Resize Handling** | Container query recalculations and resize events are debounced to avoid layout thrashing during window resizing. |
| **Height Caching** | Once a message's height is calculated by Pretext, it is cached permanently. The layout engine never recalculates a finalized message. |
| **Optimistic UI** | Sent messages appear in the list immediately (before server confirmation), with state transitions handled asynchronously. |
| **Tree-Shakeable Exports** | ESM exports ensure that importing only `<MessageList />` doesn't bundle the entire library. Dead code is eliminated automatically. |
| **Minimal Bundle Footprint** | Core library targets < 15KB gzipped (excluding peer dependencies). |

### 5.3 Performance Targets

| Metric | Target |
| :--- | :--- |
| Scroll FPS (50K messages) | 60fps constant |
| Time to First Message Render | < 50ms |
| Layout calculation per message | < 1μs (via Pretext) |
| Core bundle size (gzipped) | < 15KB |
| DOM nodes in viewport | 20-30 max |
| Memory per 10K messages (data only) | < 5MB |

---

## 6. Next Steps for Implementation

1. **Scaffold Project**: Initialize Vite React/TS project in library mode.
2. **Build Config**: Configure `vite.config.ts` for `es` and `umd` output formats, externalizing `react`, `react-dom`, and `framer-motion` as peer dependencies.
3. **Design System**: Establish the complete CSS variable token system and base component classes.
4. **Core Engine**: Build the `MessageList` virtualization engine (Pretext + TanStack Virtual integration) — this is the most performance-critical piece.
5. **UI Components**: Build Header, MessageBubble, ChatInput, TypingIndicator, and ActionBar with Framer Motion animations.
6. **Accessibility Pass**: Add ARIA roles, keyboard navigation, and screen reader support.
7. **Demo Application**: Create a comprehensive demo app showcasing all use cases (messaging, AI chat, support widget, custom payloads).
8. **Performance Benchmarks**: Validate all targets from Section 5.3 with automated benchmarks.
