(() => {
  const key = 'listennotes-changelog-color-scheme';
  const root = document.documentElement;
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = null;
  try {
    const saved = localStorage.getItem(key);
    if (saved === 'light' || saved === 'dark') preference = saved;
  } catch {
    // Sandboxed previews and browsers blocking storage still support toggling.
  }

  function applyTheme() {
    const dark = (preference ?? (systemTheme.matches ? 'dark' : 'light')) === 'dark';
    root.dataset.theme = dark ? 'dark' : 'light';
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.setAttribute('aria-pressed', String(dark));
      button.title = dark ? 'Switch to day mode' : 'Switch to night mode';
    });
  }

  applyTheme();
  systemTheme.addEventListener('change', () => {
    if (preference === null) applyTheme();
  });
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.addEventListener('click', () => {
        preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
        try {
          localStorage.setItem(key, preference);
        } catch {
          // Keep the chosen mode for this page when storage is unavailable.
        }
        applyTheme();
      });
    });
  }, {once: true});
})();
