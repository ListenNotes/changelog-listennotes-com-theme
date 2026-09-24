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
    initImagePreview();
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

  function initImagePreview() {
    const description = document.querySelector('[data-item-description]');
    const dialog = document.querySelector('#image-preview');
    if (!description || !dialog || !dialog.showModal) return;
    const fullImage = dialog.querySelector('[data-image-full]');
    const download = dialog.querySelector('[data-image-download]');
    const status = dialog.querySelector('[data-image-status]');
    const original = dialog.querySelector('[data-image-original]');
    let trigger = null;
    let controller = null;

    description.querySelectorAll('img').forEach(image => {
      let link = image.closest('a');
      if (!link) {
        link = document.createElement('a');
        link.href = image.currentSrc || image.src;
        image.replaceWith(link);
        link.append(image);
      }
      link.dataset.imagePreview = '';
      link.setAttribute('aria-haspopup', 'dialog');
      link.setAttribute('aria-controls', dialog.id);
      if (!link.textContent.trim()) {
        link.setAttribute('aria-label', image.alt ? `Preview image: ${image.alt}` : 'Preview image');
      }
    });

    description.addEventListener('click', event => {
      const link = event.target.closest('[data-image-preview]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const image = event.target.closest('img') || link.querySelector('img');
      // An image link may point to a full-size original instead of its thumbnail.
      const linkedUrl = new URL(link.href, document.baseURI);
      const source = /^https?:$/.test(linkedUrl.protocol) && /\.(avif|gif|jpe?g|png|svg|webp)$/i.test(linkedUrl.pathname)
        ? linkedUrl.href : image.currentSrc || image.src;
      if (!source) return;
      event.preventDefault();
      trigger = link;
      fullImage.alt = image.alt;
      status.textContent = '';
      original.hidden = true;
      original.href = source;
      fullImage.src = source;
      root.classList.add('image-preview-open');
      dialog.showModal();
    });

    dialog.querySelector('[data-image-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      controller?.abort();
      controller = null;
      download.disabled = false;
      fullImage.removeAttribute('src');
      root.classList.remove('image-preview-open');
      trigger?.focus({preventScroll: true});
    });
    fullImage.addEventListener('error', () => {
      if (!dialog.open) return;
      status.textContent = 'The image could not be loaded. ';
      original.hidden = false;
    });

    download.addEventListener('click', async () => {
      const request = new AbortController();
      controller = request;
      download.disabled = true;
      status.textContent = 'Preparing download…';
      original.hidden = true;
      try {
        // Blob URLs allow downloading CDN images when their host permits CORS.
        const response = await fetch(original.href, {signal: request.signal, credentials: 'omit'});
        if (!response.ok) throw new Error('Image download failed');
        const blob = await response.blob();
        if (request.signal.aborted) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const sourceUrl = new URL(original.href);
        const extension = {'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp', 'image/avif': 'avif', 'image/svg+xml': 'svg'}[blob.type];
        link.href = url;
        link.download = (/^https?:$/.test(sourceUrl.protocol) && sourceUrl.pathname.split('/').pop()) || `image${extension ? `.${extension}` : ''}`;
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 60000);
        status.textContent = 'Download started.';
      } catch {
        if (request.signal.aborted) return;
        status.textContent = 'This image host does not allow direct downloads. Open the full image to save it. ';
        original.hidden = false;
      } finally {
        if (controller === request) {
          controller = null;
          download.disabled = false;
        }
      }
    });
  }
})();
