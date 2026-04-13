import { useState } from 'react';
import { X, Plus } from 'lucide-react';

export const KeyManagerModal = ({ 
  initialKeyString, 
  onSave, 
  onClose 
}: { 
  initialKeyString: string; 
  onSave: (val: string) => void; 
  onClose: () => void; 
}) => {
  const [keys, setKeys] = useState<string[]>(() => {
    const parsed = initialKeyString.split(/[\n,]+/).map(k => k.trim()).filter(Boolean);
    return parsed.length > 0 ? parsed : [''];
  });

  const handleKeyChange = (index: number, value: string) => {
    const newKeys = [...keys];
    newKeys[index] = value;
    setKeys(newKeys);
  };

  const removeKey = (index: number) => {
    const newKeys = keys.filter((_, i) => i !== index);
    setKeys(newKeys.length > 0 ? newKeys : ['']);
  };

  const addKey = () => setKeys([...keys, '']);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKey();
    }
  };

  return (
    <div className="dev-key-modal-overlay" onClick={onClose}>
      <div className="dev-key-modal" onClick={e => e.stopPropagation()}>
         <div className="dev-key-modal-header">
           <h3>API Key Configuration</h3>
         </div>
         <div className="dev-key-modal-text">
           Enter your Gemini API keys below. The chat will automatically rotate to the next key if you hit a Quota Exceeded limit.<br/>
           Press <kbd>Enter</kbd> to add a new key field quickly.
         </div>
         
         <div className="dev-key-list">
           {keys.map((k, idx) => (
             <div className="dev-key-row" key={idx}>
               <input
                 type="password"
                 className="dev-key-input"
                 placeholder="AIzaSy..."
                 value={k}
                 onChange={e => handleKeyChange(idx, e.target.value)}
                 onKeyDown={handleKeyDown}
                 autoFocus={idx === keys.length - 1}
               />
               <button className="dev-icon-btn" onClick={() => removeKey(idx)} title="Remove Key">
                 <X size={14} />
               </button>
             </div>
           ))}
         </div>

         <div className="dev-key-modal-actions">
           <button className="dev-btn secondary dev-btn-with-icon" onClick={addKey}>
             <Plus size={14} /> Add Another Key
           </button>
         </div>

         <div className="dev-key-modal-footer">
           <button className="dev-btn primary" onClick={() => {
             onSave(keys.filter(Boolean).join(','));
             onClose();
           }}>Save & Close</button>
         </div>
      </div>
    </div>
  );
};
