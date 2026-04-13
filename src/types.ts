export interface MessageReaction {
  emoji: string;
  count: number;
  reacted?: boolean; // Whether the current user has reacted with this emoji
}

export interface ChatMessageAttachment {
  id: string;
  type: 'image' | 'video' | 'file' | 'audio';
  url: string;
  name?: string;
  size?: number;   // in bytes
  mimeType?: string;
  thumbnailUrl?: string;
}

export interface SuggestedReply {
  id: string;
  label: string;
  icon?: React.ReactNode;
  value?: string; // if different from label, this is sent as the message
}

export interface SlashCommand {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut: string; // e.g. "/image"
}

export type PresenceStatus = 'online' | 'offline' | 'away' | 'busy';

export interface ChatMessage {
  id: string;
  text?: string;
  payload?: any; // For custom rich media (images, forms, etc.)
  sender: 'user' | 'agent' | 'system';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed' | 'streaming';
  replyTo?: ChatMessage;
  reactions?: MessageReaction[];
  attachments?: ChatMessageAttachment[];
  isEdited?: boolean;
  isPinned?: boolean;
  suggestions?: SuggestedReply[];
}

export type ChatTheme = 'dark' | 'light' | Record<string, string>;

export interface ChatDictionary {
  // Input
  inputPlaceholder: string;
  inputPlaceholderDragging: string;
  attachFileAriaLabel: string;
  sendButtonAriaLabel: string;
  // Voice Input
  voiceStartAriaLabel: string;
  voiceStopAriaLabel: string;
  voiceListening: string;
  // Messages & Bubbles
  editedBadge: string;
  statusUnknown: string;
  statusSending: string;
  statusSent: string;
  statusDelivered: string;
  statusRead: string;
  statusFailed: string;
  messageFromUserAriaLabel: string;
  messageFromAgentAriaLabel: string;
  // Menus & Commands
  slashCommandsAriaLabel: string;
  actionMenuOpenAriaLabel: string;
  actionMenuCloseAriaLabel: string;
  // Search
  searchPlaceholder: string;
  searchCloseAriaLabel: string;
  searchNextAriaLabel: string;
  searchPrevAriaLabel: string;
  // UX Features
  dropZoneText: string;
  unreadBadgeText: (count: number) => string;
  pinnedMessageAriaLabel: string;
  scrollToBottomAriaLabel: string;
  // Context Menu
  contextMenuAriaLabel: string;
  contextMenuReply: string;
  contextMenuCopy: string;
  contextMenuCopied: string;
  contextMenuEdit: string;
  contextMenuDelete: string;
}

export interface ChatClassNames {
  // Core structure
  chatRoot?: string;
  messageList?: string;
  inputContainer?: string;
  textarea?: string;
  // Header
  header?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  // Bubble components
  bubbleWrapper?: string;
  bubble?: string;
  bubbleSent?: string;
  bubbleReceived?: string;
  timestamp?: string;
  editedBadge?: string;
  // Input components
  inputToolbar?: string;
  sendButton?: string;
  voiceButton?: string;
  actionButton?: string;
  // Add-on Features
  slashMenu?: string;
  slashMenuItem?: string;
  actionMenuTrigger?: string;
  actionMenuPopover?: string;
  actionMenuItem?: string;
  contextMenuTrigger?: string;
  contextMenuPopover?: string;
  contextMenuItem?: string;
  searchBar?: string;
  pinnedBanner?: string;
  unreadBadge?: string;
  dropZone?: string;
  scrollToBottomButton?: string;
  typingIndicator?: string;
}

export interface ChatControllerRef {
  scrollToBottom: () => void;
  focusInput: () => void;
  blurInput: () => void;
}

export interface ChatInputAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  color?: string;             // Accent color for the icon background
  description?: string;       // Subtitle text under the label
}

export interface ChatUIProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onMessageClick?: (message: ChatMessage) => void;
  onAvatarClick?: (message: ChatMessage) => void;
  className?: string;
  classNames?: ChatClassNames;
  dictionary?: Partial<ChatDictionary>;
  isTyping?: boolean;
  theme?: ChatTheme;
  placeholder?: string;
  disableImageLightbox?: boolean;
  renderAttachment?: (attachment: ChatMessageAttachment) => React.ReactNode;
  /** Array of actions to show in the expandable "+" menu */
  inputActions?: ChatInputAction[];
  /** Override just the action menu popover UI (keeps the "+" trigger) */
  renderActionMenu?: (actions: ChatInputAction[], isOpen: boolean, onClose: () => void) => React.ReactNode;
  /** Set to false to hide the "+" action button entirely. Default: true when inputActions is provided */
  showActionBar?: boolean;
}
