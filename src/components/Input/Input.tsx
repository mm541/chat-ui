import React, { useRef, useEffect } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { clsx } from 'clsx';
import { useChat } from '../../context/ChatContext';
import { ActionMenu } from '../ActionMenu';
import { VoiceInput } from '../VoiceInput';
import { SlashCommands } from '../SlashCommands';
import { useSlashCommands } from '../../hooks/useSlashCommands';

export interface ChatInputProps {
  onSend?: (text: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSend: propOnSend, 
  disabled = false, 
}) => {
  const context = useChat();
  const onSend = propOnSend || context.onSendMessage;
  
  // Extract custom overrides from context
  const { 
    onFileUpload, renderInputToolbar, renderInputActions, placeholder, classNames,
    inputActions, renderActionMenu, showActionBar,
    enableVoiceInput, voiceInputLocale, onVoiceTranscript, renderVoiceButton,
    slashCommands, onSlashCommand, renderSlashMenu,
    // Phase 4: Deeper Customization
    onInputChange, maxInputLength, showCharacterCount,
    renderSendButton, renderAttachButton,
  } = context;

  const [text, setText] = React.useState('');
  const [isDragging, setIsDragging] = React.useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Slash commands integration
  const slash = useSlashCommands({
    commands: slashCommands || [],
    onSelect: (cmd) => {
      setText('');
      cmd.action?.();
      onSlashCommand?.(cmd);
    },
  });

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [text]);

  const isOverLimit = maxInputLength != null && text.length > maxInputLength;
  const isSendDisabled = disabled || !text.trim() || isOverLimit;

  const handleSend = () => {
    if (text.trim() && !disabled && !isOverLimit) {
      onSend(text.trim());
      setText('');
      if (textareaRef.current) {
         textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Let slash commands handle the keyboard first
    if (slash.isOpen && slash.handleKeyDown(e)) return;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    // Fire consumer callback
    onInputChange?.(val);
    // Detect slash commands
    if (slashCommands && slashCommands.length > 0) {
      slash.handleInputChange(val);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      e.preventDefault();
      onFileUpload?.(e.clipboardData.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload?.(e.dataTransfer.files);
    }
  };

  // Voice transcript handler — fill the textarea with the transcript
  const handleVoiceTranscript = (transcript: string) => {
    setText((prev) => prev ? `${prev} ${transcript}` : transcript);
    onVoiceTranscript?.(transcript);
    // Focus the textarea after transcript
    textareaRef.current?.focus();
  };

  // File attach trigger (shared between default and custom)
  const triggerFileAttach = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        onFileUpload?.(target.files);
      }
    };
    input.click();
  };

  // Determine what to render for the left-side action area
  const shouldShowActionMenu = inputActions && inputActions.length > 0 && showActionBar !== false;

  const renderLeftAction = () => {
    // Level 3: full override
    if (renderInputActions) return renderInputActions();

    // Level 1/2: ActionMenu with optional popover override
    if (shouldShowActionMenu) {
      return <ActionMenu actions={inputActions!} renderActionMenu={renderActionMenu} />;
    }

    // Custom attach button render slot
    if (renderAttachButton) {
      return renderAttachButton(triggerFileAttach);
    }

    // Fallback: simple paperclip file upload button
      return (
      <button 
        className={clsx("chat-ui-action-btn", context.classNames?.actionButton)} 
        aria-label={context.dictionary.attachFileAriaLabel} 
        title={context.dictionary.attachFileAriaLabel} 
        onClick={triggerFileAttach}>
        <Paperclip size={20} />
      </button>
    );
  };

  return (
    <div className={clsx("chat-ui-input-container", classNames?.inputContainer)}>
      {renderInputToolbar && (
        <div className={clsx("chat-ui-input-toolbar", context.classNames?.inputToolbar)}>
          {renderInputToolbar()}
        </div>
      )}
      <div 
        className={clsx("chat-ui-input-area", classNames?.inputArea, isDragging ? 'chat-ui-dragging' : '')}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {renderLeftAction()}
        
        <div className="chat-ui-textarea-wrapper">
          {/* Slash commands popup */}
          {slash.isOpen && slashCommands && slashCommands.length > 0 && (
            renderSlashMenu 
              ? renderSlashMenu(slash.filteredCommands, slash.selectedIndex, slash.selectCommand)
              : <SlashCommands commands={slash.filteredCommands} selectedIndex={slash.selectedIndex} onSelect={slash.selectCommand} />
          )}

          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={isDragging ? context.dictionary.inputPlaceholderDragging : (placeholder || context.dictionary.inputPlaceholder)}
            disabled={disabled}
            className={clsx("chat-ui-textarea", classNames?.textarea, isOverLimit && 'chat-ui-textarea-over-limit')}
            rows={1}
            aria-label={context.dictionary.inputPlaceholder}
            aria-invalid={isOverLimit ? 'true' : undefined}
            maxLength={undefined} // We handle validation ourselves for UX
          />
        </div>

        {/* Character counter */}
        {(showCharacterCount || (maxInputLength != null && text.length > 0)) && (
          <span className={clsx('chat-ui-char-counter', isOverLimit && 'over-limit')}>
            {text.length}{maxInputLength != null ? `/${maxInputLength}` : ''}
          </span>
        )}

        {/* Voice input button */}
        {enableVoiceInput && (
          <VoiceInput
            locale={voiceInputLocale}
            onTranscript={handleVoiceTranscript}
            renderButton={renderVoiceButton}
          />
        )}

        {/* Send button — custom or default */}
        {renderSendButton ? (
          renderSendButton(isSendDisabled, handleSend)
        ) : (
          <button 
            className={clsx(
              "chat-ui-send-btn", 
              context.classNames?.sendButton,
              !isSendDisabled && context.classNames?.sendButtonActive,
            )} 
            onClick={handleSend}
            disabled={isSendDisabled}
            aria-label={context.dictionary.sendButtonAriaLabel}
            title={context.dictionary.sendButtonAriaLabel}
          >
            <Send size={20} />
          </button>
        )}
      </div>
    </div>
  );
};
