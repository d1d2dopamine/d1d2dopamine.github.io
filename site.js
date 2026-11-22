(() => {
  'use strict';

  const root = document.documentElement;
  const ATMO_KEY = 'd1d2-atmosphere';

  // 1. Atmosphere switch (Blueprint <-> Night)
  const atmoBtn = document.querySelector('[data-atmo-toggle]');
  const syncAtmoBtn = () => {
    if (!atmoBtn) return;
    const isNight = root.dataset.atmosphere === 'night';
    atmoBtn.setAttribute('aria-pressed', String(isNight));
    const label = atmoBtn.querySelector('[data-atmo-label]');
    if (label) {
      label.textContent = isNight ? atmoBtn.dataset.labelNight : atmoBtn.dataset.labelBlueprint;
    }
  };
  syncAtmoBtn();

  if (atmoBtn) {
    atmoBtn.addEventListener('click', () => {
      const next = root.dataset.atmosphere === 'night' ? 'blueprint' : 'night';
      root.dataset.atmosphere = next;
      try { localStorage.setItem(ATMO_KEY, next); } catch {}
      syncAtmoBtn();
      window.dispatchEvent(new CustomEvent('d1d2:atmosphere', { detail: next }));
    });
  }

  // 2. Project category filter (Projects page)
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

  // 3. Lightweight Chromatic Cubes Attention Canvas (Hero)
  const hero = document.querySelector('[data-hero-stage]');
  const canvas = document.querySelector('[data-cubes-canvas]');
  if (hero && canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d', { alpha: true });
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;

    // Sampled directly from d1d2 avatar chromatic squares (softened for low-glare reading)
    const PALETTE = [
      [69, 217, 236],  // cyan
      [154, 116, 247], // violet
      [236, 104, 168], // magenta
      [107, 227, 124], // lime
      [242, 185, 87],  // amber
      [95, 167, 255],  // sky
    ];

    // 24 resting cubes arranged in a stepped architectural roofline rhythm (normalized right-side zone)
    const REST = [
      [0.54, 0.62, 18, -0.18, 0], [0.57, 0.54, 14, 0.24, 1], [0.60, 0.68, 16, -0.09, 2],
      [0.63, 0.44, 20, 0.14, 3],  [0.66, 0.50, 15, -0.26, 4], [0.68, 0.36, 17, 0.20, 5],
      [0.71, 0.42, 14, -0.15, 0], [0.73, 0.58, 19, 0.11, 2],  [0.75, 0.30, 16, -0.22, 1],
      [0.78, 0.36, 21, 0.17, 3],  [0.80, 0.48, 15, -0.12, 4], [0.82, 0.24, 17, 0.26, 5],
      [0.84, 0.34, 14, -0.20, 0], [0.86, 0.44, 18, 0.13, 2],  [0.88, 0.20, 20, -0.16, 1],
      [0.90, 0.30, 16, 0.21, 3],  [0.92, 0.42, 15, -0.10, 4], [0.94, 0.26, 17, 0.15, 5],
      [0.64, 0.26, 13, 0.28, 2],  [0.72, 0.22, 14, -0.24, 3], [0.77, 0.18, 13, 0.19, 4],
      [0.85, 0.14, 15, -0.14, 0], [0.91, 0.16, 13, 0.22, 2],  [0.96, 0.36, 14, -0.18, 1],
    ];

    const cubes = REST.map(([nx, ny, size, rot, ci], idx) => ({
      nx, ny, size, baseRot: rot, ci,
      hx: 0, hy: 0, x: 0, y: 0, vx: 0, vy: 0, rot, vrot: 0,
      seed: (idx * 1.618) % 1,
    }));

    let cw = 0, ch = 0, dpr = 1, raf = 0, inView = true, energy = 0;
    let lastPx = 0, lastPy = 0, hasPointer = false;

    const layout = () => {
      const rect = hero.getBoundingClientRect();
      cw = Math.max(1, rect.width);
      ch = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const compact = cw < 720;
      for (const c of cubes) {
        c.hx = (compact ? 0.12 + (c.nx - 0.5) * 1.72 : c.nx) * cw;
        c.hy = (compact ? 0.77 + (c.ny - 0.14) * 0.28 : c.ny) * ch;
        if (!hasPointer) { c.x = c.hx; c.y = c.hy; }
      }
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, cw, ch);
      const isNight = root.dataset.atmosphere === 'night';
      const fillAlpha = isNight ? 0.24 : 0.28;
      const strokeAlpha = isNight ? 0.42 : 0.48;
      for (const c of cubes) {
        const [r, g, b] = PALETTE[c.ci];
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        const half = c.size * 0.5;
        ctx.fillStyle = `rgba(${r},${g},${b},${fillAlpha})`;
        ctx.strokeStyle = `rgba(${r},${g},${b},${strokeAlpha})`;
        ctx.lineWidth = 1;
        ctx.fillRect(-half, -half, c.size, c.size);
        ctx.strokeRect(-half + 0.5, -half + 0.5, c.size - 1, c.size - 1);
        ctx.restore();
      }
    };

    const step = () => {
      raf = 0;
      if (!inView || document.hidden) return;
      let moving = false;
      for (const c of cubes) {
        const dx = c.hx - c.x;
        const dy = c.hy - c.y;
        const dr = c.baseRot - c.rot;
        c.vx = (c.vx + dx * 0.065) * 0.82;
        c.vy = (c.vy + dy * 0.065) * 0.82;
        c.vrot = (c.vrot + dr * 0.07) * 0.80;
        c.x += c.vx;
        c.y += c.vy;
        c.rot += c.vrot;
        if (Math.abs(dx) + Math.abs(dy) + Math.abs(c.vx) + Math.abs(c.vy) > 0.18 || Math.abs(dr) > 0.004) {
          moving = true;
        } else {
          c.x = c.hx; c.y = c.hy; c.rot = c.baseRot;
          c.vx = 0; c.vy = 0; c.vrot = 0;
        }
      }
      draw();
      if (moving) raf = requestAnimationFrame(step);
    };

    const kick = () => {
      if (!raf && inView && !document.hidden && !reduced && !coarse) {
        raf = requestAnimationFrame(step);
      }
    };

    // Defer first layout/draw until after first paint
    requestAnimationFrame(() => {
      layout();
      if (!reduced && !coarse) {
        hero.addEventListener('pointermove', e => {
          const rect = hero.getBoundingClientRect();
          const px = e.clientX - rect.left;
          const py = e.clientY - rect.top;
          if (!hasPointer) { lastPx = px; lastPy = py; hasPointer = true; return; }
          const dvx = px - lastPx;
          const dvy = py - lastPy;
          lastPx = px; lastPy = py;
          const speed = Math.min(28, Math.hypot(dvx, dvy));
          if (speed < 0.8) return;
          energy = Math.min(1, speed / 22);
          for (const c of cubes) {
            const dist = Math.hypot(c.x - px, c.y - py);
            const influence = Math.max(0.18, 1 - dist / (cw * 0.65));
            const angle = (c.seed * 6.283) + energy * 1.4;
            c.vx += (dvx * 0.08 + Math.cos(angle) * speed * 0.14) * influence;
            c.vy += (dvy * 0.08 + Math.sin(angle) * speed * 0.14) * influence;
            c.vrot += (c.seed - 0.5) * speed * 0.012 * influence;
          }
          kick();
        }, { passive: true });
      }
    });

    window.addEventListener('resize', layout, { passive: true });
    window.addEventListener('d1d2:atmosphere', draw);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && raf) { cancelAnimationFrame(raf); raf = 0; }
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        inView = entries[0]?.isIntersecting ?? true;
        if (!inView && raf) { cancelAnimationFrame(raf); raf = 0; }
      }, { threshold: 0.05 }).observe(hero);
    }
  }

  // 4. Service Worker registration
  if ('serviceWorker' in navigator && location.protocol !== 'file:' && window.isSecureContext) {
    const register = () => {
      navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).catch(() => {});
    };
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
  }
})();
