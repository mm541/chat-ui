import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { Check, Copy } from 'lucide-react';

export interface MarkdownTextProps {
  children: string;
  className?: string;
  /** Optional rehype plugins (e.g., rehypeHighlight for syntax coloring). */
  rehypePlugins?: any[];
}

/** Small component for the copy button in code blocks. */
const CodeCopyButton: React.FC<{ code: string }> = ({ code }) => {
  const { isCopied, copy } = useCopyToClipboard(2000);

  return (
    <button
      className="chat-ui-md-code-copy"
      onClick={() => copy(code)}
      aria-label={isCopied ? 'Copied!' : 'Copy code'}
      title={isCopied ? 'Copied!' : 'Copy code'}
    >
      {isCopied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
};

/** Extract text content from React children recursively. */
const extractText = (node: React.ReactNode): string => {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (React.isValidElement(node) && node.props) {
    return extractText((node.props as any).children);
  }
  return '';
};

// Stable plugin array reference to avoid re-renders
// Stable plugin array references to avoid re-renders
const defaultRemarkPlugins = [remarkGfm, remarkMath];
const defaultRehypeKatex = [rehypeKatex];

export const MarkdownText: React.FC<MarkdownTextProps> = React.memo(({ 
  children, 
  className,
  rehypePlugins = [],
}) => {
  // Memoize the components object so ReactMarkdown doesn't remount renderers.
  const components = useMemo(() => ({
    // Open links in new tab  
    a: ({ href, children: linkChildren, ...props }: any) => (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {linkChildren}
      </a>
    ),
    // Wrap code blocks with a label + copy-friendly container
    pre: ({ children: preChildren, ...props }: any) => (
      <pre className="chat-ui-md-pre" {...props}>
        {preChildren}
      </pre>
    ),
    code: ({ className: codeClassName, children: codeChildren, ...props }: any) => {
      // Detect if this is a fenced code block
      const isBlock = codeClassName?.startsWith('language-') || codeClassName?.includes('hljs');
      if (isBlock) {
        const lang = codeClassName?.replace('language-', '').replace('hljs ', '') || '';
        const codeText = extractText(codeChildren);
        return (
          <div className="chat-ui-md-code-block">
            <div className="chat-ui-md-code-header">
              {lang && <span className="chat-ui-md-code-lang">{lang}</span>}
              <CodeCopyButton code={codeText} />
            </div>
            <code className={codeClassName} {...props}>{codeChildren}</code>
          </div>
        );
      }
      return <code className="chat-ui-md-inline-code" {...props}>{codeChildren}</code>;
    },
    // Wrap tables in a scrollable container
    table: ({ children: tableChildren, ...props }: any) => (
      <div className="chat-ui-md-table-wrapper">
        <table {...props}>{tableChildren}</table>
      </div>
    ),
  }), []);

  return (
    <div className={`chat-ui-md ${className || ''}`}>
      <ReactMarkdown
        remarkPlugins={defaultRemarkPlugins}
        rehypePlugins={[...defaultRehypeKatex, ...rehypePlugins]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
});

MarkdownText.displayName = 'MarkdownText';
