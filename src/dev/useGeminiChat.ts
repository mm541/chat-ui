import { useState, useCallback, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ChatMessage } from '../index';

const MAX_RETRIES = 5; // Increased slightly since we do key rotation now

interface UseGeminiChatOptions {
  apiKey: string; // Can now be a comma-separated list of keys
  model: string; // Dynamic model parameter
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

/**
 * Custom hook encapsulating Gemini API streaming with retry logic and KEY ROTATION.
 * Pass multiple comma-separated keys in the dev UI to automatically rotate on 429s.
 */
export function useGeminiChat({ apiKey, model: modelId, messages, setMessages }: UseGeminiChatOptions) {
  const [isStreaming, setIsStreaming] = useState(false);
  const keyIndexRef = useRef(0);

  const sendToGemini = useCallback(async (text: string, userMsgId: string) => {
    // Parse keys by comma or newline and ensure we have at least one
    const keys = apiKey.split(/[\n,]+/).map(k => k.trim()).filter(Boolean);
    if (keys.length === 0) return false;

    // Reset index if it went out of bounds (e.g. user deleted keys from input)
    if (keyIndexRef.current >= keys.length) {
      keyIndexRef.current = 0;
    }

    setIsStreaming(true);

    // Mark user message as sent
    setMessages(prev =>
      prev.map(m => m.id === userMsgId ? { ...m, status: 'sent' } : m)
    );

    // Create the agent response bubble
    const agentResponse: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      text: '',
      sender: 'agent',
      timestamp: new Date(),
      status: 'streaming'
    };
    setMessages(prev => [...prev, agentResponse]);

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const currentKey = keys[keyIndexRef.current];
        const genAI = new GoogleGenerativeAI(currentKey);
        const model = genAI.getGenerativeModel({ model: modelId });

        // Assemble alternating history
        const rawHistory = messages
          .filter(m => m.sender === 'user' || m.sender === 'agent')
          .map(m => ({
            role: m.sender === 'user' ? 'user' as const : 'model' as const,
            parts: [{ text: m.text || '' }]
          }))
          .filter(m => m.parts[0].text);

        const validHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
        for (const msg of rawHistory) {
          if (validHistory.length === 0) {
            if (msg.role === 'user') validHistory.push(msg);
          } else {
            if (validHistory[validHistory.length - 1].role !== msg.role) {
              validHistory.push(msg);
            } else {
              validHistory[validHistory.length - 1].parts[0].text += '\n\n' + msg.parts[0].text;
            }
          }
        }

        let finalHistory = validHistory.slice(-10);
        if (finalHistory.length > 0 && finalHistory[0].role === 'model') {
          finalHistory.shift();
        }

        const chat = model.startChat({ history: finalHistory });
        const result = await chat.sendMessageStream(text);

        let accumulatedText = '';
        for await (const chunk of result.stream) {
          accumulatedText += chunk.text();
          setMessages(prev =>
            prev.map(m => m.id === agentResponse.id ? { ...m, text: accumulatedText } : m)
          );
        }

        // Success!
        setMessages(prev =>
          prev.map(m => m.id === agentResponse.id ? { ...m, status: 'delivered' } : m)
        );
        break; // Break the retry loop
        
      } catch (err: any) {
        const errorMessage = err.message || '';
        
        // Check for Quota Exceeded (429)
        const isQuotaError = errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota');
        
        const isRetryable =
          isQuotaError ||
          errorMessage.includes('Failed to parse stream') ||
          errorMessage.includes('503') ||
          errorMessage.includes('overloaded');

        if (isRetryable && attempt < MAX_RETRIES - 1) {
          if (isQuotaError && keys.length > 1) {
            // ROTATE KEY
            keyIndexRef.current = (keyIndexRef.current + 1) % keys.length;
            setMessages(prev =>
              prev.map(m =>
                m.id === agentResponse.id
                  ? { ...m, text: `*Quota exceeded. Switching to API Key #${keyIndexRef.current + 1}...*` }
                  : m
              )
            );
            // Don't delay on quota switch, try next key immediately
            continue; 
          }

          // Standard transient error delay
          const delay = Math.pow(2, attempt) * 1000;
          setMessages(prev =>
            prev.map(m =>
              m.id === agentResponse.id
                ? { ...m, text: `*Network error. Retrying... (attempt ${attempt + 2}/${MAX_RETRIES})*` }
                : m
            )
          );
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // Final failure
        setMessages(prev =>
          prev.map(m =>
            m.id === agentResponse.id
              ? { ...m, text: `**Error:** ${errorMessage || 'Failed to call Gemini'}`, sender: 'system', status: 'delivered' }
              : m
          )
        );
        break;
      }
    }

    setIsStreaming(false);
    return true;
  }, [apiKey, messages, setMessages]);

  return { sendToGemini, isStreaming };
}
