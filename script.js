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

  const githubApi = 'https:' + '//api.github.com';

  const fetchJson = async (url) => {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: { Accept: 'application/vnd.github+json' }
    });
    if (!response.ok) throw new Error(`GitHub API: ${response.status}`);
    return response.json();
  };

  const fetchLatestCommit = async (repo) => {
    try {
      const branch = encodeURIComponent(repo.default_branch || 'main');
      const item = await fetchJson(`${githubApi}/repos/${repo.full_name}/commits/${branch}`);
      const commit = item.commit || {};
      return {
        name: repo.name === 'the-Allosteric-Sprint-hypothesis'
          ? 'The Allostatic Sprint Hypothesis'
          : repo.name.replaceAll('-', ' '),
        description: repo.description || '',
        url: repo.html_url,
        updatedAt: repo.updated_at,
        lastCommitAt: commit.committer?.date || commit.author?.date || null
      };
    } catch {
      return null;
    }
  };

  const hydrateLatestActivity = async (data) => {
    try {
      // Discover repositories on every page load, so a commit in a new or
      // previously inactive repository is not hidden until the next Action run.
      const repos = await fetchJson(
        `${githubApi}/users/d1d2dopamine/repos?sort=pushed&direction=desc&per_page=20&type=owner`
      );
      const candidates = repos
        .filter((repo) => !repo.fork && !repo.archived && repo.name.toLowerCase() !== 'd1d2dopamine.github.io')
        .slice(0, 10);
      const results = await Promise.allSettled(candidates.map(fetchLatestCommit));
      const works = results
        .map((result) => result.status === 'fulfilled' ? result.value : null)
        .filter((work) => work?.lastCommitAt)
        .sort((a, b) => new Date(b.lastCommitAt) - new Date(a.lastCommitAt))
        .slice(0, 1);
      if (works.length) data.latestWorks = works;
    } catch {
      // Cached data from GitHub Actions remains the fallback if the API is unavailable.
    }
  };

  const renderSiteData = (data) => {
    const nowText = document.querySelector('[data-now-text]');
    const nowDate = document.querySelector('[data-now-date]');
    const feed = document.querySelector('[data-latest-work]');

    if (nowText && data.now?.[language]) nowText.textContent = data.now[language];
    if (nowDate && data.now?.updated) {
      nowDate.dateTime = data.now.updated;
      nowDate.textContent = formatDate(data.now.updated);
    }

    if (feed && Array.isArray(data.latestWorks) && data.latestWorks.length) {
      feed.replaceChildren();
      data.latestWorks.slice(0, 1).forEach((work) => {
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
  };

  fetch('data/site-data.json', { cache: 'no-cache' })
    .then((response) => {
      if (!response.ok) throw new Error(`site-data: ${response.status}`);
      return response.json();
    })
    .then(async (data) => {
      await hydrateLatestActivity(data);
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
