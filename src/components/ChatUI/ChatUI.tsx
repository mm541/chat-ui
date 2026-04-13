import React from 'react';
import { clsx } from 'clsx';
import { ChatProvider } from '../../context/ChatContext';
import type { ChatProviderProps } from '../../context/ChatContext';
import { MessageList } from '../MessageList';
import { ChatInput } from '../Input';
import { ChatHeader } from '../Header';
import { TypingIndicator } from '../TypingIndicator';
import { SuggestedReplies } from '../SuggestedReplies';
import { SuggestedRepliesConnected } from '../SuggestedReplies/SuggestedRepliesConnected';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

export interface ChatUIProps extends Omit<ChatProviderProps, 'children'> {
  className?: string;
  children?: React.ReactNode;
  headerTitle?: string;
  headerSubtitle?: string;
  headerAvatar?: React.ReactNode;
  headerActions?: React.ReactNode;
}

const ChatUIRoot = React.forwardRef<import('../../types').ChatControllerRef, ChatUIProps>(
  ({ 
    messages, 
    onSendMessage, 
    onFileUpload, 
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
    showTimestampOnHover,
    placeholder,
    classNames,
    isTyping, 
    theme = 'dark',
    className, 
    children,
    headerTitle = 'Chat',
    headerSubtitle,
    headerAvatar,
    headerActions,
    clusterTimeWindow,
    markdownRehypePlugins,
    inputActions,
    renderActionMenu,
    showActionBar,
    // All new features spread through
    ...restProps
  }, ref) => {
    const customThemeStyle = typeof theme === 'object' ? theme : undefined;
    const themeClass = typeof theme === 'string' && theme !== 'dark' ? `chat-ui-theme-${theme}` : '';

    React.useImperativeHandle(ref, () => ({
      scrollToBottom: () => window.dispatchEvent(new CustomEvent('chat-ui-scroll-bottom')),
      focusInput: () => window.dispatchEvent(new CustomEvent('chat-ui-focus-input')),
      blurInput: () => window.dispatchEvent(new CustomEvent('chat-ui-blur-input'))
    }), []);

    useKeyboardShortcuts();

    return (
      <ChatProvider 
        messages={messages} 
        onSendMessage={onSendMessage}
        onFileUpload={onFileUpload}
        onEditMessage={onEditMessage}
        onDeleteMessage={onDeleteMessage}
        onReaction={onReaction}
        renderMessage={renderMessage}
        renderMessageActions={renderMessageActions}
        renderText={renderText}
        renderQuotePreview={renderQuotePreview}
        renderAvatar={renderAvatar}
        renderInputActions={renderInputActions}
        renderInputToolbar={renderInputToolbar}
        renderEmptyState={renderEmptyState}
        renderDateSeparator={renderDateSeparator}
        renderHeader={renderHeader}
        renderTimestamp={renderTimestamp}
        renderReactions={renderReactions}
        showTimestampOnHover={showTimestampOnHover}
        placeholder={placeholder}
        classNames={classNames}
        theme={theme}
        isTyping={isTyping}
        clusterTimeWindow={clusterTimeWindow}
        markdownRehypePlugins={markdownRehypePlugins}
        inputActions={inputActions}
        renderActionMenu={renderActionMenu}
        showActionBar={showActionBar}
        {...restProps}
      >
        <div 
          className={clsx('chat-ui-root', themeClass, className, classNames?.chatRoot)}
          ref={(el) => {
            if (el && customThemeStyle) {
              Object.entries(customThemeStyle).forEach(([key, value]) => {
                if (typeof value === 'string') {
                  el.style.setProperty(key, value);
                }
              });
            }
          }}
          role="region"
          aria-label="Chat Interface"
        >
          {children || (
            <>
              {renderHeader ? renderHeader() : <ChatHeader title={headerTitle} subtitle={headerSubtitle} avatar={headerAvatar} actions={headerActions} />}
              <MessageList />
              {isTyping && <TypingIndicator />}
              <SuggestedRepliesConnected />
              <ChatInput />
            </>
          )}
        </div>
      </ChatProvider>
    );
  }
);

ChatUIRoot.displayName = 'ChatUI';

export const ChatUI = Object.assign(ChatUIRoot, {
  MessageList,
  Input: ChatInput,
  Header: ChatHeader,
  TypingIndicator,
  SuggestedReplies,
});
