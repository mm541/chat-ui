import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { ImageLightbox } from '../components/ImageLightbox';
import type { 
  ChatMessage, 
  ChatTheme, 
  ChatClassNames, 
  ChatMessageAttachment, 
  ChatInputAction,
  SuggestedReply,
  SlashCommand,
  PresenceStatus,
  ChatDictionary
} from '../types';

export const defaultDictionary: ChatDictionary = {
  inputPlaceholder: "Type a message...",
  inputPlaceholderDragging: "Drop files here...",
  attachFileAriaLabel: "Attach file",
  sendButtonAriaLabel: "Send message",
  voiceStartAriaLabel: "Start recording",
  voiceStopAriaLabel: "Stop recording",
  voiceListening: "Listening...",
  editedBadge: "edited",
  statusUnknown: "unknown",
  statusSending: "sending",
  statusSent: "sent",
  statusDelivered: "delivered",
  statusRead: "read",
  statusFailed: "failed",
  messageFromUserAriaLabel: "Message from you",
  messageFromAgentAriaLabel: "Message from the assistant",
  slashCommandsAriaLabel: "Slash commands",
  actionMenuOpenAriaLabel: "Open action menu",
  actionMenuCloseAriaLabel: "Close action menu",
  searchPlaceholder: "Search messages...",
  searchCloseAriaLabel: "Close search",
  searchNextAriaLabel: "Next match",
  searchPrevAriaLabel: "Previous match",
  dropZoneText: "Drop files here",
  unreadBadgeText: (count: number) => `${count} new message${count > 1 ? 's' : ''}`,
  pinnedMessageAriaLabel: "Pinned message",
  scrollToBottomAriaLabel: "Scroll to bottom",
  contextMenuAriaLabel: "Message options",
  contextMenuReply: "Reply",
  contextMenuCopy: "Copy",
  contextMenuCopied: "Copied!",
  contextMenuEdit: "Edit",
  contextMenuDelete: "Delete",
};

export interface ChatContextValue {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onFileUpload?: (files: FileList) => void;
  onEditMessage?: (message: ChatMessage) => void;
  onDeleteMessage?: (message: ChatMessage) => void;
  onReaction?: (message: ChatMessage, emoji: string) => void;
  onMessageClick?: (message: ChatMessage) => void;
  onAvatarClick?: (message: ChatMessage) => void;
  openLightbox?: (images: ChatMessageAttachment[], initialIndex?: number) => void;
  renderAttachment?: (attachment: ChatMessageAttachment) => React.ReactNode;
  disableImageLightbox?: boolean;
  
  // Customization
  theme: ChatTheme;
  classNames?: ChatClassNames;
  dictionary: ChatDictionary;
  placeholder?: string;
  isTyping?: boolean;
  clusterTimeWindow?: number; 
  markdownRehypePlugins?: any[];

  // Render Props
  renderMessage?: (message: ChatMessage) => React.ReactNode;
  renderMessageActions?: (message: ChatMessage) => React.ReactNode;
  renderText?: (text: string, message: ChatMessage) => React.ReactNode;
  renderQuotePreview?: (message: ChatMessage) => React.ReactNode;
  renderAvatar?: (message: ChatMessage) => React.ReactNode;
  renderInputActions?: () => React.ReactNode;
  renderInputToolbar?: () => React.ReactNode;
  renderEmptyState?: () => React.ReactNode;
  renderDateSeparator?: (date: Date) => React.ReactNode;
  renderHeader?: () => React.ReactNode;
  renderTimestamp?: (message: ChatMessage) => React.ReactNode;
  renderReactions?: (message: ChatMessage, onReact: (emoji: string) => void) => React.ReactNode;
  showTimestampOnHover?: boolean;

  // Features
  inputActions?: ChatInputAction[];
  renderActionMenu?: (actions: ChatInputAction[], isOpen: boolean, onClose: () => void) => React.ReactNode;
  showActionBar?: boolean;
  
  // Phase 1: Input Enhancements
  suggestions?: SuggestedReply[];
  onSuggestionClick?: (suggestion: SuggestedReply) => void;
  renderSuggestions?: (suggestions: SuggestedReply[], onClick: (s: SuggestedReply) => void) => React.ReactNode;

  enableVoiceInput?: boolean;
  voiceInputLocale?: string;
  onVoiceTranscript?: (transcript: string) => void;
  renderVoiceButton?: (isListening: boolean, toggle: () => void) => React.ReactNode;

  slashCommands?: SlashCommand[];
  onSlashCommand?: (command: SlashCommand) => void;
  renderSlashMenu?: (commands: SlashCommand[], selectedIndex: number, onSelect: (cmd: SlashCommand) => void) => React.ReactNode;

  // Phase 2: Message & Audio
  enableTTS?: boolean;
  ttsVoice?: string;
  ttsRate?: number;
  renderTTSButton?: (isSpeaking: boolean, toggle: () => void) => React.ReactNode;

  onPinMessage?: (message: ChatMessage) => void;
  renderPinnedBanner?: (pinnedMessages: ChatMessage[], onJumpTo: (msg: ChatMessage) => void) => React.ReactNode;

  showUnreadBadge?: boolean;
  renderUnreadBadge?: (unreadCount: number, onClick: () => void) => React.ReactNode;

  // Phase 3: Presence & Polish
  presence?: PresenceStatus;
  renderPresence?: (status: PresenceStatus) => React.ReactNode;

  renderDropZone?: (isDragging: boolean) => React.ReactNode;
  dropZoneText?: string;

  // Phase 4: Deeper Customization
  onInputChange?: (text: string) => void;
  maxInputLength?: number;
  showCharacterCount?: boolean;
  renderSendButton?: (disabled: boolean, onClick: () => void) => React.ReactNode;
  renderAttachButton?: (onAttach: () => void) => React.ReactNode;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export interface ChatProviderProps extends Omit<ChatContextValue, 'openLightbox' | 'dictionary' | 'theme'> {
  children: React.ReactNode;
  dictionary?: Partial<ChatDictionary>;
  theme?: ChatTheme;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({
  children,
  messages,
  isTyping,
  onSendMessage,
  onFileUpload,
  onMessageClick,
  onAvatarClick,
  onEditMessage,
  onDeleteMessage,
  onReaction,
  renderMessage,
  renderMessageActions,
  renderText,
  renderQuotePreview,
  renderAvatar,
  renderInputActions,
  renderInputToolbar,
  renderEmptyState,
  renderDateSeparator,
  renderHeader,
  renderTimestamp,
  renderReactions,
  renderAttachment,
  disableImageLightbox,
  showTimestampOnHover = true,
  theme = 'dark',
  dictionary,
  placeholder,
  classNames,
  clusterTimeWindow = 5 * 60 * 1000,
  markdownRehypePlugins = [],
  inputActions,
  renderActionMenu,
  showActionBar,
  // New features
  suggestions,
  onSuggestionClick,
  renderSuggestions,
  enableVoiceInput,
  voiceInputLocale,
  onVoiceTranscript,
  renderVoiceButton,
  slashCommands,
  onSlashCommand,
  renderSlashMenu,
  enableTTS,
  ttsVoice,
  ttsRate,
  renderTTSButton,
  onPinMessage,
  renderPinnedBanner,
  renderDropZone,
  dropZoneText,
  presence,
  renderPresence,
  showUnreadBadge,
  renderUnreadBadge,
  // Phase 4
  onInputChange,
  maxInputLength,
  showCharacterCount,
  renderSendButton,
  renderAttachButton,
}) => {
  const [lightboxImages, setLightboxImages] = useState<ChatMessageAttachment[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const openLightbox = useCallback((images: ChatMessageAttachment[], index = 0) => {
    if (disableImageLightbox || images.length === 0) return;
    setLightboxImages(images);
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  }, [disableImageLightbox]);

  const mergedDictionary = useMemo(() => {
    return { ...defaultDictionary, ...dictionary };
  }, [dictionary]);

  const value = useMemo(
    () => ({ 
      messages, 
      isTyping, 
      onSendMessage, 
      onFileUpload, 
      onMessageClick,
      onAvatarClick,
      onEditMessage,
      onDeleteMessage,
      onReaction,
      renderMessage, 
      renderMessageActions, 
      renderText, 
      renderQuotePreview, 
      renderAvatar,
      renderInputActions,
      renderInputToolbar,
      renderEmptyState,
      renderDateSeparator,
      renderHeader,
      renderTimestamp,
      renderReactions,
      renderAttachment,
      disableImageLightbox,
      theme,
      dictionary: mergedDictionary,
      placeholder,
      classNames,
      clusterTimeWindow,
      markdownRehypePlugins,
      openLightbox,
      inputActions,
      renderActionMenu,
      showActionBar,
      suggestions,
      onSuggestionClick,
      renderSuggestions,
      enableVoiceInput,
      voiceInputLocale,
      onVoiceTranscript,
      renderVoiceButton,
      slashCommands,
      onSlashCommand,
      renderSlashMenu,
      enableTTS,
      ttsVoice,
      ttsRate,
      renderTTSButton,
      onPinMessage,
      renderPinnedBanner,
      renderDropZone,
      dropZoneText,
      presence,
      renderPresence,
      showUnreadBadge,
      renderUnreadBadge,
      onInputChange,
      maxInputLength,
      showCharacterCount,
      renderSendButton,
      renderAttachButton,
    }),
    [messages, isTyping, onSendMessage, onFileUpload, onMessageClick, onAvatarClick, onEditMessage, onDeleteMessage, onReaction, renderMessage, renderMessageActions, renderText, renderQuotePreview, renderAvatar, renderInputActions, renderInputToolbar, renderEmptyState, renderDateSeparator, renderHeader, renderTimestamp, renderReactions, renderAttachment, disableImageLightbox, showTimestampOnHover, theme, mergedDictionary, placeholder, classNames, clusterTimeWindow, markdownRehypePlugins, openLightbox, inputActions, renderActionMenu, showActionBar, suggestions, onSuggestionClick, renderSuggestions, enableVoiceInput, voiceInputLocale, onVoiceTranscript, renderVoiceButton, slashCommands, onSlashCommand, renderSlashMenu, enableTTS, ttsVoice, ttsRate, renderTTSButton, onPinMessage, renderPinnedBanner, renderDropZone, dropZoneText, presence, renderPresence, showUnreadBadge, renderUnreadBadge, onInputChange, maxInputLength, showCharacterCount, renderSendButton, renderAttachButton]
  );

  return (
    <ChatContext.Provider value={value}>
      {children}
      <ImageLightbox
        isOpen={isLightboxOpen}
        images={lightboxImages}
        initialIndex={lightboxIndex}
        onClose={() => setIsLightboxOpen(false)}
      />
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
