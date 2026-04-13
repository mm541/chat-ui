import { useState } from 'react';
import { Settings, ChevronUp } from 'lucide-react';
import type { ChatMessage, ChatTheme, ChatControllerRef } from '../index';
import { StateControls, ThemeControls, ActionControls, ContentControls } from './controls';

interface DevControlsProps {
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  theme: ChatTheme | { [key: string]: string };
  setTheme: React.Dispatch<React.SetStateAction<ChatTheme | { [key: string]: string }>>;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  modelId: string;
  setModelId: (model: string) => void;
  chatRef: React.RefObject<ChatControllerRef | null>;
}

export const DevControls = ({
  setMessages,
  theme,
  setTheme,
  geminiApiKey,
  setGeminiApiKey,
  modelId,
  setModelId,
  chatRef,
}: DevControlsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="dev-toggle-fab"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Hide dev toolbar' : 'Show dev toolbar'}
        title="Dev Controls"
      >
        {isOpen ? <ChevronUp size={18} /> : <Settings size={18} />}
      </button>

      <div className={`dev-controls-panel ${isOpen ? 'dev-controls-panel--open' : ''}`}>
        <div className="dev-controls-wrapper">
          <StateControls setMessages={setMessages} chatRef={chatRef} />
          <ThemeControls theme={theme} setTheme={setTheme} />
          <ActionControls 
            geminiApiKey={geminiApiKey} 
            setGeminiApiKey={setGeminiApiKey}
            modelId={modelId}
            setModelId={setModelId} 
            chatRef={chatRef} 
          />
          <ContentControls setMessages={setMessages} />
        </div>
      </div>
    </>
  );
};
