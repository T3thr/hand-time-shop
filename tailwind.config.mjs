// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core colors
        'background': 'var(--background)',
        'foreground': 'var(--foreground)',
        'background-secondary': 'var(--background-secondary)',
        'container': 'var(--container)',
        
        // Brand colors
        'primary': 'var(--primary)',
        'primary-light': 'var(--primary-light)',
        'primary-dark': 'var(--primary-dark)',
        'secondary': 'var(--secondary)',
        
        // UI Elements
        'surface-card': 'var(--surface-card)',
        'surface-dropdown': 'var(--surface-dropdown)',
        'surface-tooltip': 'var(--surface-tooltip)',
        
        // Text colors
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'text-inverted': 'var(--text-inverted)',
        
        // Interactive states
        'interactive-primary': 'var(--interactive-primary)',
        'interactive-hover': 'var(--interactive-hover)',
        'interactive-muted': 'var(--interactive-muted)',
        
        // Feedback colors
        'success': 'var(--success)',
        'error': 'var(--error)',
        'warning': 'var(--warning)',
        'info': 'var(--info)',
        
        // Borders
        'border-primary': 'var(--border-primary)',
        'border-secondary': 'var(--border-secondary)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
      },
    },
  },
  plugins: [],
};