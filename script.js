(() => {
  const language = document.documentElement.lang === 'ru' ? 'ru' : 'en';
  const locale = language === 'ru' ? 'ru-RU' : 'en-GB';

  /* ------------------------------------------------------------------ *
   * Dynamic content
   *
   * All GitHub data comes from data/site-data.json, refreshed by a
   * scheduled GitHub Action using an authenticated token. The browser
   * never calls api.github.com: unauthenticated clients share a 60
   * requests/hour limit per IP, which the previous implementation could
   * exhaust in five page views.
   * ------------------------------------------------------------------ */

  const STALE_AFTER_DAYS = 7;

  const formatMonth = (value) => {
    if (!value) return '';
    const date = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(language === 'ru' ? 'ru-RU' : 'en-US', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(date);
  };

  const formatCommitTime = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    const clock = new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }).format(date);
    const shortDate = new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short'
    }).format(date);
    const zone = new Intl.DateTimeFormat(locale, { timeZoneName: 'short' })
      .formatToParts(date)
      .find((part) => part.type === 'timeZoneName')?.value || '';
    const full = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZoneName: 'short'
    }).format(date);
    return {
      text: language === 'ru'
        ? `${shortDate}, в ${clock} ${zone}`.trim()
        : `${shortDate}, ${clock} ${zone}`.trim(),
      full
    };
  };

  const daysSince = (value) => {
    if (!value) return Infinity;
    const date = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) return Infinity;
    return (Date.now() - date.getTime()) / 86400000;
  };

  const renderSiteData = (data) => {
    const nowText = document.querySelector('[data-now-text]');
    const nowDate = document.querySelector('[data-now-date]');
    const feed = document.querySelector('[data-latest-work]');
    const feedNote = document.querySelector('[data-feed-note]');

    if (nowText && data.now?.[language]) nowText.textContent = data.now[language];
    if (nowDate && data.now?.updated) {
      const month = formatMonth(data.now.updated);
      if (month) {
        nowDate.dateTime = data.now.updated;
        nowDate.textContent = month;
      }
    }

    const works = Array.isArray(data.latestWorks) ? data.latestWorks : [];
    if (feed && works.length) {
      const items = works.slice(0, 3).map((work) => {
        if (!work?.url || !work?.name) return null;
        const item = document.createElement('li');
        const link = document.createElement('a');
        const name = document.createElement('span');
        const commitTime = document.createElement('time');

        link.href = work.url;
        link.target = '_blank';
        link.rel = 'noreferrer';
        name.textContent = work.name;
        link.append(name);

        const formatted = formatCommitTime(work.lastCommitAt);
        if (formatted) {
          commitTime.dateTime = work.lastCommitAt;
          commitTime.textContent = formatted.text;
          commitTime.title = formatted.full;
        } else {
          commitTime.hidden = true;
        }

        item.append(link, commitTime);
        return item;
      }).filter(Boolean);

      if (items.length) feed.replaceChildren(...items);
    }

    // Never present stale cached data as a live feed.
    if (feedNote && daysSince(data.updated) > STALE_AFTER_DAYS) {
      const staleTemplate = feedNote.dataset.feedNoteStale;
      const asOf = formatMonth(data.updated);
      if (staleTemplate && asOf) feedNote.textContent = staleTemplate.replace('%s', asOf);
    }
  };

  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  const timeout = controller ? window.setTimeout(() => controller.abort(), 6000) : null;

  fetch('data/site-data.json', {
    cache: 'no-cache',
    signal: controller?.signal
  })
    .then((response) => {
      if (!response.ok) throw new Error(`site-data: ${response.status}`);
      return response.json();
    })
    .then(renderSiteData)
    .catch(() => {
      // The static HTML is a complete fallback offline or when opened as a file.
    })
    .finally(() => {
      if (timeout) window.clearTimeout(timeout);
    });

  /* ------------------------------------------------------------------ *
   * Cat easter egg
   * ------------------------------------------------------------------ */

  const SOUND_KEY = 'meow-sound';
  const soundToggle = document.querySelector('[data-sound-toggle]');

  const readPreference = () => {
    try {
      return window.localStorage.getItem(SOUND_KEY) !== 'off';
    } catch {
      return true;
    }
  };

  let soundEnabled = readPreference();

  const syncToggle = () => {
    if (!soundToggle) return;
    soundToggle.setAttribute('aria-pressed', String(soundEnabled));
    const label = soundEnabled
      ? soundToggle.dataset.labelOn
      : soundToggle.dataset.labelOff;
    if (label) {
      soundToggle.setAttribute('aria-label', label);
      soundToggle.title = label;
    }
    soundToggle.classList.toggle('is-muted', !soundEnabled);
  };

  if (soundToggle) {
    syncToggle();
    soundToggle.hidden = false;
    soundToggle.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      try {
        window.localStorage.setItem(SOUND_KEY, soundEnabled ? 'on' : 'off');
      } catch {
        // Private mode: the preference simply does not persist.
      }
      syncToggle();
    });
  }

  const desktopPointer = window.matchMedia('(min-width: 621px) and (hover: hover) and (pointer: fine)');
  if (!desktopPointer.matches) return;

  const meowFiles = [
    'assets/Meow.ogg',
    'assets/meow-pixabay-sound-garage.mp3',
    'assets/meow-senior-lukey1028.mp3'
  ];
  const popTimers = new WeakMap();
  let activeAudio = null;

  document.querySelectorAll('.cat-rain img').forEach((cat) => {
    cat.addEventListener('click', () => {
      if (soundEnabled) {
        if (activeAudio) {
          activeAudio.pause();
          activeAudio.currentTime = 0;
        }
        activeAudio = new Audio(meowFiles[Math.floor(Math.random() * meowFiles.length)]);
        activeAudio.play().catch(() => {});
      }

      window.clearTimeout(popTimers.get(cat));
      cat.classList.add('is-meowing');
      popTimers.set(cat, window.setTimeout(() => cat.classList.remove('is-meowing'), 170));
    });
  });
})();
