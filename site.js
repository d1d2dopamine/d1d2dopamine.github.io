(() => {
  const STORAGE_KEY = 'd1d2dopamine-background-time';
  const video = document.querySelector('.background-video');
  if (!video) return;

  const restorePosition = () => {
    const saved = Number(sessionStorage.getItem(STORAGE_KEY));
    if (!Number.isFinite(saved) || saved <= 0 || !Number.isFinite(video.duration) || video.duration <= 0) return;
    video.currentTime = saved % video.duration;
  };

  if (video.readyState >= 1) restorePosition();
  else video.addEventListener('loadedmetadata', restorePosition, { once: true });

  window.addEventListener('pagehide', () => {
    if (Number.isFinite(video.currentTime)) {
      sessionStorage.setItem(STORAGE_KEY, String(video.currentTime));
    }
  });
})();
