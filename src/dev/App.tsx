import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';
import './styles/layout.css';
import './styles/controls.css';
import './styles/slots.css';
import { ChatUI } from '../index';
import type { ChatMessage, ChatTheme, ChatControllerRef, ChatInputAction, SuggestedReply, SlashCommand } from '../index';
import { Camera, FileText, Mic, MapPin, BarChart3, Image, Code, Sparkles, Search, Globe } from 'lucide-react';
import type { ChatDictionary } from '../index';

import { initialMessages } from './constants';
import { useGeminiChat } from './useGeminiChat';
import { DevControls } from './DevControls';
import {
  renderCustomMessage,
  renderActionBar,
  renderQuote,
  renderAvatar,
  renderInputToolbar,
  renderDateSeparator,
  createRenderEmptyState,
} from './renderSlots';



const esDictionary: Partial<ChatDictionary> = {
  inputPlaceholder: "Escribe un mensaje...",
  inputPlaceholderDragging: "Suelta los archivos aquí...",
  sendButtonAriaLabel: "Enviar mensaje",
  attachFileAriaLabel: "Adjuntar archivo",
  messageFromUserAriaLabel: "Mensaje tuyo",
  messageFromAgentAriaLabel: "Mensaje del asistente",
  statusSending: "Enviando...",
  statusSent: "Enviado",
  statusDelivered: "Entregado",
  statusRead: "Leído",
  statusFailed: "Fallido",
  statusUnknown: "Desconocido",
  editedBadge: "editado",
  slashCommandsAriaLabel: "Comandos de barra",
  actionMenuOpenAriaLabel: "Abrir menú de acciones",
  actionMenuCloseAriaLabel: "Cerrar menú de acciones",
  searchPlaceholder: "Buscar mensajes...",
  dropZoneText: "¡Suelta el archivo para subir!",
  contextMenuReply: "Responder",
  contextMenuCopy: "Copiar",
  contextMenuCopied: "¡Copiado!",
  contextMenuEdit: "Editar",
  contextMenuDelete: "Eliminar",
};

export const App = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [theme, setTheme] = useState<ChatTheme | { [key: string]: string }>('dark');
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [modelId, setModelId] = useState<string>('gemini-3.1-flash-lite-preview');
  const chatRef = useRef<ChatControllerRef>(null);
  const [suggestions, setSuggestions] = useState<SuggestedReply[]>([]);
  const [isSpanish, setIsSpanish] = useState(false);

  const { sendToGemini } = useGeminiChat({ apiKey: geminiApiKey, model: modelId, messages, setMessages });

  const handleEditMessage = (id: string, newText: string) => {
    setMessages((prev) => 
      prev.map(msg => 
        msg.id === id 
          ? { ...msg, text: newText, isEdited: true } 
          : msg
      )
    );
  };

  // Sync API key to local storage
  useEffect(() => {
    localStorage.setItem('gemini_api_key', geminiApiKey);
  }, [geminiApiKey]);

  const handleSendMessage = async (text: string) => {
    // Clear suggestions when user sends a message
    setSuggestions([]);

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
    };
    setMessages(prev => [...prev, newMsg]);

    // Try Gemini first; if no key, fall back to fake streaming
    const handled = await sendToGemini(text, newMsg.id);
    if (handled) {
      // Show suggestions after agent response
      setTimeout(() => {
        setSuggestions([
          { id: 'sg-1', label: 'Tell me more', icon: <Sparkles size={14} /> },
          { id: 'sg-2', label: 'Give me an example' },
          { id: 'sg-3', label: 'Explain simply' },
        ]);
      }, 1000);
      return;
    }

    // Fallback: Fake streaming
    setTimeout(() => {
      setMessages(prev =>
        prev.map(m => (m.id === newMsg.id ? { ...m, status: 'sent' } : m))
      );

      setTimeout(() => {
        const agentResponse: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          text: '',
          sender: 'agent',
          timestamp: new Date(),
          status: 'streaming',
        };
        setMessages(prev => [...prev, agentResponse]);

        const fullResponse = `## Got it! 🚀\n\nI received your message: **"${text}"**\n\nHere's a quick code snippet:\n\n\`\`\`js\nconsole.log("Hello from Luminescent AI!");\n\`\`\`\n\n- First point\n- Second point\n- Third with \`inline code\`\n\n> This is a blockquote for emphasis.`;
        let index = 0;
        const interval = setInterval(() => {
          index++;
          setMessages(prev =>
            prev.map(m =>
              m.id === agentResponse.id ? { ...m, text: fullResponse.slice(0, index) } : m
            )
          );

          if (index >= fullResponse.length) {
            clearInterval(interval);
            setMessages(prev =>
              prev.map(m =>
                m.id === agentResponse.id ? { ...m, status: 'delivered' } : m
              )
            );
            // Show suggestions after streaming completes
            setSuggestions([
              { id: 'sg-1', label: 'Tell me more', icon: <Sparkles size={14} /> },
              { id: 'sg-2', label: 'Give me an example' },
              { id: 'sg-3', label: 'Explain simply' },
            ]);
          }
        }, 25);
      }, 500);
    }, 500);
  };

  // --- Demo: Input Actions ---
  const demoActions: ChatInputAction[] = [
    { id: 'photo', label: 'Photo', icon: <Camera size={20} />, onClick: () => alert('📷 Open photo picker'), color: '#8b5cf6' },
    { id: 'file', label: 'File', icon: <FileText size={20} />, onClick: () => alert('📎 Open file picker'), color: '#3b82f6' },
    { id: 'voice', label: 'Voice', icon: <Mic size={20} />, onClick: () => alert('🎤 Start recording'), color: '#ef4444' },
    { id: 'location', label: 'Location', icon: <MapPin size={20} />, onClick: () => alert('📍 Share location'), color: '#22c55e' },
    { id: 'poll', label: 'Poll', icon: <BarChart3 size={20} />, onClick: () => alert('📊 Create poll'), color: '#f59e0b' },
  ];

  // --- Demo: Slash Commands ---
  const demoSlashCommands: SlashCommand[] = [
    { id: 'sc-image', label: 'Generate Image', description: 'Create an image from a prompt', shortcut: '/image', icon: <Image size={16} /> },
    { id: 'sc-code', label: 'Write Code', description: 'Generate code in any language', shortcut: '/code', icon: <Code size={16} /> },
    { id: 'sc-explain', label: 'Explain', description: 'Explain the selected topic simply', shortcut: '/explain', icon: <Sparkles size={16} /> },
    { id: 'sc-search', label: 'Search Web', description: 'Search the web for information', shortcut: '/search', icon: <Search size={16} /> },
    { id: 'sc-clear', label: 'Clear Chat', description: 'Delete all messages in the current session', shortcut: '/clear', icon: <BarChart3 size={16} />, action: () => setMessages([]) },
  ];

  const handleSlashCommand = (cmd: SlashCommand) => {
    console.log('Slash command selected:', cmd);
    // Prefill the input with the command description
    handleSendMessage(`[${cmd.label}]: `);
  };

  const handleVoiceTranscript = (transcript: string) => {
    console.log('Voice transcript:', transcript);
  };

  return (
    <div className={clsx('dev-app-wrapper', typeof theme === 'string' && theme !== 'dark' && `chat-ui-theme-${theme}`)}>

      <DevControls
        setMessages={setMessages}
        theme={theme}
        setTheme={setTheme}
        geminiApiKey={geminiApiKey}
        setGeminiApiKey={setGeminiApiKey}
        modelId={modelId}
        setModelId={setModelId}
        chatRef={chatRef}
      />

      <div className="dev-chat-container">
        <ChatUI
          headerActions={
            <button onClick={() => setIsSpanish(!isSpanish)} className="chat-ui-action-btn" title="Toggle Language">
              <Globe size={18} /> {isSpanish ? 'English' : 'Español'}
            </button>
          }
          dictionary={isSpanish ? esDictionary : undefined}
          classNames={{
            chatRoot: 'custom-dev-chat',
            bubbleSent: 'my-custom-sent-bubble', // just testing injection
            bubbleReceived: 'my-custom-received-bubble'
          }}
          ref={chatRef}
          theme={theme}
          messages={messages}
          onSendMessage={handleSendMessage}
          onMessageClick={(msg) => console.log('Clicked message:', msg.id)}
          placeholder={isSpanish ? "Escribe un mensaje o prueba /imagen, /codigo..." : "Type a message or try /image, /code..."}
          markdownRehypePlugins={[rehypeHighlight]}
          renderMessage={renderCustomMessage}
          renderMessageActions={renderActionBar}
          renderQuotePreview={renderQuote}
          renderAvatar={renderAvatar}
          renderInputToolbar={renderInputToolbar}
          renderDateSeparator={renderDateSeparator}
          renderEmptyState={createRenderEmptyState(handleSendMessage)}
          inputActions={demoActions}
          // --- New Features ---
          suggestions={suggestions}
          onSuggestionClick={(s) => handleSendMessage(s.value || s.label)}
          enableVoiceInput
          voiceInputLocale="en-US"
          onVoiceTranscript={handleVoiceTranscript}
          slashCommands={demoSlashCommands}
          onSlashCommand={handleSlashCommand}
          enableTTS
          headerTitle="Luminescent AI"
          headerSubtitle="Online"
          // --- Phase 4: Deeper Customization ---
          onInputChange={(text) => console.log('[onInputChange]', text.length, 'chars')}
          maxInputLength={500}
          showCharacterCount
          allowEditing
          onEditMessage={handleEditMessage}
        />
      </div>
    </div>
  );
};
