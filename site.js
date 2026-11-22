(() => {
  'use strict';

  // 1. Project category filter (Projects page)
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

  // 3. Diagonal falling Chromatic Cubes Canvas (top-right -> bottom-left, like Ikna's brand backdrop)
  const hero = document.querySelector('[data-hero-stage]');
  const canvas = document.querySelector('[data-cubes-canvas]');
  if (hero && canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d', { alpha: true });
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;

    const PALETTE = [
      [69, 217, 236],  // cyan
      [154, 116, 247], // violet
      [236, 104, 168], // magenta
      [107, 227, 124], // lime
      [242, 185, 87],  // amber
      [95, 167, 255],  // sky
    ];

    const COUNT = 52;
    const cubes = [];
    // Deterministic pseudo-random so first frame is always balanced
    let seed = 1337;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    for (let i = 0; i < COUNT; i++) {
      const layer = rand(); // 0 = far/small/slow, 1 = near/larger/faster
      cubes.push({
        rx: rand(),
        ry: rand(),
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 9 + layer * 15,
        speed: 0.28 + layer * 0.52,
        rot: (rand() - 0.5) * 0.9,
        rotSpeed: (rand() - 0.5) * 0.008,
        ci: i % PALETTE.length,
        alphaScale: 0.55 + layer * 0.45,
      });
    }

    let cw = 0, ch = 0, dpr = 1, raf = 0, inView = true, lastTime = 0;
    let ptrX = -999, ptrY = -999, ptrActive = false;

    const layout = () => {
      const rect = hero.getBoundingClientRect();
      cw = Math.max(1, rect.width);
      ch = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (const c of cubes) {
        c.x = c.rx * (cw + 120) - 40;
        c.y = c.ry * (ch + 120) - 60;
      }
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, cw, ch);
      const baseFill = 0.28;
      const baseStroke = 0.48;
      const compact = cw < 720;

      for (const c of cubes) {
        // Keep left reading area calm & legible; full chromatic brightness on right/skyline side
        let zoneFade = 1;
        if (compact) {
          zoneFade = Math.max(0.14, Math.min(1, (c.y - ch * 0.56) / (ch * 0.24)));
        } else {
          zoneFade = Math.max(0.12, Math.min(1, (c.x - cw * 0.34) / (cw * 0.28)));
        }
        const aFill = baseFill * c.alphaScale * zoneFade;
        const aStroke = baseStroke * c.alphaScale * zoneFade;
        const [r, g, b] = PALETTE[c.ci];

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        const half = c.size * 0.5;
        ctx.fillStyle = `rgba(${r},${g},${b},${aFill.toFixed(3)})`;
        ctx.strokeStyle = `rgba(${r},${g},${b},${aStroke.toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.fillRect(-half, -half, c.size, c.size);
        ctx.strokeRect(-half + 0.5, -half + 0.5, c.size - 1, c.size - 1);
        ctx.restore();
      }
    };

    const tick = now => {
      raf = 0;
      if (!inView || document.hidden || reduced) return;
      const dt = lastTime ? Math.min(2.2, (now - lastTime) / 16.667) : 1;
      lastTime = now;

      const pad = 42;
      for (const c of cubes) {
        // Diagonal fall: top-right -> bottom-left
        c.x -= c.speed * 0.86 * dt;
        c.y += c.speed * 0.64 * dt;
        c.rot += c.rotSpeed * dt;

        // Gentle pointer breeze deflection
        if (ptrActive && !coarse) {
          const dx = c.x - ptrX;
          const dy = c.y - ptrY;
          const dist = Math.hypot(dx, dy);
          if (dist < 130 && dist > 1) {
            const push = (1 - dist / 130) * 0.55;
            c.vx += (dx / dist) * push;
            c.vy += (dy / dist) * push;
          }
        }
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        c.vx *= 0.92;
        c.vy *= 0.92;

        // Wrap cleanly back to top / right edge
        if (c.x < -pad || c.y > ch + pad) {
          if (Math.random() < 0.58) {
            c.x = cw * (0.28 + Math.random() * 0.78);
            c.y = -pad - Math.random() * 24;
          } else {
            c.x = cw + pad + Math.random() * 24;
            c.y = Math.random() * ch * 0.78;
          }
          c.vx = 0;
          c.vy = 0;
        }
      }
      draw();
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (!raf && inView && !document.hidden && !reduced) {
        lastTime = 0;
        raf = requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(() => {
      layout();
      if (!reduced) start();
      if (!reduced && !coarse) {
        hero.addEventListener('pointermove', e => {
          const rect = hero.getBoundingClientRect();
          ptrX = e.clientX - rect.left;
          ptrY = e.clientY - rect.top;
          ptrActive = true;
        }, { passive: true });
        hero.addEventListener('pointerleave', () => { ptrActive = false; }, { passive: true });
      }
    });

    window.addEventListener('resize', layout, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && raf) { cancelAnimationFrame(raf); raf = 0; }
      else start();
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        inView = entries[0]?.isIntersecting ?? true;
        if (!inView && raf) { cancelAnimationFrame(raf); raf = 0; }
        else start();
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
