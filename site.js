(() => {
  const STORAGE_KEY = 'd1d2dopamine-background-time';
  const routes = {
    'index.html': {
      lang: 'en', page: 'home', title: 'd1d2dopamine — software and open research',
      nav: [['Home', 'index.html'], ['About', 'about.html'], ['Projects', 'projects.html']],
      language: ['RU', 'ru.html']
    },
    'about.html': {
      lang: 'en', page: 'about', title: 'About — d1d2dopamine',
      nav: [['Home', 'index.html'], ['About', 'about.html'], ['Projects', 'projects.html']],
      language: ['RU', 'about-ru.html']
    },
    'projects.html': {
      lang: 'en', page: 'projects', title: 'Projects — d1d2dopamine',
      nav: [['Home', 'index.html'], ['About', 'about.html'], ['Projects', 'projects.html']],
      language: ['RU', 'projects-ru.html']
    },
    'ru.html': {
      lang: 'ru', page: 'home', title: 'd1d2dopamine — разработка и открытые исследования',
      nav: [['Главная', 'ru.html'], ['Обо мне', 'about-ru.html'], ['Проекты', 'projects-ru.html']],
      language: ['EN', 'index.html']
    },
    'about-ru.html': {
      lang: 'ru', page: 'about', title: 'Обо мне — d1d2dopamine',
      nav: [['Главная', 'ru.html'], ['Обо мне', 'about-ru.html'], ['Проекты', 'projects-ru.html']],
      language: ['EN', 'about.html']
    },
    'projects-ru.html': {
      lang: 'ru', page: 'projects', title: 'Проекты — d1d2dopamine',
      nav: [['Главная', 'ru.html'], ['Обо мне', 'about-ru.html'], ['Проекты', 'projects-ru.html']],
      language: ['EN', 'projects.html']
    }
  };

  const video = document.querySelector('.background-video');

  function routeName(input = window.location.href) {
    const pathname = new URL(input, window.location.href).pathname;
    return pathname.split('/').filter(Boolean).pop() || 'index.html';
  }

  function restoreVideoPosition() {
    if (!video) return;
    const saved = Number(sessionStorage.getItem(STORAGE_KEY));
    if (Number.isFinite(saved) && saved > 0 && video.duration) video.currentTime = saved % video.duration;
  }

  if (video) {
    if (video.readyState >= 1) restoreVideoPosition();
    else video.addEventListener('loadedmetadata', restoreVideoPosition, { once: true });
    video.addEventListener('timeupdate', () => sessionStorage.setItem(STORAGE_KEY, String(video.currentTime)));
    window.addEventListener('pagehide', () => sessionStorage.setItem(STORAGE_KEY, String(video.currentTime)));
  }

  function render(route, updateHistory = false) {
    const config = routes[route];
    if (!config) return;

    document.querySelectorAll('.site-view').forEach((view) => {
      const active = view.dataset.route === route;
      view.hidden = !active;
      if (active) view.removeAttribute('aria-hidden');
      else view.setAttribute('aria-hidden', 'true');
    });

    document.documentElement.lang = config.lang;
    document.body.className = config.page === 'home' ? 'home' : 'page';
    document.body.dataset.current = config.page;
    document.title = config.title;

    const navLinks = document.querySelectorAll('.primary-nav [data-page]');
    config.nav.forEach(([label, href], index) => {
      const link = navLinks[index];
      if (!link) return;
      link.textContent = label;
      link.href = href;
      if (link.dataset.page === config.page) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    const language = document.querySelector('.social-nav .lang');
    if (language) {
      language.textContent = config.language[0];
      language.href = config.language[1];
    }

    if (updateHistory) {
      try { history.pushState({ route }, '', route); } catch (_) {}
    }
    window.scrollTo(0, 0);
  }

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
    const targetRoute = routeName(link.href);
    if (!routes[targetRoute]) return;
    event.preventDefault();
    render(targetRoute, true);
  });

  for (const eventName of ['copy', 'cut', 'contextmenu', 'dragstart']) {
    document.addEventListener(eventName, (event) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest('input, textarea')) event.preventDefault();
    });
  }

  window.addEventListener('popstate', () => render(routeName(), false));
  render(routes[routeName()] ? routeName() : 'index.html', false);
})();
