import React, { useRef, useMemo } from 'react';
import { MarkdownText } from './MarkdownText';

export interface StreamingMarkdownTextProps {
  children: string;
  isStreaming?: boolean;
  className?: string;
  rehypePlugins?: any[];
  /** 
   * Minimum character count difference before re-parsing markdown.
   * Lower = more responsive but more CPU. Default: 12.
   */
  parseThreshold?: number;
}

/**
 * A streaming-optimized markdown renderer.
 * 
 * During streaming (isStreaming=true), it batches markdown re-parses:
 * - Only re-parses when text grows by `parseThreshold` characters
 * - Shows a raw text tail for the un-parsed portion
 * - On completion (isStreaming=false), does a final full parse
 * 
 * This avoids re-parsing the entire AST on every single token.
 */
export const StreamingMarkdownText: React.FC<StreamingMarkdownTextProps> = ({
  children,
  isStreaming = false,
  className,
  rehypePlugins,
  parseThreshold = 12,
}) => {
  const lastParsedLengthRef = useRef(0);

  // When streaming: only update the "parsed" text every N characters
  // When done: parse the full text
  const { parsedText, tailText } = useMemo(() => {
    if (!isStreaming) {
      lastParsedLengthRef.current = children.length;
      return { parsedText: children, tailText: '' };
    }

    const currentLen = children.length;
    const lastLen = lastParsedLengthRef.current;

    if (currentLen - lastLen >= parseThreshold || lastLen === 0) {
      // Find a safe split point — don't break mid-word or mid-syntax
      // Parse up to the last complete line
      const lastNewline = children.lastIndexOf('\n');
      const splitAt = lastNewline > lastLen ? lastNewline : currentLen;
      lastParsedLengthRef.current = splitAt;
      return { parsedText: children.slice(0, splitAt), tailText: children.slice(splitAt) };
    }

    // Between thresholds: keep previous parse, show new text as raw tail
    const prevParsed = lastParsedLengthRef.current;
    return { parsedText: children.slice(0, prevParsed), tailText: children.slice(prevParsed) };
  }, [children, isStreaming, parseThreshold]);

  return (
    <span className={className}>
      {parsedText && (
        <MarkdownText rehypePlugins={rehypePlugins}>{parsedText}</MarkdownText>
      )}
      {tailText && <span className="chat-ui-streaming-tail">{tailText}</span>}
    </span>
  );
};
