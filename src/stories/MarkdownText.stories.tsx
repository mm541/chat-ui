import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { MarkdownText } from '../components/Markdown';

const meta: Meta<typeof MarkdownText> = {
  title: 'Components/MarkdownText',
  component: MarkdownText,
  decorators: [(Story) => (
    <div 
      ref={(el) => {
        if (el) {
          el.style.padding = '24px';
          el.style.maxWidth = '600px';
          el.style.background = 'var(--c-bg, #09090b)';
          el.style.color = 'var(--c-text-main, #fafafa)';
        }
      }}
    >
      <Story />
    </div>
  )],
};

export default meta;
type Story = StoryObj<typeof MarkdownText>;

export const BasicFormatting: Story = {
  args: {
    children: `# Heading 1
## Heading 2

This is **bold**, *italic*, and ~~strikethrough~~.

- Unordered item 1
- Unordered item 2

1. Ordered item
2. Another item

> A blockquote with important information.

[A link](https://example.com)
`,
  },
};

export const CodeBlocks: Story = {
  args: {
    children: `Here is some \`inline code\` in a sentence.

\`\`\`javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));
\`\`\`

And a Python example:

\`\`\`python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)
\`\`\`
`,
  },
};

export const Tables: Story = {
  args: {
    children: `| Feature | Status | Notes |
|---------|--------|-------|
| Markdown | ✅ | Full GFM support |
| Streaming | ✅ | Batched re-parsing |
| Reactions | ✅ | Customizable |
| Grouping | ✅ | Asymmetric radii |
`,
  },
};

export const ComplexContent: Story = {
  args: {
    children: `## API Response

The endpoint returns the following structure:

\`\`\`json
{
  "status": "success",
  "data": {
    "users": [
      { "id": 1, "name": "Alice" },
      { "id": 2, "name": "Bob" }
    ]
  }
}
\`\`\`

### Key Points:
- The \`status\` field is always present
- \`data\` contains the response payload
- Arrays are **zero-indexed**

> **Note:** Rate limiting applies at 100 req/min.
`,
  },
};

export const MathematicalFormulas: Story = {
  args: {
    children: `## Physics is Fun
    
Lift is calculated by the following equation:

$$L = \\frac{1}{2} \\rho v^2 S C_L$$

Where:
- $\\rho$ is the air density
- $v$ is the velocity
- $S$ is the surface area
- $C_L$ is the lift coefficient

And the classic:
$E = mc^2$
`,
  },
};

