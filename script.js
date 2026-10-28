/* ============================================================
   Sayak Bhanja — Portfolio
   ► ADD YOUR VIDEO LINKS BELOW. Every `src` accepts either:
       • a YouTube link  (https://www.youtube.com/watch?v=XXXXXXXXXXX  or  https://youtu.be/XXXXXXXXXXX)
       • a direct video file link  (https://…/clip.mp4  or  .webm)
   ============================================================ */

const CONFIG = {
  // false = every video plays from page load.
  // true  = direct video files pause while far off-screen (lighter on phones/data).
  PAUSE_OFFSCREEN: false,
};

// Placeholder clips so the page works out of the box. Replace each `src`.
const S = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/';

// Showreel: a YouTube link or a direct .mp4 plays automatically. (An Instagram reel link also works,
// but Instagram does not allow autoplay, so viewers press play inside the embed.)
const SHOWREEL = { src: 'https://www.youtube.com/watch?v=9TQsrFa67dc' };

const CATEGORIES = [
  {
    title: 'Colour Grading',
    items: [
      { title: 'Colour Grading — Project 01', desc: 'Short-form colour grading demonstrating visual enhancement, contrast and cinematic colour treatment.', tags: ['Colour Grading', 'Short Form'], src: 'https://www.youtube.com/watch?v=Yvre5l8yHCs' },
      { title: 'Colour Grading — Project 02', desc: 'Short-form colour grading focused on mood, consistency and professional finishing.', tags: ['Colour Grading', 'Visuals'], src: 'https://www.youtube.com/watch?v=9TQsrFa67dc' },
      { title: 'Colour Grading — Project 03', desc: 'Add your next grading project here.', tags: ['Colour Grading'], src: S + 'ForBiggerFun.mp4' },
      { title: 'Colour Grading — Project 04', desc: 'Add your next grading project here.', tags: ['Colour Grading'], src: S + 'ForBiggerJoyrides.mp4' },
    ],
  },
  {
    title: 'Documentary-Style Edits',
    items: [
      { title: 'Documentary-Style Edit — Project 01', desc: 'Story-driven editing with structured sequencing, pacing and visual storytelling.', tags: ['Documentary', 'Storytelling'], src: 'https://www.youtube.com/watch?v=PKdERjS0ZyE' },
      { title: 'Documentary-Style Edit — Project 02', desc: 'Documentary-focused edit demonstrating narrative pacing, B-roll construction and visual continuity.', tags: ['Documentary', 'B-roll'], src: 'https://youtu.be/u8CXDc6X91U?si=Aog8beGo0JGmaK-T' },
      { title: 'Documentary-Style Edit — Project 03', desc: ' Parkour Video in DaVinci Resolve CUT Page.', tags: ['Documentary'], 'https://youtu.be/2kkOQmgKNUM?si=ePeqRfIQpxefbstR' },
      { title: 'Documentary-Style Edit — Project 04', desc: 'Add your next documentary project here.', tags: ['Documentary'], src: S + 'TearsOfSteel.mp4' },
    ],
  },
  {
    title: 'Audio Stories',
    items: [
      { title: 'সোনার বিগ্রহ', desc: 'Bengali short film edit — pacing, music and colour working together.', tags: ['Audio Stories', 'Bengali'], src: 'https://www.youtube.com/watch?v=hWnM2LzC1Y0' },
      { title: 'মায়ানগরের মায়াপথ', desc: 'Bengali crime-drama promo with a moody, high-contrast grade.', tags: ['Audio Stories', 'Bengali'], src: 'https://www.youtube.com/watch?v=u5jCl5nEvqw' },
      { title: 'কিরীটী ও কালো পাখী', desc: 'Bengali crime thriller detective Story.', tags: ['Audio Stories'], 'https://youtu.be/VDKYU_-FzFw?si=rHnhRCClQG5yhRWM' },
      { title: 'Audio Stories — Project 04', desc: 'Add your next audio story or promo here.', tags: ['Audio Stories'], src: S + 'ForBiggerFun.mp4' },
    ],
  },
];

/* ============================================================
   Helpers
   ============================================================ */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover)').matches;

function el(tag, cls, html) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ============================================================
   Video component (autoplay · loop · translucent play/pause)
   Works with direct video files and YouTube links.
   ============================================================ */

const ICON = {
  play:  '<svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>',
  pause: '<svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4.5h4v15H6zM14 4.5h4v15h-4z"/></svg>',
  off:   '<svg class="i-off" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>',
  on:    '<svg class="i-on" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>',
};

function youtubeId(url) {
  const m = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
  return m ? m[1] : null;
}

const controllers = [];          // every mounted video
const userPaused = new WeakSet();

function instagramId(url) {
  const m = String(url).match(/instagram\.com\/(?:reel|reels|p|tv)\/([\w-]+)/);
  return m ? m[1] : null;
}

function mountVideo(container, src) {
  const id = youtubeId(src);
  const ig = instagramId(src);
  // YouTube refuses to play embeds on pages opened straight from a file (file://).
  // In that case show the video's still image and open YouTube on click.
  // Once the site is hosted online (or run from a local server) it plays inline.
  const fromDisk = !!id && location.protocol === 'file:';
  const media = ig
    ? '<iframe title="Instagram video" src="https://www.instagram.com/reel/' + ig + '/embed/" loading="eager" scrolling="no" allowfullscreen ' +
      'allow="autoplay; encrypted-media; fullscreen; clipboard-write"></iframe>' +
      '<a class="ig-open" href="' + esc(src) + '" target="_blank" rel="noopener">Open on Instagram</a>'
    : fromDisk
    ? '<div class="vc-poster" style="background-image:url(https://i.ytimg.com/vi/' + id + '/hqdefault.jpg)"></div>'
    : id
    ? '<iframe title="Video" loading="eager" allow="autoplay; encrypted-media; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" ' +
      'src="https://www.youtube.com/embed/' + id + '?autoplay=1&mute=1&loop=1&playlist=' + id +
      '&controls=0&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3&disablekb=1&enablejsapi=1"></iframe>'
    : '<video muted loop playsinline autoplay preload="auto"></video>';

  container.innerHTML = media +
    '<button class="vc-btn" type="button" aria-label="Play or pause video">' + ICON.play + ICON.pause + '</button>' +
    '<button class="vc-sound" type="button" aria-label="Turn sound on or off">' + ICON.off + ICON.on + '</button>';

  let ctl;
  if (ig) {
    container.classList.add('embed');
    const reel = container.closest('.reel');
    if (reel) reel.classList.add('has-embed');
    ctl = {
      el: null, isYT: true, container,
      isPaused: () => false, play() {}, pause() {}, setMuted() {}, isMuted: () => true,
    };
  } else if (fromDisk) {
    container.classList.add('paused', 'poster');
    ctl = {
      el: null, isYT: true, container,
      isPaused: () => true,
      play()  { window.open(src, '_blank', 'noopener'); },
      pause() {},
      setMuted() {},
      isMuted: () => true,
    };
  } else if (id) {
    const f = container.querySelector('iframe');
    let paused = false, muted = true;
    const send = fn => { try { f.contentWindow.postMessage(JSON.stringify({ event: 'command', func: fn, args: [] }), '*'); } catch (e) {} };
    ctl = {
      el: null, isYT: true, container,
      isPaused: () => paused,
      play()  { send('playVideo');  paused = false; container.classList.remove('paused'); },
      pause() { send('pauseVideo'); paused = true;  container.classList.add('paused'); },
      setMuted(m) { muted = m; send(m ? 'mute' : 'unMute'); },
      isMuted: () => muted,
    };
  } else {
    const v = container.querySelector('video');
    v.muted = true;              // browsers only allow autoplay when muted
    v.defaultMuted = true;
    v.src = src;
    v.addEventListener('play',  () => container.classList.remove('paused'));
    v.addEventListener('pause', () => container.classList.add('paused'));
    v.addEventListener('error', () => container.classList.add('error'));
    ctl = {
      el: v, isYT: false, container,
      isPaused: () => v.paused,
      play()  { return v.play().catch(() => {}); },
      pause() { v.pause(); },
      setMuted(m) { v.muted = m; },
      isMuted: () => v.muted,
    };
    v.play().catch(() => {});    // autoplay at launch
  }

  const btn = container.querySelector('.vc-btn');
  btn.addEventListener('click', e => {
    e.stopPropagation();
    if (ctl.isPaused()) { userPaused.delete(ctl); ctl.play(); }
    else                { userPaused.add(ctl);    ctl.pause(); }
  });
  container.querySelector('.vc-sound').addEventListener('click', e => {
    e.stopPropagation();
    ctl.setMuted(!ctl.isMuted());
    container.classList.toggle('unmuted', !ctl.isMuted());
  });
  if (!ig) container.addEventListener('click', () => btn.click());

  controllers.push(ctl);
  return ctl;
}

// If a browser blocks autoplay, start everything on the first interaction.
function rescueAutoplay() {
  controllers.forEach(c => { if (!c.isYT && c.isPaused() && !userPaused.has(c)) c.play(); });
}
['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(ev =>
  window.addEventListener(ev, rescueAutoplay, { once: true, passive: true })
);

if (CONFIG.PAUSE_OFFSCREEN) {
  const byEl = new Map();
  const io = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      const c = byEl.get(target);
      if (!c || c.isYT) return;
      if (isIntersecting) { if (!userPaused.has(c)) c.play(); } else c.pause();
    });
  }, { rootMargin: '100% 0px' });
  window.addEventListener('load', () => controllers.forEach(c => { byEl.set(c.container, c); io.observe(c.container); }));
}

/* ============================================================
   Selected Work — categories with side arrows
   ============================================================ */

const CHEVRON_L = '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>';
const CHEVRON_R = '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>';

function buildCategories() {
  const root = document.getElementById('categories');

  CATEGORIES.forEach(cat => {
    const section = el('div', 'category');

    const head = el('div', 'category-head',
      '<h3>' + esc(cat.title) + '</h3><small>' + cat.items.length + ' projects</small>');

    const carousel = el('div', 'carousel');
    const rail = el('div', 'rail');
    const prev = el('button', 'arrow prev', CHEVRON_L);
    const next = el('button', 'arrow next', CHEVRON_R);
    prev.type = next.type = 'button';
    prev.setAttribute('aria-label', 'Scroll ' + cat.title + ' left');
    next.setAttribute('aria-label', 'Scroll ' + cat.title + ' right');

    cat.items.forEach((item, i) => {
      const card = el('article', 'card');   // animated on scroll by setupCardScroll()
      const vc = el('div', 'vc');
      const body = el('div', 'card-body',
        '<h4>' + esc(item.title) + '</h4>' +
        '<p>' + esc(item.desc) + '</p>' +
        '<div class="tags">' + item.tags.map(t => '<span>' + esc(t) + '</span>').join('') + '</div>' +
        '<a class="watch" href="' + esc(item.url || item.src) + '" target="_blank" rel="noopener">Watch Project</a>');
      card.append(vc, body);
      rail.append(card);
      mountVideo(vc, item.src);
    });

    carousel.append(rail, prev, next);
    section.append(head, carousel);
    root.append(section);

    // scroll exactly one card at a time, smoothly
    const step = () => {
      const c = rail.querySelector('.card');
      return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(rail).columnGap || 22) : rail.clientWidth;
    };
    const update = () => {
      prev.disabled = rail.scrollLeft <= 2;
      next.disabled = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 2;
    };
    // keep the arrows vertically centred on the video thumbnails
    // (uses layout widths only, so the scroll animation's transforms don't move the arrows)
    const place = () => {
      const card = rail.querySelector('.card');
      if (!card) return;
      const padTop = parseFloat(getComputedStyle(rail).paddingTop) || 0;
      const y = rail.offsetTop + padTop + 1 + (card.offsetWidth * 9 / 16) / 2;
      prev.style.top = next.style.top = y + 'px';
    };
    prev.addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => rail.scrollBy({ left:  step(), behavior: 'smooth' }));
    rail.addEventListener('scroll', update, { passive: true });
    new ResizeObserver(() => { place(); update(); }).observe(carousel);
    place(); update();
  });
}

/* ============================================================
   Page animation
   ============================================================ */

// 1. rise-and-sharpen reveal for anything marked data-anim
function setupReveal() {
  const items = document.querySelectorAll('[data-anim]');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      if (e.target.matches('[data-watch]')) e.target.querySelectorAll('.count').forEach(countUp);
      e.target.querySelectorAll('.count').forEach(countUp);
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  items.forEach(n => io.observe(n));
}

function countUp(node) {
  if (node.dataset.done) return;
  node.dataset.done = '1';
  const to = parseFloat(node.dataset.to), dec = +node.dataset.dec, pad = +node.dataset.pad;
  const fmt = n => n.toFixed(dec).padStart(pad, '0');
  const t0 = performance.now(), dur = 1400;
  (function tick(t) {
    const p = Math.min((t - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
    node.textContent = fmt(to * eased);
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}

// 2. scroll progress bar + showreel parallax zoom
function setupScrollEffects() {
  const bar = document.getElementById('progress');
  const reel = document.getElementById('showreel');
  const reelVc = document.getElementById('showreel-video');
  let queued = false;

  function frame() {
    queued = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? scrollY / max : 0) + ')';
    if (!reduceMotion) {
      const r = reel.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, 1 - (r.top + r.height * 0.4) / innerHeight));   // 0 → 1 as it scrolls into view
      reelVc.style.setProperty('--s', (1.12 - 0.12 * p).toFixed(4));
    }
  }
  const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  frame();
}

// 3. scroll-linked project cards:
//    rise, tilt up and settle as they enter the screen (staggered by column),
//    lean toward the centre while a row is scrolled sideways, and let the
//    video drift against its frame for depth. Values ease toward their target.
function setupCardScroll() {
  if (reduceMotion) return;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const state = [...document.querySelectorAll('.card')].map(card => ({
    card, rail: card.parentElement, e: null, tilt: 0, par: 0,
  }));
  let running = false;

  function tick() {
    const vh = innerHeight;
    const railRects = new Map();
    const railVel = new Map();                 // how fast each row is moving sideways (px per frame)
    let moving = false;

    state.forEach(s => {
      let rr = railRects.get(s.rail);
      if (!rr) {
        rr = s.rail.getBoundingClientRect(); railRects.set(s.rail, rr);
        const last = s.rail._lastLeft == null ? s.rail.scrollLeft : s.rail._lastLeft;
        railVel.set(s.rail, s.rail.scrollLeft - last);
        s.rail._lastLeft = s.rail.scrollLeft;
      }

      // positions are taken from layout (not from the animated card) so there is no feedback loop
      const w = s.card.offsetWidth;
      const x = s.card.offsetLeft - s.rail.scrollLeft;                 // card left edge inside its row
      const top = rr.top + 14;                                         // card top (rail padding-top)
      const col = clamp(Math.round(x / (w + 22)), 0, 3);

      const enter = clamp((vh - top - 20 - col * 40) / (vh * 0.32), 0, 1);
      const tE = 1 - Math.pow(1 - enter, 3);                           // ease-out
      const tTilt = clamp(railVel.get(s.rail) * 0.5, -9, 9);           // swings while a row moves, flat at rest
      const cy = top + (w * 9 / 16 + 120) / 2;
      const tPar = clamp((cy - vh / 2) / (vh / 2), -1, 1) * -7;

      if (s.e === null) { s.e = tE; s.tilt = tTilt; s.par = tPar; }    // first frame: no animation from zero
      else {
        s.e    += (tE    - s.e)    * 0.16;
        s.tilt += (tTilt - s.tilt) * 0.12;
        s.par  += (tPar  - s.par)  * 0.16;
        if (Math.abs(tE - s.e) > 0.002 || Math.abs(tTilt - s.tilt) > 0.02 || Math.abs(tPar - s.par) > 0.02) moving = true;
      }

      const st = s.card.style;
      st.setProperty('--e', s.e.toFixed(4));
      st.setProperty('--tilt', s.tilt.toFixed(3));
      st.setProperty('--par', s.par.toFixed(3));
    });

    if (moving) requestAnimationFrame(tick); else running = false;
  }

  const kick = () => { if (!running) { running = true; requestAnimationFrame(tick); } };
  document.addEventListener('scroll', kick, { passive: true, capture: true });   // page and every row
  addEventListener('resize', kick);
  kick();
}

// 4. magnetic buttons and icons
function setupMagnetic() {
  if (reduceMotion || !canHover) return;
  document.querySelectorAll('[data-magnetic]').forEach(n => {
    n.addEventListener('pointermove', e => {
      const r = n.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.28;
      const y = (e.clientY - r.top - r.height / 2) * 0.28;
      n.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
    });
    n.addEventListener('pointerleave', () => { n.style.transform = ''; });
  });
}

/* ============================================================
   Showreel timecode + scrubber (direct video files only)
   ============================================================ */

function setupHud(ctl) {
  const hud = document.getElementById('hud');
  if (!ctl.el) { hud.hidden = true; return; }       // YouTube embeds can't report time
  const v = ctl.el;
  const FPS = 25;
  const tc = document.getElementById('tc');
  const dur = document.getElementById('dur');
  const scrub = document.getElementById('scrub');
  const fill = document.getElementById('scrub-fill');
  const head = document.getElementById('scrub-head');
  const sound = document.getElementById('hud-sound');
  const pad = n => String(n).padStart(2, '0');

  const code = t => {
    const s = Math.floor(t);
    return pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60) + ':' + pad(Math.floor((t % 1) * FPS));
  };

  sound.innerHTML = ICON.off + ICON.on;
  sound.addEventListener('click', () => document.querySelector('#showreel-video .vc-sound').click());

  const showDuration = () => { if (isFinite(v.duration)) dur.textContent = code(v.duration); };
  v.addEventListener('loadedmetadata', showDuration);
  showDuration();

  (function loop() {
    const d = v.duration || 0;
    const p = d ? v.currentTime / d : 0;
    tc.textContent = code(v.currentTime);
    fill.style.width = head.style.left = (p * 100) + '%';
    scrub.setAttribute('aria-valuenow', Math.round(p * 100));
    requestAnimationFrame(loop);
  })();

  const seek = e => {
    if (!isFinite(v.duration)) return;
    const r = scrub.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    v.currentTime = p * v.duration;
  };
  let dragging = false;
  scrub.addEventListener('pointerdown', e => { dragging = true; scrub.setPointerCapture(e.pointerId); seek(e); });
  scrub.addEventListener('pointermove', e => { if (dragging) seek(e); });
  scrub.addEventListener('pointerup',   () => { dragging = false; });
  scrub.addEventListener('pointercancel', () => { dragging = false; });
  scrub.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { v.currentTime = Math.min(v.duration || 0, v.currentTime + 5); e.preventDefault(); }
    if (e.key === 'ArrowLeft')  { v.currentTime = Math.max(0, v.currentTime - 5); e.preventDefault(); }
  });
}

/* ============================================================
   Contact pop-up ("Let's Work Together")
   ============================================================ */

function setupContactModal() {
  const modal = document.getElementById('contact-modal');
  const triggers = document.querySelectorAll('[data-open-contact]');
  if (!modal || !triggers.length) return;

  const FOCUSABLE = 'a[href], button:not([disabled])';
  let lastFocus = null;
  let closeTimer = 0;

  function open(e) {
    if (e) e.preventDefault();
    clearTimeout(closeTimer);
    lastFocus = document.activeElement;
    modal.hidden = false;
    void modal.offsetWidth;                          // let the browser register the start state, then animate in
    modal.classList.add('open');
    document.documentElement.classList.add('modal-open');
    setTimeout(() => modal.querySelector('.modal-close').focus(), 60);
  }

  function close() {
    if (modal.hidden) return;
    modal.classList.remove('open');
    document.documentElement.classList.remove('modal-open');
    closeTimer = setTimeout(() => { modal.hidden = true; }, 380);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  triggers.forEach(t => t.addEventListener('click', open));
  modal.addEventListener('click', e => { if (e.target.closest('[data-close]')) close(); });

  document.addEventListener('keydown', e => {
    if (modal.hidden) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Tab') {                           // keep keyboard focus inside the pop-up
      const items = [...modal.querySelectorAll(FOCUSABLE)];
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}

/* ============================================================
   Init
   ============================================================ */

const reelCtl = mountVideo(document.getElementById('showreel-video'), SHOWREEL.src);
setupHud(reelCtl);
buildCategories();
setupReveal();
setupScrollEffects();
setupCardScroll();
setupMagnetic();
setupContactModal();
document.getElementById('year').textContent = new Date().getFullYear();
