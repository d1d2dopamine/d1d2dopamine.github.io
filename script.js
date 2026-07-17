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
    const clock = new Intl.DateTimeFormat(language === 'ru' ? 'ru-RU' : 'en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone: 'Asia/Yekaterinburg'
    }).format(date);
    const full = new Intl.DateTimeFormat(language === 'ru' ? 'ru-RU' : 'en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Yekaterinburg'
    }).format(date);
    return {
      text: `${language === 'ru' ? 'в' : 'at'} ${clock}`,
      full
    };
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
        link.append(name, commitTime);
        item.append(link);
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
    .then(renderSiteData)
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
