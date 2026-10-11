(() => {
  'use strict';
  const data = document.getElementById('route-data');
  if (!data) return;
  const routes = JSON.parse(data.textContent);
  const views = new Map([...document.querySelectorAll('[data-route]')].map(view => [view.dataset.route, view]));
  const pages = {en: {home: 'index.html', about: 'about.html', projects: 'projects.html'}, ru: {home: 'ru.html', about: 'about-ru.html', projects: 'projects-ru.html'}};
  const labels = {en: {home: 'Home', about: 'About', projects: 'Projects', nav: 'Primary navigation', skip: 'Skip to content', email: 'Email'}, ru: {home: 'Главная', about: 'Обо мне', projects: 'Проекты', nav: 'Основная навигация', skip: 'К содержанию', email: 'Почта'}};
  let current = [...views].find(([,view]) => !view.hidden)?.[0];
  const startURL = new URL(location.href);
  const baseURL = new URL('./', startURL);

  function routeFromURL(url) {
    if (url.protocol !== baseURL.protocol || url.host !== baseURL.host || !url.pathname.startsWith(baseURL.pathname)) return null;
    const name = decodeURIComponent(url.pathname.slice(baseURL.pathname.length)) || 'index.html';
    if (name.includes('/') || url.search) return null;
    // file:// browsers may restrict changing a file path with pushState.
    if (url.protocol === 'file:' && url.hash.startsWith('#view=')) {
      const localRoute = url.hash.slice(6);
      return routes[localRoute] ? localRoute : null;
    }
    return routes[name] ? name : null;
  }

  function show(route, {focus = false, scroll = null} = {}) {
    if (!routes[route] || !views.has(route)) return;
    const previous = routes[current];
    const sameSection = previous?.page === routes[route].page;
    const oldView = views.get(current);
    const progress = oldView ? Math.max(0, window.scrollY - oldView.offsetTop) / Math.max(1, oldView.offsetHeight) : 0;
    current = route;
    const info = routes[route];
    for (const [name, view] of views) view.hidden = name !== route;
    const view = views.get(route);
    document.documentElement.lang = info.lang;
    document.body.className = info.page === 'home' ? 'home' : 'page';
    document.body.dataset.current = info.page;
    document.title = info.title;
    for (const [key, value] of Object.entries(info.meta)) {
      const colon = key.indexOf(':');
      const attribute = key.slice(0, colon);
      const name = key.slice(colon + 1);
      const node = document.head.querySelector(`meta[${attribute}="${name}"]`);
      if (node) node.content = value;
    }
    document.head.querySelector('link[rel="canonical"]').href = info.canonical;
    for (const node of document.head.querySelectorAll('link[rel="alternate"]')) node.href = info.alternate[node.hreflang];
    const copy = labels[info.lang];
    document.querySelector('.primary-nav').setAttribute('aria-label', copy.nav);
    for (const link of document.querySelectorAll('.primary-nav [data-page]')) {
      link.textContent = copy[link.dataset.page];
      link.setAttribute('href', pages[info.lang][link.dataset.page]);
      if (link.dataset.page === info.page) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    const other = info.lang === 'en' ? 'ru' : 'en';
    const lang = document.querySelector('.lang');
    lang.textContent = other.toUpperCase();
    lang.hreflang = other;
    lang.setAttribute('href', pages[other][info.page]);
    document.querySelector('.skip-link').textContent = copy.skip;
    const email = document.querySelector('.social-nav a[href^="mailto:"]');
    email.title = copy.email;
    email.setAttribute('aria-label', copy.email);
    if (focus) {
      view.setAttribute('tabindex', '-1');
      view.focus({preventScroll: true});
    }
    if (scroll !== null) window.scrollTo(0, scroll);
    else if (focus) window.scrollTo(0, sameSection && progress > 0 ? view.offsetTop + progress * view.offsetHeight : 0);
  }

  function saveScroll() {
    try { history.replaceState({...history.state, route: current, scroll: window.scrollY}, '', location.href); } catch (_) { /* file preview can restrict history */ }
  }
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.getAttribute('href'), location.href);
    if (url.hash && !url.hash.startsWith('#view=')) return;
    const route = routeFromURL(url);
    if (!route) return;
    event.preventDefault();
    if (route === current) return;
    saveScroll();
    try { history.pushState({route, scroll: null}, '', url); }
    catch (_) {
      const fallback = new URL(location.href);
      fallback.hash = `view=${route}`;
      try { history.pushState({route, scroll: null}, '', fallback); }
      catch (_) { location.hash = fallback.hash; }
    }
    show(route, {focus: true});
  });
  window.addEventListener('popstate', event => {
    const route = event.state?.route || routeFromURL(new URL(location.href));
    if (route && route !== current) show(route, {focus: true, scroll: event.state?.scroll ?? 0});
  });
  const initial = routeFromURL(startURL) || current;
  show(initial);
  saveScroll();
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  // Optional persistent cache. In-document switching also works from file://.
  if ('serviceWorker' in navigator && location.protocol !== 'file:' && window.isSecureContext) {
    const register = () => navigator.serviceWorker.register(new URL('sw.js', baseURL), {scope: baseURL.href, updateViaCache: 'none'}).catch(() => {});
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, {once: true});
  }
})();
