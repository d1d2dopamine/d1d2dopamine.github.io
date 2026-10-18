/*!
 * pixel-fx.js — real-time pixel-art background for the site panels ("windows").
 *
 * How it works
 * ------------
 * Every panel (.site-header, .site-view, .error-main) gets a tiny <canvas> that
 * is CSS-stretched over the panel with image-rendering: pixelated. The canvas
 * backing store is only ~1/7 of the panel size (a few thousand pixels), so a
 * whole frame is a few thousand array writes and one putImageData call — the
 * GPU does the upscaling for free. Nothing is pre-rendered or downloaded: the
 * picture is generated from value-noise on every tick.
 *
 * Layers
 *   1. fbm aurora field  — flowing, dithered colour bands (nothing else)
 *
 * Cost control
 *  - steps at FPS, per-panel cell budget, no work off-screen or in hidden tabs
 *  - respects prefers-reduced-motion (renders one static frame)
 *  - honours ?nofx / <html data-pixel-fx="off">
 *
 * Tuning: CELL_PX (pixel size), FPS (cadence), LEVELS (colour banding),
 * MAX_CELLS (resolution budget) and PALETTE below.
 */
(() => {
  'use strict';

  const PANEL_SELECTOR = '.site-header, .site-view, .error-main';
  const CELL_PX = 7;        // CSS pixels per pixel-art cell (smaller = finer)
  const MAX_CELLS = 30000;  // per-frame resolution budget (visible area)
  const FPS = 14;           // animation cadence
  const LEVELS = 14;        // colour bands before dithering
  const DRIFT = 0.11;       // sideways travel of the whole field
  const FREQ_X = 0.130;     // horizontal detail (higher = smaller wisps)
  const FREQ_Y = 0.088;     // lower than X, so wisps stretch sideways
  const MORPH = 0.085;      // how fast the shapes themselves evolve
  const BIAS = 0.43;        // how far the field is pushed towards the dark end
  const STRETCH = 3.2;      // fbm contrast against the palette
  const KNEE = 0.9;         // soft ceiling: stops big flat bright plates
  const KNEE_SOFT = 1.2;

  // One seed for the whole site: every panel is a window onto the same aurora,
  // so switching sections continues the animation instead of starting a new one
  // (the frame clock is shared as well).
  const SEED = 20240117;
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

  // Convex palette: the lower part of the field maps to (almost) black and the
  // visible range lives in the top quarter, so the aurora shows up as rare
  // wisps on a dark panel instead of a continuous wash. The top end is held
  // down deliberately - it is the brightness ceiling of the whole animation.
  // Tones are sampled from assets/background-night.jpg (deep night blue), so
  // the pixels read as part of the photo instead of a separate colour plate.
  const PALETTE = [
    [3, 8, 14], [5, 13, 23], [8, 20, 34], [12, 29, 48],
    [17, 40, 65], [23, 53, 84], [30, 67, 104], [38, 82, 124], [48, 98, 144]
  ];

  const STEP = 1000 / FPS;
  const QUANT = 255 / LEVELS;

  /* ---------------------------------------------------------------- palette */
  const LUT = new Uint8Array(256 * 3);
  (() => {
    const segs = PALETTE.length - 1;
    for (let i = 0; i < 256; i++) {
      const p = (i / 255) * segs;
      const s = Math.min(segs - 1, p | 0);
      const f = p - s;
      const a = PALETTE[s];
      const b = PALETTE[s + 1];
      LUT[i * 3] = a[0] + (b[0] - a[0]) * f;
      LUT[i * 3 + 1] = a[1] + (b[1] - a[1]) * f;
      LUT[i * 3 + 2] = a[2] + (b[2] - a[2]) * f;
    }
  })();

  const DITHER = new Float32Array(16);
  for (let i = 0; i < 16; i++) DITHER[i] = (BAYER[i] + 0.5) / 16 - 0.5;

  /* ------------------------------------------------------------------ noise */
  function hash3(x, y, z, seed) {
    let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^
      Math.imul(z, 1274126177) ^ Math.imul(seed, 2147483647);
    h = Math.imul(h ^ (h >>> 13), 1597334677);
    return ((h ^ (h >>> 16)) >>> 0) * 2.3283064365386963e-10;
  }

  // 3D value noise. The third axis is time, so the field really reshapes:
  // clumps grow, merge and split instead of only sliding sideways.
  function noise3(x, y, z, seed) {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const zi = Math.floor(z);
    const xf = x - xi;
    const yf = y - yi;
    const zf = z - zi;
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const w = zf * zf * (3 - 2 * zf);
    const z0 = zi;
    const z1 = zi + 1;
    const c000 = hash3(xi, yi, z0, seed);
    const c100 = hash3(xi + 1, yi, z0, seed);
    const c010 = hash3(xi, yi + 1, z0, seed);
    const c110 = hash3(xi + 1, yi + 1, z0, seed);
    const c001 = hash3(xi, yi, z1, seed);
    const c101 = hash3(xi + 1, yi, z1, seed);
    const c011 = hash3(xi, yi + 1, z1, seed);
    const c111 = hash3(xi + 1, yi + 1, z1, seed);
    const x00 = c000 + (c100 - c000) * u;
    const x10 = c010 + (c110 - c010) * u;
    const x01 = c001 + (c101 - c001) * u;
    const x11 = c011 + (c111 - c011) * u;
    const y0 = x00 + (x10 - x00) * v;
    const y1 = x01 + (x11 - x01) * v;
    return y0 + (y1 - y0) * w;
  }

  // Three octaves. The high ones carry a fair share of the weight so the field
  // breaks into small wisps instead of a few large patches.
  function fbm(x, y, z, seed) {
    return noise3(x, y, z, seed) * 0.4 +
           noise3(x * 2.17 + 13.7, y * 2.17 - 7.1, z * 2.17 + 5.3, seed + 1013) * 0.34 +
           noise3(x * 4.6 + 27.4, y * 4.6 - 14.2, z * 4.6 + 10.6, seed + 2026) * 0.26;
  }

  /* ----------------------------------------------------------------- runtime */
  const instances = [];
  const byPanel = new WeakMap();
  let raf = 0;
  let lastFrame = 0;
  let clock = 0;
  let running = false;

  const reduceMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  // The cell size is a property of the site, not of one panel: it is derived
  // from the widest panel and the viewport height, so every section draws the
  // aurora at exactly the same scale. Only the rows on screen are computed per
  // frame, so the height of a panel does not influence the resolution.
  function wantedCell() {
    let widest = 0;
    for (let i = 0; i < instances.length; i++) {
      const p = instances[i].panel;
      if (!p.hidden && p.clientWidth > widest) widest = p.clientWidth;
    }
    if (!widest) widest = Math.min(window.innerWidth || 1024, 1100);
    let vh = window.innerHeight || document.documentElement.clientHeight || 768;
    if (vh > 1400) vh = 1400;
    let cell = CELL_PX;
    while (cell < 64 && (widest / cell) * (vh / cell) > MAX_CELLS) cell *= 1.25;
    return cell;
  }

  function frame(now) {
    raf = 0;
    const elapsed = now - lastFrame;
    if (elapsed >= STEP - 0.5) {
      lastFrame = now;
      const dt = Math.min(0.25, elapsed / 1000);
      clock += dt;
      let busy = 0;
      for (let i = 0; i < instances.length; i++) {
        const fx = instances[i];
        if (fx.active) {
          fx.draw(clock);
          busy++;
        }
      }
      if (!busy) { running = false; return; }
    }
    raf = requestAnimationFrame(frame);
  }

  function startLoop() {
    if (raf || (reduceMotion && reduceMotion.matches)) return;
    if (document.visibilityState === 'hidden') return;
    running = true;
    lastFrame = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function stopLoop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    running = false;
  }

  function drawStatic() {
    for (let i = 0; i < instances.length; i++) {
      if (instances[i].active) instances[i].draw(0);
    }
  }

  /* ----------------------------------------------------------------- instance */
  function createInstance(panel) {
    const canvas = document.createElement('canvas');
    canvas.className = 'pixel-fx';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.tabIndex = -1;
    panel.insertBefore(canvas, panel.firstChild);

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      canvas.remove();
      return null;
    }

    const fx = {
      panel: panel,
      canvas: canvas,
      ctx: ctx,
      cw: 0,
      ch: 0,
      cell: CELL_PX,
      yOff: 0,
      img: null,
      data: null,
      wave: new Float32Array(1),
      rowWave: new Float32Array(1),
      active: false
    };

    fx.resize = function resize() {
      const w = Math.max(24, panel.clientWidth);
      const h = Math.max(16, panel.clientHeight);
      // Shared grid: see wantedCell(). Panels of different heights get the same
      // cell size, and therefore the same aurora scale.
      const cell = wantedCell();
      const cw = Math.max(3, Math.round(w / cell));
      const ch = Math.max(3, Math.round(h / cell));
      fx.cell = w / cw;
      // Field rows are counted from the top of the document, so the header and
      // the panels below it show different parts of one continuous aurora.
      let pageTop = 0;
      for (let el = panel; el; el = el.offsetParent) pageTop += el.offsetTop;
      fx.yOff = Math.round(pageTop / (fx.cell || CELL_PX));
      if (cw === fx.cw && ch === fx.ch) return false;
      fx.cw = cw;
      fx.ch = ch;
      canvas.width = cw;
      canvas.height = ch;
      fx.img = ctx.createImageData(cw, ch);
      fx.data = fx.img.data;
      fx.wave = new Float32Array(cw);
      fx.rowWave = new Float32Array(ch);
      return true;
    };

    fx.draw = function draw(t) {
      const data = fx.data;
      const cw = fx.cw;
      const ch = fx.ch;
      if (!data || data.length !== cw * ch * 4) return;

      const seed = SEED;
      const yOff = fx.yOff;
      const wave = fx.wave;
      const rowWave = fx.rowWave;

      // Cheap per-column / per-row shading instead of a sin per pixel. Both
      // modulations average 1, so they only add drift/undulation.
      for (let x = 0; x < cw; x++) {
        wave[x] = 1 + 0.18 * Math.sin(x * 0.031 + t * 0.32 + seed * 0.013);
      }
      for (let y = 0; y < ch; y++) {
        rowWave[y] = 1 + 0.14 * Math.sin((y + yOff) * 0.045 - t * 0.26 + seed * 0.007);
      }

      const drift = t * DRIFT;
      const morph = t * MORPH;
      const shrink = drift * 0.55;

      // Only recompute the rows that are actually on screen: long pages stay
      // cheap no matter how tall the panel is.
      const rect = panel.getBoundingClientRect();
      const viewH = window.innerHeight || document.documentElement.clientHeight;
      const cellPx = fx.cell || CELL_PX;
      let rowFrom = Math.floor((0 - rect.top) / cellPx) - 1;
      let rowTo = Math.ceil((viewH - rect.top) / cellPx) + 1;
      if (rowFrom < 0) rowFrom = 0;
      if (rowTo > ch - 1) rowTo = ch - 1;
      if (rowTo < rowFrom) {
        ctx.putImageData(fx.img, 0, 0);
        return;
      }

      /* 1. aurora field ------------------------------------------------- */
      let o = rowFrom * cw * 4;
      for (let y = rowFrom; y <= rowTo; y++) {
        const ny = (y + yOff) * FREQ_Y - shrink;
        const rw = rowWave[y];
        const drow = (y & 3) << 2;
        for (let x = 0; x < cw; x++) {
          // fbm sits around 0.5; push it down and stretch it so only the rare
          // crests reach the visible part of the palette.
          let s = (fbm(x * FREQ_X + drift, ny, morph, seed) - BIAS) * STRETCH * wave[x] * rw;
          if (s > KNEE) s = KNEE + (s - KNEE) / (1 + (s - KNEE) * KNEE_SOFT);
          let q = s * LEVELS + DITHER[(x & 3) | drow];
          let i = q * QUANT;
          if (i < 0) i = 0; else if (i > 255) i = 255;
          const l = (i | 0) * 3;
          data[o] = LUT[l];
          data[o + 1] = LUT[l + 1];
          data[o + 2] = LUT[l + 2];
          data[o + 3] = 255;
          o += 4;
        }
      }

      /* 2. output ------------------------------------------------------- */
      ctx.putImageData(fx.img, 0, 0, 0, rowFrom, cw, rowTo - rowFrom + 1);
    };

    return fx;
  }

  /* --------------------------------------------------------------------- up */
  const off = /[?&]nofx\b/.test(location.search) ||
    document.documentElement.getAttribute('data-pixel-fx') === 'off';
  if (off) return;

  const panels = document.querySelectorAll(PANEL_SELECTOR);
  if (!panels.length) return;

  const io = new IntersectionObserver((entries) => {
    let wake = false;
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const fx = byPanel.get(entry.target);
      if (!fx) continue;
      const visible = entry.isIntersecting && entry.intersectionRatio > 0 && !entry.target.hidden;
      if (visible === fx.active) {
        if (visible) wake = true;
        continue;
      }
      fx.active = visible;
      if (visible) {
        fx.resize();
        // Paint the current phase right away: a freshly revealed panel must not
        // show a stale frame from an earlier visit, nor the phase-0 field.
        fx.draw(clock);
        wake = true;
      }
    }
    if (!wake) return;
    if (reduceMotion && reduceMotion.matches) drawStatic();
    else startLoop();
  }, { rootMargin: '160px 0px' });

  const ro = 'ResizeObserver' in window ? new ResizeObserver((entries) => {
    for (let i = 0; i < entries.length; i++) {
      const fx = byPanel.get(entries[i].target);
      if (fx && fx.active) fx.resize();
    }
    if (reduceMotion && reduceMotion.matches) drawStatic();
  }) : null;

  for (let i = 0; i < panels.length; i++) {
    const panel = panels[i];
    if (panel.classList.contains('skip-link')) continue;
    const fx = createInstance(panel);
    if (!fx) continue;
    instances.push(fx);
    byPanel.set(panel, fx);
    io.observe(panel);
    if (ro) ro.observe(panel);
  }

  if (!instances.length) return;

  // Safety net for the SPA router: it flips [hidden] on the views, so react to
  // that immediately instead of waiting for the next intersection pass.
  if ('MutationObserver' in window) {
    const mo = new MutationObserver((records) => {
      let wake = false;
      const vh = window.innerHeight;
      for (let i = 0; i < records.length; i++) {
        const fx = byPanel.get(records[i].target);
        if (!fx) continue;
        const rect = fx.panel.getBoundingClientRect();
        const visible = !fx.panel.hidden && rect.width > 0 && rect.height > 0 &&
          rect.top < vh + 160 && rect.bottom > -160;
        if (!visible) {
          fx.active = false;
          continue;
        }
        fx.resize();
        fx.active = true;
        fx.draw(clock);
        wake = true;
      }
      if (!wake) return;
      if (reduceMotion && reduceMotion.matches) drawStatic();
      else startLoop();
    });
    mo.observe(document.body, { attributes: true, attributeFilter: ['hidden'], subtree: true });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      stopLoop();
    } else {
      let any = false;
      for (let i = 0; i < instances.length; i++) if (instances[i].active) any = true;
      if (any && !(reduceMotion && reduceMotion.matches)) startLoop();
    }
  });

  window.addEventListener('pagehide', stopLoop);

  // The shared grid depends on the viewport as well, so a window resize has to
  // re-lay-out the panels that are on screen (the observers may not fire when
  // only the height changes).
  window.addEventListener('resize', () => {
    let changed = false;
    for (let i = 0; i < instances.length; i++) {
      if (instances[i].active && instances[i].resize()) changed = true;
    }
    if (changed && reduceMotion && reduceMotion.matches) drawStatic();
  });

  if (reduceMotion && typeof reduceMotion.addEventListener === 'function') {
    reduceMotion.addEventListener('change', () => {
      if (reduceMotion.matches) {
        stopLoop();
        drawStatic();
      } else {
        startLoop();
      }
    });
  }

  // First paint, done synchronously so a panel never shows up bare while the
  // observers are still warming up (they only refine what we pick here).
  (() => {
    let any = false;
    const limit = window.innerHeight + 160;
    for (let i = 0; i < instances.length; i++) {
      const fx = instances[i];
      if (fx.panel.hidden) continue;
      const rect = fx.panel.getBoundingClientRect();
      if (!rect.width || !rect.height || rect.top > limit || rect.bottom < -160) continue;
      fx.active = true;
      fx.resize();
      fx.draw(clock);
      any = true;
    }
    if (any && !(reduceMotion && reduceMotion.matches)) startLoop();
  })();

  // Exposed for debugging / manual tuning from the console.
  window.pixelFx = { instances, startLoop, stopLoop, running: () => running };
})();
