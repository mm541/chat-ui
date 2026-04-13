
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MarkdownText } from '../components/Markdown/MarkdownText';

describe('MarkdownText', () => {
  it('renders plain text', () => {
    render(<MarkdownText>Hello world</MarkdownText>);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders bold text', () => {
    render(<MarkdownText>This is **bold** text</MarkdownText>);
    const bold = screen.getByText('bold');
    expect(bold.tagName).toBe('STRONG');
  });

  it('renders italic text', () => {
    render(<MarkdownText>This is *italic* text</MarkdownText>);
    const italic = screen.getByText('italic');
    expect(italic.tagName).toBe('EM');
  });

  it('renders inline code', () => {
    render(<MarkdownText>Use `console.log` here</MarkdownText>);
    const code = screen.getByText('console.log');
    expect(code.tagName).toBe('CODE');
    expect(code).toHaveClass('chat-ui-md-inline-code');
  });

  it('renders fenced code blocks', () => {
    const md = '```js\nconst x = 1;\n```';
    const { container } = render(<MarkdownText>{md}</MarkdownText>);
    const codeBlock = container.querySelector('.chat-ui-md-code-block');
    expect(codeBlock).toBeInTheDocument();
  });

  it('renders code block language label', () => {
    const md = '```python\nprint("hi")\n```';
    const { container } = render(<MarkdownText>{md}</MarkdownText>);
    const label = container.querySelector('.chat-ui-md-code-lang');
    expect(label).toBeInTheDocument();
    expect(label?.textContent).toBe('python');
  });

  it('renders unordered lists', () => {
    const md = '- First\n- Second\n- Third';
    const { container } = render(<MarkdownText>{md}</MarkdownText>);
    const listItems = container.querySelectorAll('li');
    expect(listItems).toHaveLength(3);
  });

  it('renders links with target=_blank', () => {
    render(<MarkdownText>[Click here](https://example.com)</MarkdownText>);
    const link = screen.getByText('Click here');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders blockquotes', () => {
    const { container } = render(<MarkdownText>&gt; Important note</MarkdownText>);
    const blockquote = container.querySelector('blockquote');
    expect(blockquote).toBeInTheDocument();
  });

  it('renders strikethrough (GFM)', () => {
    render(<MarkdownText>This is ~~deleted~~ text</MarkdownText>);
    const del = screen.getByText('deleted');
    expect(del.tagName).toBe('DEL');
  });

  it('renders tables (GFM)', () => {
    const md = '| Name | Age |\n|------|-----|\n| Alice | 30 |';
    const { container } = render(<MarkdownText>{md}</MarkdownText>);
    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
    const headers = container.querySelectorAll('th');
    expect(headers).toHaveLength(2);
  });

  it('wraps content with chat-ui-md class', () => {
    const { container } = render(<MarkdownText>test</MarkdownText>);
    expect(container.firstChild).toHaveClass('chat-ui-md');
  });
});
