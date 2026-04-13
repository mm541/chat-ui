import { useState, useCallback, useRef } from 'react';

interface UseTextToSpeechOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
}

interface UseTextToSpeechReturn {
  isSpeaking: boolean;
  isSupported: boolean;
  speak: (text: string) => void;
  stop: () => void;
  toggle: (text: string) => void;
}

/**
 * Headless hook for browser-native text-to-speech via SpeechSynthesis API.
 */
export const useTextToSpeech = ({
  voice: voiceName,
  rate = 1.0,
  pitch = 1.0,
}: UseTextToSpeechOptions = {}): UseTextToSpeechReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const speak = useCallback(
    (text: string) => {
      if (!isSupported) return;
      
      // Stop any current speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;

      // Try to find the requested voice
      if (voiceName) {
        const voices = window.speechSynthesis.getVoices();
        const found = voices.find((v) => v.name.toLowerCase().includes(voiceName.toLowerCase()));
        if (found) utterance.voice = found;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, voiceName, rate, pitch]
  );

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  const toggle = useCallback(
    (text: string) => {
      if (isSpeaking) stop();
      else speak(text);
    },
    [isSpeaking, speak, stop]
  );

  return { isSpeaking, isSupported, speak, stop, toggle };
};
