import type { ChatTheme } from '../../index';

interface ThemeControlsProps {
  theme: ChatTheme | { [key: string]: string };
  setTheme: React.Dispatch<React.SetStateAction<ChatTheme | { [key: string]: string }>>;
}

export const ThemeControls = ({ theme, setTheme }: ThemeControlsProps) => (
  <div className="dev-controls-group">
    <span className="dev-section-label">Theme</span>
    <select
      aria-label="Theme selector"
      title="Theme selector"
      className="dev-select"
      value={typeof theme === 'string' ? theme : 'custom'}
      onChange={(e) => {
        if (e.target.value === 'custom') {
          setTheme({
            '--c-primary': '#ef4444',
            '--c-primary-hover': '#dc2626',
            '--c-bg': '#fef2f2',
            '--c-surface': '#fee2e2',
            '--c-text-main': '#7f1d1d',
            '--c-text-muted': '#b91c1c',
          });
        } else {
          setTheme(e.target.value as ChatTheme);
        }
      }}
    >
      <option value="dark">Dark</option>
      <option value="light">Light</option>
      <option value="custom">Crimson</option>
    </select>
    <button
      className="dev-btn primary"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      Switch {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  </div>
);
