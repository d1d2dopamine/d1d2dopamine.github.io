(() => {
  const language = document.documentElement.lang === 'ru' ? 'ru' : 'en';

  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(`${value}T00:00:00Z`);
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
    const locale = language === 'ru' ? 'ru-RU' : 'en-GB';
    const clock = new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }).format(date);
    const shortDate = new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short'
    }).format(date);
    const zone = new Intl.DateTimeFormat(locale, {
      timeZoneName: 'short'
    }).formatToParts(date).find((part) => part.type === 'timeZoneName')?.value || '';
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

  const fetchLatestCommitTime = async (work) => {
    if (!work.url) return;
    try {
      const repositoryUrl = new URL(work.url);
      if (repositoryUrl.hostname !== 'github.com') return;
      const [owner, repository] = repositoryUrl.pathname.split('/').filter(Boolean);
      if (!owner || !repository) return;
      const apiRoot = 'https:' + '//api.github.com';
      const response = await fetch(
        `${apiRoot}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/commits?per_page=1`,
        {
          cache: 'no-store',
          headers: { Accept: 'application/vnd.github+json' }
        }
      );
      if (!response.ok) return;
      const commits = await response.json();
      const commit = commits[0]?.commit;
      work.lastCommitAt = commit?.committer?.date || commit?.author?.date || null;
    } catch {
      // The scheduled GitHub Action remains the primary source if the public API is unavailable.
    }
  };

  const hydrateCommitTimes = async (data) => {
    if (!Array.isArray(data.latestWorks)) return;
    await Promise.allSettled(data.latestWorks.slice(0, 5).map(fetchLatestCommitTime));
  };

  const renderSiteData = (data) => {
    const nowText = document.querySelector('[data-now-text]');
    const nowDate = document.querySelector('[data-now-date]');
    const feed = document.querySelector('[data-latest-work]');
    const releaseLink = document.querySelector('[data-current-release]');

    if (nowText && data.now?.[language]) nowText.textContent = data.now[language];
    if (nowDate && data.now?.updated) {
      nowDate.dateTime = data.now.updated;
      nowDate.textContent = formatDate(data.now.updated);
    }

    if (feed && Array.isArray(data.latestWorks) && data.latestWorks.length) {
      feed.replaceChildren();
      data.latestWorks.slice(0, 5).forEach((work) => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        const name = document.createElement('span');
        const commitTime = document.createElement('time');
        link.href = work.url;
        link.target = '_blank';
        link.rel = 'noreferrer';
        name.textContent = work.name;
        const formattedCommit = formatCommitTime(work.lastCommitAt);
        if (formattedCommit) {
          commitTime.dateTime = work.lastCommitAt;
          commitTime.textContent = formattedCommit.text;
          commitTime.title = formattedCommit.full;
        } else {
          commitTime.hidden = true;
        }
        link.append(name);
        item.append(link, commitTime);
        feed.append(item);
      });
    }

    const current = data.latestWorks?.find((work) => work.url?.includes('the-Allosteric-Sprint-hypothesis'));
    if (releaseLink && current?.release?.url) {
      releaseLink.href = current.release.url;
      releaseLink.textContent = `${language === 'ru' ? 'Релиз' : 'Release'} ${current.release.name} ↗`;
    }
  };

  fetch('data/site-data.json', { cache: 'no-cache' })
    .then((response) => {
      if (!response.ok) throw new Error(`site-data: ${response.status}`);
      return response.json();
    })
    .then(async (data) => {
      await hydrateCommitTimes(data);
      renderSiteData(data);
    })
    .catch(() => {
      // Static HTML remains a complete fallback when opened locally or offline.
    });

  const desktopPointer = window.matchMedia('(min-width: 621px) and (hover: hover) and (pointer: fine)');
  if (!desktopPointer.matches) return;

  const cats = document.querySelectorAll('.cat-rain img');
  const meowFiles = [
    'assets/Meow.ogg',
    'assets/meow-pixabay-sound-garage.mp3',
    'assets/meow-senior-lukey1028.mp3'
  ];
  const popTimers = new WeakMap();
  let activeAudio = null;

  cats.forEach((cat) => {
    cat.addEventListener('click', () => {
      if (activeAudio) {
        activeAudio.pause();
        activeAudio.currentTime = 0;
      }
      activeAudio = new Audio(meowFiles[Math.floor(Math.random() * meowFiles.length)]);
      activeAudio.play().catch(() => {});

      window.clearTimeout(popTimers.get(cat));
      cat.classList.add('is-meowing');
      const timer = window.setTimeout(() => cat.classList.remove('is-meowing'), 170);
      popTimers.set(cat, timer);
    });
  });
})();
