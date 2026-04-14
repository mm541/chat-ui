# 🚀 Chat UI — Future Roadmap

> Feature backlog for turning Chat UI into a best-in-class conversational UI framework.

---

## 🔥 High Impact

These are table-stakes features users expect from a modern chat library.

- [ ] **Emoji Picker** — Built-in popover with search, categories, skin tone selector, and recent-used section. Triggered from the action bar or a dedicated smiley button next to the input. Fully overridable via `renderEmojiPicker`.
- [ ] **Voice Messages** — Hold-to-record button with waveform visualization during recording. Playback component with progress bar, duration, and play/pause. New `type: 'audio'` attachment variant on `ChatMessageAttachment`.
- [ ] **Rich Link Previews** — Auto-detect URLs in message text and render an OG-card preview (image, title, description, favicon) below the bubble. Provide an `onFetchLinkPreview` callback so users can plug in their own metadata fetcher. Overridable via `renderLinkPreview`.
- [ ] **Mention System** — `@user` autocomplete dropdown triggered while typing. Provide a `users` or `mentionSuggestions` prop. Highlighted mention chips in rendered messages. Overridable via `renderMentionSuggestion`.
- [ ] **Message Formatting Toolbar** — Toggle-able toolbar above the input with Bold, Italic, Code, Strikethrough, and Link buttons (like Slack's composer). Inserts markdown syntax around selected text. Controlled via `showFormattingToolbar` prop.
- [ ] **Layout & Sidebar System** — Optional composable layout (`<ChatLayout />`) featuring a customizable sidebar menu for conversation history, user lists, and workspace navigation. Includes mobile-responsive drawer behavior overlay.

---

## ⚡ Medium Impact

Features that differentiate Chat UI from other libraries.

- [ ] **Threaded Replies Panel** — Click a reply quote → slides open a side-panel (or inline expandable) showing the full thread branch. Prop: `threadView: 'panel' | 'inline' | 'none'`. Overridable via `renderThread`.
- [ ] **Multi-Select Mode** — Long-press or checkbox toggle enters selection mode. Batch actions: forward, delete, copy. Props: `enableMultiSelect`, `onBatchAction`. Overridable via `renderSelectionToolbar`.
- [ ] **Unread Separator** — Auto-inserted "N new messages" divider line when the user is scrolled up and new messages arrive. Clicking it scrolls to the first unread. Prop: `unreadCount`, `firstUnreadId`.
- [ ] **Drag-to-Reply (Mobile)** — Swipe-right gesture on a message bubble to quote-reply. Haptic feedback on threshold. Prop: `enableSwipeReply: boolean`.

---

## 🎨 Polish & Wow-Factor

Micro-interactions and visual touches that make the experience feel premium.

- [ ] **Entrance Animations** — New messages slide/fade in with staggered spring physics via Framer Motion. Configurable via `messageAnimation: 'slide' | 'fade' | 'spring' | 'none'`.
- [ ] **Chat Bubble Tails** — Optional SVG bubble tails (iMessage-style) as a style variant. Prop: `bubbleStyle: 'rounded' | 'tailed'`.
- [ ] **Confetti / Particle Reactions** — Tapping a reaction triggers a brief particle burst animation around the emoji. Uses lightweight canvas particles.
- [ ] **Skeleton Loading State** — Shimmer placeholder UI while messages are being fetched. Prop: `isLoading: boolean`. Overridable via `renderLoadingSkeleton`.
- [ ] **Message Lifecycle States** — Explicit rendering of message progression (`sending`, `delivered`, `read`, `error`). Include accompanying UX, like double-check marks (✓✓) or a "retry" button for failed messages. Overridable via `renderMessageStatus`.

---

## 🔧 Infrastructure & DX

- [ ] **NPM Publish Pipeline** — Setup `prepublishOnly` script and publish version 1.0 to npm.
- [ ] **Storybook Addon Fix** — Resolve version mismatch between Storybook core (v10) and addons (v8) so `build-storybook` works.
- [ ] **Chromatic / Visual Regression** — Connect Storybook to Chromatic for automated screenshot diffing on PRs.
- [ ] **Bundle Size Monitoring** — Add `size-limit` or `bundlewatch` to CI to prevent regressions (current: 36.74 KB JS, 28.19 KB CSS).
- [ ] **Tree-Shaking Audit** — Verify individual component imports work (`import { MarkdownText } from 'chat-ui'`) without pulling the entire bundle.
- [x] **DOM Virtualization** — Replace the pure CSS flex layout with a virtualized list (e.g., `@tanstack/react-virtual`) to support high-performance rendering of 5,000+ messages without UI lag.

---

## 📋 Notes

- Every new feature should follow the **3-level override pattern**: sensible default → data props → full render override.
- All interactive elements must meet **WCAG 2.1 AA** accessibility standards.
- New components use the **folder-per-component** pattern (`src/components/FeatureName/FeatureName.tsx + .css`).
- Design tokens go in `src/styles/tokens.css`; no hardcoded colors/sizes in component CSS.
