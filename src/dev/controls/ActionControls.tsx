import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { ChatControllerRef } from '../../index';
import { GEMINI_MODELS } from '../constants';
import { KeyManagerModal } from './KeyManagerModal';

interface ActionControlsProps {
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  modelId: string;
  setModelId: (model: string) => void;
  chatRef: React.RefObject<ChatControllerRef | null>;
}

export const ActionControls = ({ geminiApiKey, setGeminiApiKey, modelId, setModelId, chatRef }: ActionControlsProps) => {
  const [isKeyOpen, setIsKeyOpen] = useState(false);
  const keyCount = geminiApiKey.split(/[\n,]+/).filter(k => k.trim()).length;

  return (
    <div className="dev-controls-group">
      <span className="dev-section-label">Actions</span>
      
      <select
        aria-label="Model selector"
        title="Select Gemini Model"
        className="dev-select dev-select-model"
        value={modelId}
        onChange={(e) => setModelId(e.target.value)}
      >
        {GEMINI_MODELS.map(model => (
          <option key={model.id} value={model.id}>
            {model.label}
          </option>
        ))}
      </select>

      <button className="dev-btn" onClick={() => chatRef.current?.focusInput()}>
        Focus Input
      </button>
      <button className="dev-btn" onClick={() => chatRef.current?.scrollToBottom()}>
        Scroll Bottom
      </button>
      
      <div className="dev-key-manager-container">
        <button 
          className="dev-btn dev-key-btn" 
          onClick={() => setIsKeyOpen(true)}
          title="Manage API Keys"
          data-active={keyCount > 0}
        >
          🔑 Keys ({keyCount})
        </button>

        {isKeyOpen && typeof document !== 'undefined' && createPortal(
          <KeyManagerModal 
            initialKeyString={geminiApiKey} 
            onSave={setGeminiApiKey} 
            onClose={() => setIsKeyOpen(false)} 
          />,
          document.body
        )}
      </div>
    </div>
  );
};
