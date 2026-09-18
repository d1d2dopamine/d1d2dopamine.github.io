(() => {
  const BASE_URL = 'https://d1d2dopamine.is-a.dev';

  const routes = {
    'index.html': {
      lang: 'en', page: 'home', title: 'd1d2dopamine — software and open research',
      description: 'Independent software, research tools, and reproducible open-data projects by d1d2dopamine.',
      ogTitle: 'd1d2dopamine', ogDescription: 'Independent software and open research.',
      path: '/', en: '/', ru: '/ru.html', locale: 'en_US', alternateLocale: 'ru_RU',
      nav: [['Home', 'index.html'], ['About', 'about.html'], ['Projects', 'projects.html']],
      language: ['RU', 'ru.html', 'ru'], navLabel: 'Primary navigation', skipLabel: 'Skip to content', emailLabel: 'Email'
    },
    'about.html': {
      lang: 'en', page: 'about', title: 'About — d1d2dopamine',
      description: 'About d1d2dopamine: independent work in software, neuroscience, psychology, and reproducible open research.',
      ogTitle: 'About — d1d2dopamine', ogDescription: 'Independent work in software, neuroscience, psychology, and reproducible open research.',
      path: '/about.html', en: '/about.html', ru: '/about-ru.html', locale: 'en_US', alternateLocale: 'ru_RU',
      nav: [['Home', 'index.html'], ['About', 'about.html'], ['Projects', 'projects.html']],
      language: ['RU', 'about-ru.html', 'ru'], navLabel: 'Primary navigation', skipLabel: 'Skip to content', emailLabel: 'Email'
    },
    'projects.html': {
      lang: 'en', page: 'projects', title: 'Projects — d1d2dopamine',
      description: 'Selected software, research tools, and open-data projects by d1d2dopamine.',
      ogTitle: 'Projects — d1d2dopamine', ogDescription: 'Selected software, research tools, and open-data projects by d1d2dopamine.',
      path: '/projects.html', en: '/projects.html', ru: '/projects-ru.html', locale: 'en_US', alternateLocale: 'ru_RU',
      nav: [['Home', 'index.html'], ['About', 'about.html'], ['Projects', 'projects.html']],
      language: ['RU', 'projects-ru.html', 'ru'], navLabel: 'Primary navigation', skipLabel: 'Skip to content', emailLabel: 'Email'
    },
    'ru.html': {
      lang: 'ru', page: 'home', title: 'd1d2dopamine — разработка и открытые исследования',
      description: 'Независимые программы, исследовательские инструменты и воспроизводимые проекты d1d2dopamine.',
      ogTitle: 'd1d2dopamine', ogDescription: 'Независимая разработка и открытые исследования.',
      path: '/ru.html', en: '/', ru: '/ru.html', locale: 'ru_RU', alternateLocale: 'en_US',
      nav: [['Главная', 'ru.html'], ['Обо мне', 'about-ru.html'], ['Проекты', 'projects-ru.html']],
      language: ['EN', 'index.html', 'en'], navLabel: 'Основная навигация', skipLabel: 'К содержанию', emailLabel: 'Почта'
    },
    'about-ru.html': {
      lang: 'ru', page: 'about', title: 'Обо мне — d1d2dopamine',
      description: 'О d1d2dopamine: независимая разработка, нейронаука, психология и воспроизводимые открытые исследования.',
      ogTitle: 'Обо мне — d1d2dopamine', ogDescription: 'Независимая разработка, нейронаука, психология и воспроизводимые открытые исследования.',
      path: '/about-ru.html', en: '/about.html', ru: '/about-ru.html', locale: 'ru_RU', alternateLocale: 'en_US',
      nav: [['Главная', 'ru.html'], ['Обо мне', 'about-ru.html'], ['Проекты', 'projects-ru.html']],
      language: ['EN', 'about.html', 'en'], navLabel: 'Основная навигация', skipLabel: 'К содержанию', emailLabel: 'Почта'
    },
    'projects-ru.html': {
      lang: 'ru', page: 'projects', title: 'Проекты — d1d2dopamine',
      description: 'Избранные программы, исследовательские инструменты и открытые анализы d1d2dopamine.',
      ogTitle: 'Проекты — d1d2dopamine', ogDescription: 'Избранные программы, исследовательские инструменты и открытые анализы d1d2dopamine.',
      path: '/projects-ru.html', en: '/projects.html', ru: '/projects-ru.html', locale: 'ru_RU', alternateLocale: 'en_US',
      nav: [['Главная', 'ru.html'], ['Обо мне', 'about-ru.html'], ['Проекты', 'projects-ru.html']],
      language: ['EN', 'projects.html', 'en'], navLabel: 'Основная навигация', skipLabel: 'К содержанию', emailLabel: 'Почта'
    }
  };

  function routeName(input = window.location.href) {
    const pathname = new URL(input, window.location.href).pathname;
    return pathname.split('/').filter(Boolean).pop() || 'index.html';
  }

  function setMeta(selector, attribute, value) {
    const element = document.head.querySelector(selector);
    if (element) element.setAttribute(attribute, value);
  }

  function updateMetadata(config) {
    const canonical = `${BASE_URL}${config.path}`;
    const image = `${BASE_URL}/assets/og-image.png`;

    document.title = config.title;
    setMeta('meta[name="description"]', 'content', config.description);
    setMeta('link[rel="canonical"]', 'href', canonical);
    setMeta('link[rel="alternate"][hreflang="en"]', 'href', `${BASE_URL}${config.en}`);
    setMeta('link[rel="alternate"][hreflang="ru"]', 'href', `${BASE_URL}${config.ru}`);
    setMeta('link[rel="alternate"][hreflang="x-default"]', 'href', `${BASE_URL}${config.en}`);
    setMeta('meta[property="og:title"]', 'content', config.ogTitle);
    setMeta('meta[property="og:description"]', 'content', config.ogDescription);
    setMeta('meta[property="og:url"]', 'content', canonical);
    setMeta('meta[property="og:image"]', 'content', image);
    setMeta('meta[property="og:locale"]', 'content', config.locale);
    setMeta('meta[property="og:locale:alternate"]', 'content', config.alternateLocale);
    setMeta('meta[name="twitter:title"]', 'content', config.ogTitle);
    setMeta('meta[name="twitter:description"]', 'content', config.ogDescription);
    setMeta('meta[name="twitter:image"]', 'content', image);
  }

  const scrollPositions = new Map();
  let currentRoute = routes[routeName()] ? routeName() : 'index.html';
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  function render(route, { updateHistory = false, restoreScroll = false } = {}) {
    const config = routes[route];
    if (!config) return;

    if (route !== currentRoute) scrollPositions.set(currentRoute, window.scrollY);

    document.querySelectorAll('.site-view').forEach((view) => {
      const active = view.dataset.route === route;
      view.hidden = !active;
      if (active) view.removeAttribute('aria-hidden');
      else view.setAttribute('aria-hidden', 'true');
    });

    document.documentElement.lang = config.lang;
    document.body.className = config.page === 'home' ? 'home' : 'page';
    document.body.dataset.current = config.page;

    const nav = document.querySelector('.primary-nav');
    if (nav) nav.setAttribute('aria-label', config.navLabel);

    const navLinks = document.querySelectorAll('.primary-nav [data-page]');
    config.nav.forEach(([label, href], index) => {
      const link = navLinks[index];
      if (!link) return;
      link.textContent = label;
      link.href = href;
      if (link.dataset.page === config.page) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    const skipLink = document.querySelector('.skip-link');
    if (skipLink) skipLink.textContent = config.skipLabel;

    const language = document.querySelector('.social-nav .lang');
    if (language) {
      language.textContent = config.language[0];
      language.href = config.language[1];
      language.hreflang = config.language[2];
    }

    const emailIcon = document.querySelector('.social-nav .icon-link[href^="mailto:"]');
    if (emailIcon) {
      emailIcon.setAttribute('aria-label', config.emailLabel);
      emailIcon.title = config.emailLabel;
    }

    updateMetadata(config);

    if (updateHistory) history.pushState({ route }, '', route);
    currentRoute = route;

    const targetY = restoreScroll ? (scrollPositions.get(route) || 0) : 0;
    window.scrollTo(0, targetY);
  }

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return;

    const targetRoute = routeName(url.href);
    if (!routes[targetRoute]) return;

    event.preventDefault();
    render(targetRoute, { updateHistory: true, restoreScroll: false });
  });

  window.addEventListener('popstate', () => {
    const targetRoute = routes[routeName()] ? routeName() : 'index.html';
    render(targetRoute, { restoreScroll: true });
  });

  render(currentRoute);
})();
