(() => {
  'use strict';

  const filterBar = document.querySelector('[data-filter-bar]');
  if (filterBar) {
    filterBar.hidden = false;
    const buttons = [...filterBar.querySelectorAll('[data-filter]')];
    const items = [...document.querySelectorAll('[data-category]')];
    const applyFilter = category => {
      for (const button of buttons) {
        button.setAttribute('aria-pressed', String(button.dataset.filter === category));
      }
      for (const item of items) {
        item.hidden = category !== 'all' && item.dataset.category !== category;
      }
    };
    filterBar.addEventListener('click', event => {
      const button = event.target.closest('[data-filter]');
      if (!button) return;
      applyFilter(button.dataset.filter);
    });
  }

  if ('serviceWorker' in navigator && location.protocol !== 'file:' && window.isSecureContext) {
    const register = () => {
      navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).catch(() => {});
    };
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
  }
})();
