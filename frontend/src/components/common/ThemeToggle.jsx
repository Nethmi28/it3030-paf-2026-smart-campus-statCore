import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '8px',
        borderRadius: '999px',
        border: '1px solid var(--border-color)',
        background: 'var(--bg-card)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        transition: 'background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease'
      }}
    >
      <span
        style={{
          position: 'relative',
          width: '44px',
          height: '24px',
          borderRadius: '999px',
          background: isDark ? 'var(--accent)' : 'var(--bg-alt)',
          transition: 'background-color 0.25s ease'
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '3px',
            left: isDark ? '23px' : '3px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: isDark ? 'var(--bg-color)' : 'var(--bg-card)',
            color: isDark ? 'var(--accent)' : 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.18)',
            transition: 'left 0.25s ease, background-color 0.25s ease, color 0.25s ease'
          }}
        >
          {isDark ? <Moon size={11} /> : <Sun size={11} />}
        </span>
      </span>
    </button>
  );
}
