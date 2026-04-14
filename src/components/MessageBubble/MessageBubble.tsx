import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCheck, Clock, Pencil } from 'lucide-react';
import type { ChatMessage } from '../../types';
import { clsx } from 'clsx';
import { useChat } from '../../context/ChatContext';
import { MarkdownText } from '../Markdown/MarkdownText';
import { StreamingMarkdownText } from '../Markdown/StreamingMarkdownText';
import { MediaAttachments } from '../MediaAttachments';
import { TextToSpeech } from '../TextToSpeech';

export type GroupPosition = 'single' | 'first' | 'middle' | 'last';

export interface MessageBubbleProps {
  message: ChatMessage;
  isConsecutive?: boolean;
  groupPosition?: GroupPosition;
}

const formatTime = (date: Date): string => {
  return new Date(date).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const bubbleAnimation = {
  initial: { opacity: 0, y: 10, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.2, ease: 'easeOut' as const },
};

export const MessageBubble: React.FC<MessageBubbleProps> = React.memo(({ 
  message, 
  isConsecutive = false,
  groupPosition = 'single'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(message.text || '');
  
  const isSent = message.sender === 'user';
  const isSystem = message.sender === 'system';
  const context = useChat();
  const { onMessageClick, onAvatarClick, onReaction, classNames, allowEditing, onEditMessage } = context;
  
  const isStreaming = message.status === 'streaming';

  const handleSaveEdit = () => {
    if (draftText.trim() !== message.text && onEditMessage) {
      onEditMessage(message.id, draftText.trim());
    }
    setIsEditing(false);
  };
  
  const renderedText = context.renderText 
    ? context.renderText(message.text || '', message) 
    : message.text 
      ? isStreaming
        ? <StreamingMarkdownText isStreaming rehypePlugins={context?.markdownRehypePlugins}>{message.text}</StreamingMarkdownText>
        : <MarkdownText rehypePlugins={context?.markdownRehypePlugins}>{message.text}</MarkdownText> 
      : null;
  
  if (isSystem) {
    return (
      <div className={clsx('chat-ui-bubble-container chat-ui-system', classNames?.bubbleWrapper)}>
        <motion.div
           initial={{ opacity: 0, y: 5 }}
           animate={{ opacity: 1, y: 0 }}
           className={clsx('chat-ui-system-badge', classNames?.systemMessage)}
           onClick={onMessageClick ? () => onMessageClick(message) : undefined}
           role="status"
        >
          {message.text}
        </motion.div>
      </div>
    )
  }

  const showAvatar = !isConsecutive && groupPosition !== 'middle' && groupPosition !== 'last';
  const hasTimestamp = context.showTimestampOnHover !== false;

  return (
    <div 
      className={clsx(
        'chat-ui-bubble-container', 
        isConsecutive && 'consecutive',
        groupPosition !== 'single' && `group-${groupPosition}`,
        isHovered && 'hovered',
        classNames?.bubbleWrapper
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        initial={bubbleAnimation.initial}
        animate={bubbleAnimation.animate}
        transition={bubbleAnimation.transition}
        className={clsx(
          'chat-ui-bubble-wrapper', 
          isSent ? ['sent', classNames?.bubbleSent] : ['received', classNames?.bubbleReceived],
          groupPosition !== 'single' && `group-${groupPosition}`
        )}
        role="article"
        aria-label={message.sender === 'user' ? context.dictionary.messageFromUserAriaLabel : context.dictionary.messageFromAgentAriaLabel}
      >
        <div 
          onClick={onAvatarClick && showAvatar && !isSent ? () => onAvatarClick(message) : undefined}
          className={clsx(onAvatarClick && !isSent && 'chat-ui-avatar-clickable')}
        >
          {showAvatar && context.renderAvatar && !isSent && context.renderAvatar(message)}
        </div>
        
        <div className="chat-ui-bubble-content-col">
          <div 
            className={clsx("chat-ui-bubble", classNames?.bubble)}
            onClick={onMessageClick ? () => onMessageClick(message) : undefined}
          >
            {context.renderQuotePreview && message.replyTo && (
              <div className="chat-ui-quote-preview">
                {context.renderQuotePreview(message.replyTo)}
              </div>
            )}
            
            {allowEditing && isSent && isHovered && !isEditing && (
              <button 
                className="chat-ui-bubble-edit-btn" 
                onClick={(e) => { e.stopPropagation(); setDraftText(message.text || ''); setIsEditing(true); }}
                aria-label={context.dictionary.editMessageAriaLabel}
              >
                <Pencil size={12} />
              </button>
            )}

            {isEditing ? (
              <div className="chat-ui-message-edit-mode" onClick={(e) => e.stopPropagation()}>
                <textarea 
                  className="chat-ui-message-edit-textarea"
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveEdit(); }
                    if (e.key === 'Escape') { setIsEditing(false); }
                  }}
                  autoFocus
                  aria-label="Edit message text"
                />
                <div className="chat-ui-message-edit-actions">
                  <button onClick={() => setIsEditing(false)} className="chat-ui-message-edit-cancel">
                    {context.dictionary.cancelEditAriaLabel || 'Cancel'}
                  </button>
                  <button onClick={handleSaveEdit} className="chat-ui-message-edit-save" disabled={draftText.trim() === ''}>
                    {context.dictionary.saveEditAriaLabel || 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {message.attachments && message.attachments.length > 0 && (
                  <MediaAttachments 
                attachments={message.attachments} 
                onImageClick={context.disableImageLightbox ? undefined : (idx: number) => {
                  const images = message.attachments?.filter(a => a.type === 'image') || [];
                  context.openLightbox?.(images, idx);
                }} 
              />
            )}

            {renderedText}
            {isStreaming && <span className="chat-ui-streaming-cursor" />}
              </>
            )}
            
            <div className="chat-ui-bubble-footer">
              {message.isEdited && (
                <span className={clsx("chat-ui-edited-badge", classNames?.editedBadge)}>
                  <Pencil size={10} />
                  {context.dictionary.editedBadge}
                </span>
              )}
              {isSent && (() => {
                const getStatusText = (status: string | undefined) => {
                  switch(status) {
                    case 'sending': return context.dictionary.statusSending;
                    case 'sent': return context.dictionary.statusSent;
                    case 'delivered': return context.dictionary.statusDelivered;
                    case 'read': return context.dictionary.statusRead;
                    case 'failed': return context.dictionary.statusFailed;
                    default: return context.dictionary.statusUnknown;
                  }
                };
                return (
                  <div className="chat-ui-bubble-status" aria-label={`Message status: ${getStatusText(message.status)}`}>
                    {message.status === 'sending' && <Clock size={12} aria-hidden="true" />}
                    {message.status === 'sent' && <Check size={12} aria-hidden="true" />}
                    {(message.status === 'read' || message.status === 'delivered') && (
                      <CheckCheck size={12} color={message.status === 'read' ? 'var(--c-primary)' : 'inherit'} aria-hidden="true" />
                    )}
                  </div>
                );
              })()}
              {/* TTS button — only on agent messages when enabled */}
              {context.enableTTS && !isSent && !isStreaming && message.text && (
                context.renderTTSButton
                  ? context.renderTTSButton(false, () => {})
                  : <TextToSpeech text={message.text} voice={context.ttsVoice} rate={context.ttsRate} />
              )}
            </div>
          </div>

          {/* Timestamp — always rendered, visibility toggled by CSS opacity for smoothness */}
          {hasTimestamp && (
            <div className={clsx('chat-ui-timestamp', isSent && 'sent', isHovered && 'visible', classNames?.timestamp)}>
              {context.renderTimestamp
                ? context.renderTimestamp(message)
                : formatTime(message.timestamp)
              }
            </div>
          )}

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="chat-ui-reactions">
              {context.renderReactions 
                ? context.renderReactions(message, (emoji) => onReaction?.(message, emoji))
                : message.reactions.map((r) => (
                    <button
                      key={r.emoji}
                      className={clsx('chat-ui-reaction-badge', r.reacted && 'reacted', classNames?.reactionBadge)}
                      onClick={() => onReaction?.(message, r.emoji)}
                      {...{ 'aria-pressed': r.reacted ?? false }}
                      aria-label={`React with ${r.emoji}${r.count > 1 ? `, ${r.count} reactions` : ''}`}
                    >
                      {r.emoji} {r.count > 1 && <span>{r.count}</span>}
                    </button>
                  ))
              }
            </div>
          )}
          
          {context.renderMessageActions && (
             <div className="chat-ui-action-bar-wrapper">
               {context.renderMessageActions(message)}
             </div>
          )}
        </div>
        
        <div 
          onClick={onAvatarClick && showAvatar && isSent ? () => onAvatarClick(message) : undefined}
          className={clsx(onAvatarClick && isSent && 'chat-ui-avatar-clickable')}
        >
          {showAvatar && context.renderAvatar && isSent && context.renderAvatar(message)}
        </div>
      </motion.div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';
