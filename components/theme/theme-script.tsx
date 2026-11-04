"use client";

// Injected before first paint to prevent theme flash
export function ThemeScript() {
  const script = `
    (function() {
      try {
        var stored = localStorage.getItem('zumi-theme');
        var theme = stored || 'dark';
        if (theme === 'system') {
          theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        document.documentElement.setAttribute('data-theme', theme);
      } catch(e) {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
