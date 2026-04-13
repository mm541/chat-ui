import type { ChatMessage } from '../index';

export const GEMINI_MODELS = [
  { id: 'gemini-3.1-flash-lite-preview', label: 'Gemini 3.1 Flash Lite Preview' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  { id: 'gemini-2.0-flash-lite-preview-02-05', label: 'Gemini 2.0 Flash Lite' },
  { id: 'gemini-2.0-pro-exp-02-05', label: 'Gemini 2.0 Pro Experimental' },
  { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
] as const;

export type GeminiModelId = typeof GEMINI_MODELS[number]['id'];

export const initialMessages: ChatMessage[] = [
  {
    id: `init-1`,
    text: `Hello! I am connected to the **Gemini 3.1 Flash Lite Preview** model. Send a message to chat with me!`,
    sender: 'agent',
    timestamp: new Date(),
    status: 'delivered'
  }
];

export const largeStreamContent = `# Comprehensive Guide to React Performance

## 1. Understanding Re-renders

React re-renders a component when its **state** or **props** change. This is the fundamental mental model:

\`\`\`tsx
function Counter() {
  const [count, setCount] = useState(0);
  
  // This entire function re-runs on every state change
  console.log('Render!', count);
  
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Clicked {count} times
    </button>
  );
}
\`\`\`

> **Key Insight:** A parent re-render causes ALL children to re-render, even if their props haven't changed.

## 2. Memoization Strategies

| Technique | Use Case | Gotcha |
|-----------|----------|--------|
| \`React.memo\` | Prevent child re-renders | Only shallow-compares props |
| \`useMemo\` | Expensive computations | Don't overuse — has memory cost |
| \`useCallback\` | Stable function references | Only helps with memoized children |

### Example: Proper \`useMemo\` Usage

\`\`\`tsx
const sortedItems = useMemo(() => {
  return items
    .filter(item => item.active)
    .sort((a, b) => a.priority - b.priority)
    .map(item => ({
      ...item,
      label: formatLabel(item.name)
    }));
}, [items]);
\`\`\`

## 3. Virtualization

For long lists (1000+ items), **never** render everything:

\`\`\`tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }) {
  const parentRef = useRef(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(row => (
          <div key={row.key}>
            {items[row.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
\`\`\`

## 4. Code Splitting

- Use \`React.lazy()\` for route-level splitting
- Use \`dynamic import()\` for heavy libraries
- Preload critical chunks with \`<link rel="prefetch">\`

## 5. Key Takeaways

1. **Measure first** — use React DevTools Profiler
2. **Memoize wisely** — not everything needs \`useMemo\`
3. **Virtualize lists** — DOM nodes are expensive
4. **Split bundles** — load code on demand
5. **Avoid layout thrashing** — batch DOM reads/writes

---

*This guide covers the essentials. For deep dives, check the [React docs](https://react.dev) and [web.dev](https://web.dev) performance guides.*`;
