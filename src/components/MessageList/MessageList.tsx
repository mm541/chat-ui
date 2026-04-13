import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { prepare, layout } from '@chenglou/pretext';
import { clsx } from 'clsx';
import type { ChatMessage } from '../../types';
import { MessageBubble } from '../MessageBubble';
import { useChat } from '../../context/ChatContext';

export interface MessageListProps {
  messages?: ChatMessage[];
  font?: string;
  lineHeight?: number;
}

// Fixed values matching our CSS
const BUBBLE_PADDING_Y = 24; // 12px top + 12px bottom (bubble inner padding)
const BUBBLE_MARGIN_Y = 8;   // 4px top + 4px bottom (wrapper padding)
const BUBBLE_MAX_WIDTH_RATIO = 0.85; 

export const MessageList: React.FC<MessageListProps> = ({ 
  messages: propMessages, 
  font = '16px Inter, system-ui, -apple-system, sans-serif',
  lineHeight = 24 
}) => {
  const context = useChat();
  const messages = propMessages || context.messages || [];
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  
  // Sticky-bottom: track if user is near the bottom (no state to avoid re-renders)
  const isNearBottomRef = useRef(true);
  const prevCountRef = useRef(messages.length);
  const streamMeasureTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number>(0);

  const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  };

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    isNearBottomRef.current = distanceFromBottom < 150;
    setShowScrollToBottom(distanceFromBottom > 200);
  }, []);

  // Re-measure container width on resize to properly calculate bubble max-width
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
         setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Scroll to bottom when new messages are ADDED (count increases)
  useEffect(() => {
    if (messages.length > prevCountRef.current) {
      // New message added — wait for Virtualizer to measure and render new row height
      setTimeout(() => scrollToBottom('smooth'), 50);
      isNearBottomRef.current = true;
    }
    prevCountRef.current = messages.length;
  }, [messages.length]);

  // Variables declared for later use
  const lastMessage = messages[messages.length - 1];
  const lastMessageText = lastMessage?.text;
  const lastMessageStatus = lastMessage?.status;

  // Pre-calculate heights using pretext (sub-microsecond off-DOM)
  // 1. One-time expensive work: Measure segments (bypasses DOM)
  // Only re-runs when messages or font change, NOT on resize!
  const preparedMessages = useMemo(() => {
    return messages.map((msg) => {
      // Don't prepare if it's rich media, system type, or custom text overriding it
      if (msg.sender === 'system' || msg.payload || context.renderText || context.renderQuotePreview || context.renderAvatar || context.renderMessageActions) {
        return null;
      }
      return prepare(msg.text || '', font, { whiteSpace: 'pre-wrap' });
    });
  }, [messages, font, context.renderText, context.renderQuotePreview, context.renderAvatar, context.renderMessageActions]);

  // 2. Cheap hot path: Pure arithmetic layout
  // Runs whenever containerWidth changes
  const measurements = useMemo(() => {
    if (containerWidth === 0) return Array(messages.length).fill(80); // Fallback estimate
    
    // Bubble internal max width
    const maxBubbleWidth = (containerWidth * BUBBLE_MAX_WIDTH_RATIO) - 32; // 32px horizontal padding
    
    return messages.map((msg, index) => {
      const prepared = preparedMessages[index];
      
      // If we skipped preparation (rich media, system, streaming, or custom render props present)
      // we fallback to fixed estimate and let ResizeObserver dynamically catch it.
      if (!prepared) {
        if (msg.sender === 'system') return 40;
        return Math.max(100, (msg.text?.length || 0) * 0.5); // Slightly smarter fallback
      }

      // Fast path: Pure text off-DOM C-like measurement
      const { height } = layout(prepared, maxBubbleWidth, lineHeight);

      // Evaluate Date Separator injection height estimate
      let dateSeparatorHeight = 0;
      if (context.renderDateSeparator) {
        if (index === 0) dateSeparatorHeight = 48; // Common height for date badge margin
        else {
          const prev = messages[index - 1];
          if (new Date(prev.timestamp).toDateString() !== new Date(msg.timestamp).toDateString()) {
            dateSeparatorHeight = 48; 
          }
        }
      }

      // Calculate total physical row height
      return height + BUBBLE_PADDING_Y + BUBBLE_MARGIN_Y + dateSeparatorHeight;
    });
  }, [messages, containerWidth, preparedMessages, lineHeight, context.renderDateSeparator]);

  // Virtualization engine
  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => containerRef.current,
    estimateSize: (index) => measurements[index] || 80,
    overscan: 20, // Render 20 items off-screen for fluidity
  });

  // Keep scrolled to bottom during streaming — use native scrollTop via rAF
  // to avoid the virtualizer recalc → scroll → measure feedback loop
  useEffect(() => {
    if (isNearBottomRef.current && lastMessageStatus === 'streaming') {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const el = containerRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      });
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [lastMessageText, lastMessageStatus]);

  // Disable CSS scroll-behavior: smooth during active streaming
  // so programmatic scrollTop assignments take effect instantly
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (lastMessageStatus === 'streaming') {
      el.style.scrollBehavior = 'auto';
    } else {
      el.style.scrollBehavior = '';
    }
  }, [lastMessageStatus]);


  return (
    <div 
      ref={containerRef} 
      className={clsx("chat-ui-message-list-container", context.classNames?.messageList)}
      role="log"
      aria-live="polite"
      aria-atomic="false"
      onScroll={handleScroll}
    >
      {messages.length === 0 && context.renderEmptyState ? (
        <div className="chat-ui-empty-state-wrapper">
          {context.renderEmptyState()}
        </div>
      ) : (
        <div
          className="chat-ui-virtualizer-outer"
          ref={(el) => {
            if (el) el.style.setProperty('--chat-virtualizer-height', `${rowVirtualizer.getTotalSize()}px`);
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const message = messages[virtualRow.index];
            const previousMessage = virtualRow.index > 0 ? messages[virtualRow.index - 1] : null;
            
            let showDateSeparator = false;
            let isConsecutive = false;
            
            if (previousMessage) {
              const prevDate = new Date(previousMessage.timestamp);
              const currDate = new Date(message.timestamp);
              
              if (prevDate.toDateString() !== currDate.toDateString()) {
                showDateSeparator = true;
              } else if (previousMessage.sender === message.sender) {
                // If within clusterTimeWindow, cluster them
                const windowMs = context.clusterTimeWindow ?? (5 * 60 * 1000);
                if (currDate.getTime() - prevDate.getTime() < windowMs) {
                  isConsecutive = true;
                }
              }
            } else {
              showDateSeparator = true;
            }

            // Compute group position for visual clustering
            const nextMessage = virtualRow.index < messages.length - 1 ? messages[virtualRow.index + 1] : null;
            const sameSenderAsPrev = previousMessage?.sender === message.sender && isConsecutive;
            const sameSenderAsNext = nextMessage 
              && nextMessage.sender === message.sender 
              && !showDateSeparator
              && new Date(message.timestamp).toDateString() === new Date(nextMessage.timestamp).toDateString()
              && (new Date(nextMessage.timestamp).getTime() - new Date(message.timestamp).getTime()) < (context.clusterTimeWindow ?? (5 * 60 * 1000));
            
            let groupPosition: 'single' | 'first' | 'middle' | 'last' = 'single';
            if (sameSenderAsPrev && sameSenderAsNext) groupPosition = 'middle';
            else if (sameSenderAsPrev) groupPosition = 'last';
            else if (sameSenderAsNext) groupPosition = 'first';

            return (
              <div
                key={message.id}
                data-index={virtualRow.index}
                className="chat-ui-virtualizer-row"
                ref={(el) => {
                  if (!el) return;
                  el.style.setProperty('--chat-virtualizer-offset', `${virtualRow.start}px`);
                  // Throttle measurements for the streaming row to prevent vibration
                  if (message.status === 'streaming') {
                    if (!streamMeasureTimerRef.current) {
                      streamMeasureTimerRef.current = setTimeout(() => {
                        streamMeasureTimerRef.current = null;
                        rowVirtualizer.measureElement(el);
                      }, 200);
                    }
                  } else {
                    rowVirtualizer.measureElement(el);
                  }
                }}
              >
                {showDateSeparator && context.renderDateSeparator && (
                  <div className="chat-ui-date-separator">
                    {context.renderDateSeparator(new Date(message.timestamp))}
                  </div>
                )}
                {(() => {
                  const customNode = context.renderMessage?.(message);
                  return customNode ? customNode : <MessageBubble message={message} isConsecutive={isConsecutive} groupPosition={groupPosition} />;
                })()}
              </div>
            );
          })}
        </div>
      )}

      {showScrollToBottom && (
        <button 
          className={clsx("chat-ui-scroll-bottom-fab", context.classNames?.scrollToBottomButton)}
          onClick={() => {
            rowVirtualizer.scrollToIndex(messages.length - 1, { align: 'end', behavior: 'smooth' });
          }}
          aria-label={context.dictionary.scrollToBottomAriaLabel}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
        </button>
      )}
    </div>
  );
};
