import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { clsx } from 'clsx';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { useChat } from '../../context/ChatContext';

export interface VoiceInputProps {
  locale?: string;
  onTranscript?: (transcript: string) => void;
  renderButton?: (isListening: boolean, toggle: () => void) => React.ReactNode;
  className?: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  locale = 'en-US',
  onTranscript,
  renderButton,
  className,
}) => {
  const { isListening, isSupported, toggle } = useVoiceInput({
    locale,
    onTranscript,
  });
  const { dictionary, classNames: globalClassNames } = useChat();

  if (!isSupported) return null;

  if (renderButton) {
    return <>{renderButton(isListening, toggle)}</>;
  }

  return (
    <button
      className={clsx('chat-ui-voice-btn', isListening && 'listening', globalClassNames?.voiceButton, className)}
      onClick={toggle}
      aria-label={isListening ? dictionary.voiceStopAriaLabel : dictionary.voiceStartAriaLabel}
      title={isListening ? dictionary.voiceStopAriaLabel : dictionary.voiceStartAriaLabel}
      type="button"
    >
      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
      {isListening && <span className="chat-ui-voice-pulse" />}
    </button>
  );
};
