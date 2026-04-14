import React from 'react';
import { useChat } from '../../context/ChatContext';
import { SuggestedReplies } from '../SuggestedReplies';
import type { SuggestedReply } from '../../types';

/**
 * Internal connected component that reads suggestion state from ChatContext.
 * Renders the default SuggestedReplies UI, or the user's custom renderSuggestions override.
 */
export const SuggestedRepliesConnected: React.FC = () => {
  const ctx = useChat();
  const { suggestions: propSuggestions, onSuggestionClick, renderSuggestions, onSendMessage, messages, classNames } = ctx;

  // Get suggestions from either the prop or the last agent message
  const lastAgentMsg = [...messages].reverse().find((m) => m.sender === 'agent');
  const activeSuggestions = propSuggestions || lastAgentMsg?.suggestions;

  if (!activeSuggestions || activeSuggestions.length === 0) return null;

  const handleClick = (s: SuggestedReply) => {
    if (onSuggestionClick) {
      onSuggestionClick(s);
    } else {
      onSendMessage(s.value || s.label);
    }
  };

  if (renderSuggestions) {
    return <>{renderSuggestions(activeSuggestions, handleClick)}</>;
  }

  return (
    <SuggestedReplies 
      suggestions={activeSuggestions} 
      onSelect={handleClick} 
      className={classNames?.suggestedRepliesBar}
      chipClassName={classNames?.suggestedReply}
    />
  );
};
