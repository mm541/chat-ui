import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { clsx } from 'clsx';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';

export interface TextToSpeechProps {
  text: string;
  voice?: string;
  rate?: number;
  renderButton?: (isSpeaking: boolean, toggle: () => void) => React.ReactNode;
  className?: string;
}

export const TextToSpeech: React.FC<TextToSpeechProps> = ({
  text,
  voice,
  rate,
  renderButton,
  className,
}) => {
  const { isSpeaking, isSupported, toggle } = useTextToSpeech({ voice, rate });

  if (!isSupported) return null;

  if (renderButton) {
    return <>{renderButton(isSpeaking, () => toggle(text))}</>;
  }

  return (
    <button
      className={clsx('chat-ui-tts-btn', isSpeaking && 'speaking', className)}
      onClick={() => toggle(text)}
      aria-label={isSpeaking ? 'Stop reading' : 'Read aloud'}
      title={isSpeaking ? 'Stop' : 'Read aloud'}
      type="button"
    >
      {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
    </button>
  );
};
