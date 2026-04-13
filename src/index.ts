import './style.css';

export * from './types';
export { ChatUI, type ChatUIProps } from './components/ChatUI';
export { MessageList, type MessageListProps } from './components/MessageList';
export { MessageBubble, type MessageBubbleProps, type GroupPosition } from './components/MessageBubble';
export { MarkdownText, type MarkdownTextProps } from './components/Markdown/MarkdownText.tsx';
export { StreamingMarkdownText, type StreamingMarkdownTextProps } from './components/Markdown/StreamingMarkdownText.tsx';
export { ChatInput, type ChatInputProps } from './components/Input';
export { ChatHeader, type ChatHeaderProps } from './components/Header';
export { TypingIndicator } from './components/TypingIndicator';
export { MessageSearchBar, type MessageSearchBarProps } from './components/MessageSearchBar';
export { MessageContextMenu, type MessageContextMenuProps } from './components/MessageContextMenu';
export { ChatProvider, useChat, type ChatProviderProps, type ChatContextValue } from './context/ChatContext.tsx';
export { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.ts';
export { useCopyToClipboard } from './hooks/useCopyToClipboard.ts';
export { useMessageSearch, type UseMessageSearchOptions, type UseMessageSearchReturn } from './hooks/useMessageSearch.ts';
export { MediaAttachments, type MediaAttachmentsProps } from './components/MediaAttachments';
export { ImageLightbox, type ImageLightboxProps } from './components/ImageLightbox';
export { ActionMenu, type ActionMenuProps } from './components/ActionMenu';

// Phase 1: Input Enhancements
export { SuggestedReplies, type SuggestedRepliesProps } from './components/SuggestedReplies';
export { VoiceInput, type VoiceInputProps } from './components/VoiceInput';
export { SlashCommands, type SlashCommandsProps } from './components/SlashCommands';
export { useVoiceInput } from './hooks/useVoiceInput.ts';
export { useSlashCommands } from './hooks/useSlashCommands.ts';

// Phase 2: Message-Level Features
export { TextToSpeech, type TextToSpeechProps } from './components/TextToSpeech';
export { PinnedBanner, type PinnedBannerProps } from './components/PinnedBanner';
export { UnreadBadge, type UnreadBadgeProps } from './components/UnreadBadge';
export { useTextToSpeech } from './hooks/useTextToSpeech.ts';

// Phase 3: Layout & UX Polish
export { DropZone, type DropZoneProps } from './components/DropZone';
export { PresenceIndicator, type PresenceIndicatorProps } from './components/PresenceIndicator';
