/* ============================================================
   DESGRO MEDIA — main.js
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────
   Video — autoplay muted, click to pause/resume
────────────────────────────────────────── */
(function initVideo() {
  const video   = document.getElementById('brandVideo');
  const wrapper = document.getElementById('videoWrapper');
  if (!video) return;

  wrapper.addEventListener('click', () => {
    if (video.paused) { video.play(); }
    else              { video.pause(); }
  });
})();


/* ──────────────────────────────────────────
   Hamburger Mobile Nav
────────────────────────────────────────── */
(function initMobileNav() {
  const hamburger = document.getElementById('navHamburger');
  const mobileNav = document.getElementById('mobileNav');
  const closeBtn  = document.getElementById('mobileNavClose');
  if (!hamburger || !mobileNav) return;

  function openNav()  { mobileNav.classList.add('open'); document.body.style.overflow='hidden'; hamburger.classList.add('active'); }
  function closeNav() { mobileNav.classList.remove('open'); document.body.style.overflow=''; hamburger.classList.remove('active'); }

  hamburger.addEventListener('click', openNav);
  if (closeBtn) closeBtn.addEventListener('click', closeNav);
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
})();


/* ──────────────────────────────────────────
   NAVBAR scroll style
────────────────────────────────────────── */
(function initNavbar() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.style.background = window.scrollY > 20 ? 'rgba(0,0,0,0.99)' : 'rgba(0,0,0,0.97)';
  }, { passive: true });
})();


/* ══════════════════════════════════════════════════════
   ANIMATIONS — loader · text reveals · parallax · scroll-reveal
══════════════════════════════════════════════════════ */
(function initAnimations() {

  /* Mark JS active so CSS can apply pre-animation hidden states */
  document.documentElement.classList.add('js-ready');

  /* ────────────────────────────────
     PAGE LOADER
  ──────────────────────────────── */
  const loader = document.createElement('div');
  loader.className = 'page-loader';
  loader.setAttribute('aria-hidden', 'true');
  loader.innerHTML =
    '<div class="loader-brand">' +
      '<div class="loader-redbar"></div>' +
      '<div class="loader-name-wrap"><span class="loader-name">DESGRO</span></div>' +
      '<span class="loader-sub">MEDIA</span>' +
    '</div>' +
    '<div class="loader-track"><div class="loader-fill"></div></div>';
  document.body.insertBefore(loader, document.body.firstChild);

  setTimeout(() => {
    loader.classList.add('exit');
    revealHero();
    loader.addEventListener('transitionend', () => loader.remove(), { once: true });
  }, 2100);

  /* ────────────────────────────────
     HERO CHAR SPLIT
     Split "DESGRO" into individual <span.char><span.char-inner> pairs
     so each character can reveal upward with a stagger.
  ──────────────────────────────── */
  const desgroEl = document.querySelector('.hero-title-desgro');
  const mediaEl  = document.querySelector('.hero-title-media');
  let charInners = [];

  if (desgroEl) {
    const text = desgroEl.textContent.trim();
    desgroEl.innerHTML = '';
    text.split('').forEach(ch => {
      const outer = document.createElement('span');
      outer.className = 'char';
      const inner = document.createElement('span');
      inner.className = 'char-inner';
      inner.textContent = ch;
      outer.appendChild(inner);
      desgroEl.appendChild(outer);
    });
    charInners = Array.from(desgroEl.querySelectorAll('.char-inner'));
  }

  /* ────────────────────────────────
     HERO REVEAL  (called when loader exits)
  ──────────────────────────────── */
  function revealHero() {
    /* DESGRO — each char slides up with stagger */
    charInners.forEach((ch, i) => {
      ch.style.animation =
        `char-up 0.65s cubic-bezier(0.16,1,0.3,1) ${i * 0.05}s both`;
    });

    /* MEDIA — slide in from left after DESGRO finishes */
    const mediaDelay = charInners.length * 50 + 60;
    setTimeout(() => { if (mediaEl) mediaEl.classList.add('anim-in'); }, mediaDelay);

    /* Labels & tagline — subtle fade up */
    const labels  = document.querySelector('.hero-top-labels');
    const tagline = document.querySelector('.hero-tagline');
    setTimeout(() => { if (labels)  labels.classList.add('anim-in'); },  60);
    setTimeout(() => { if (tagline) tagline.classList.add('anim-in'); }, 400);
  }

  /* ────────────────────────────────
     TEAM TITLE — line-by-line reveal
     Wraps each BR-separated word in a clip container so the line
     slides up from below its own baseline, not from the section top.
  ──────────────────────────────── */
  (function setupTeamTitle() {
    const el = document.querySelector('.team-title');
    if (!el) return;

    const lines = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = lines.map(line =>
      `<span class="ttl-wrap"><span class="ttl-inner">${line.trim()}</span></span>`
    ).join('');

    const inners = el.querySelectorAll('.ttl-inner');

    new IntersectionObserver(([entry], obs) => {
      if (!entry.isIntersecting) return;
      inners.forEach((inn, i) =>
        setTimeout(() => inn.classList.add('anim-in'), i * 160)
      );
      obs.disconnect();
    }, { threshold: 0.25 }).observe(el);
  })();

  /* ────────────────────────────────
     CONTACT HEADING — line reveal
     Splits "START YOUR" and "<span>BRAND STORY</span>" into
     separate clip containers so each line reveals independently.
  ──────────────────────────────── */
  (function setupContactHeading() {
    const el = document.querySelector('.contact-heading');
    if (!el) return;

    /* Collect text + span from existing HTML */
    let line1 = '';
    let line2El = null;
    Array.from(el.childNodes).forEach(n => {
      if (n.nodeType === Node.TEXT_NODE) line1 += n.textContent;
      else if (n.tagName === 'SPAN')     line2El = n.cloneNode(true);
    });

    el.innerHTML = '';

    [line1.trim(), line2El].forEach((content, i) => {
      if (!content) return;
      const wrap  = document.createElement('span');
      wrap.className = 'ch-wrap';
      const inner = document.createElement('span');
      inner.className = 'ch-inner';
      if (typeof content === 'string') inner.textContent = content;
      else inner.appendChild(content);
      wrap.appendChild(inner);
      el.appendChild(wrap);
      if (i === 0) el.appendChild(document.createElement('br'));
    });

    const inners = el.querySelectorAll('.ch-inner');

    new IntersectionObserver(([entry], obs) => {
      if (!entry.isIntersecting) return;
      inners.forEach((inn, i) =>
        setTimeout(() => inn.classList.add('anim-in'), i * 160)
      );
      obs.disconnect();
    }, { threshold: 0.4 }).observe(el);
  })();

  /* ────────────────────────────────
     SCROLL REVEAL  (.sr / .sr-right)
     Applied programmatically to keep HTML clean.
  ──────────────────────────────── */
  (function setupScrollReveal() {
    const groups = [
      { sel: '.about-text p',     cls: ''         },
      { sel: '.service-item',     cls: 'sr-right'  },
      { sel: '.team-label',       cls: ''          },
      { sel: '.team-descriptors', cls: ''          },
      { sel: '.contact-label',    cls: ''          },
      { sel: '.btn-contact',      cls: ''          },
      { sel: '.contact-footer',   cls: ''          },
    ];

    groups.forEach(({ sel, cls }) => {
      document.querySelectorAll(sel).forEach((el, i) => {
        el.classList.add('sr');
        if (cls) el.classList.add(cls);
        el.style.transitionDelay = `${i * 0.09}s`;
      });
    });

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('sr-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.sr').forEach(el => io.observe(el));
  })();

  /* ────────────────────────────────
     PARALLAX — hero title block
     Title moves at 30% of scroll speed, creating a sense of depth.
     Only active while the hero section is in the viewport.
  ──────────────────────────────── */
  (function setupParallax() {
    const titleBlock  = document.querySelector('.hero-title-block');
    const heroSection = document.querySelector('.hero-section');
    if (!titleBlock || !heroSection) return;

    let ticking = false;

    function update() {
      const y          = window.scrollY;
      const heroHeight = heroSection.offsetTop + heroSection.offsetHeight;
      titleBlock.style.transform = y < heroHeight
        ? `translateY(${y * 0.28}px)`
        : '';
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
  })();

})(); /* end initAnimations */


/* ──────────────────────────────────────────
   Scroll-fade (section-level reveals)
────────────────────────────────────────── */
(function initFadeIn() {
  /* hero-bottom-row and video-section fade in as full sections.
     team-header and contact-inner are handled by the per-element
     animation system above, so they are omitted here. */
  const targets = document.querySelectorAll('.hero-bottom-row, .video-section, .team-header');
  targets.forEach(el => el.classList.add('fade-in'));
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.08 });
  targets.forEach(t => io.observe(t));
})();


/* ══════════════════════════════════════════════════════
   3D ROTATING RING
══════════════════════════════════════════════════════ */
(function initRing() {
  const track    = document.getElementById('ringTrack');
  const viewport = document.getElementById('ringViewport');
  if (!track || !viewport) return;

  const cards = Array.from(track.querySelectorAll('.team-card'));
  const N = cards.length;

  /* ── Responsive sizing ── */
  const isMobile   = () => window.innerWidth < 768;
  const getRadius  = () => isMobile() ? 220 : 360;
  const getCardW   = () => isMobile() ? 120 : 175;
  const getCardH   = () => isMobile() ? 160 : 230;

  /* ── Ring tilt ── */
  const TILT_X = -14;
  const TILT_Z = -18;

  /* ── Pop-out params ── */
  const POP_Z     = 60;
  const POP_SCALE = 1.18;

  /* ── Hover animation durations (ms) ── */
  const HOVER_IN_MS  = 480;
  const HOVER_OUT_MS = 360;

  /* ── Physics ── */
  const FRICTION   = 0.96;
  const IDLE_SPEED = 0.28;
  const MAX_VEL    = 8;
  const IDLE_NUDGE = IDLE_SPEED * (1 / FRICTION - 1);

  /* ── Position cards ── */
  function positionCards() {
    const r  = getRadius();
    const cw = getCardW();
    const ch = getCardH();
    cards.forEach((card, i) => {
      const angle = (360 / N) * i;
      card.style.width      = cw + 'px';
      card.style.height     = ch + 'px';
      card.style.marginLeft = (-cw / 2) + 'px';
      card.style.marginTop  = (-ch / 2) + 'px';
      card.dataset.baseAngle = String(angle);
      card.style.transform  = `rotateY(${angle}deg) translateZ(${r}px)`;
    });
  }

  positionCards();
  window.addEventListener('resize', positionCards, { passive: true });

  /* ── Ring state ── */
  let currentAngle = 0;
  let velocity     = 0;
  let dragging     = false;

  /* ── Hover state ── */
  let hoveredCard      = null;
  let hoverProgress    = 0;
  let hoverDir         = 0;
  let exitingCard      = null;
  let exitProgress     = 0;
  let hoverExitTimer   = null;
  let prevTime         = 0;

  /* ── Easing ── */
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  /* ── Render ring ── */
  function setRingAngle(deg) {
    track.style.transform =
      `rotateX(${TILT_X}deg) rotateZ(${TILT_Z}deg) rotateY(${deg}deg)`;
  }

  /* ── Build hover card transform for progress p ── */
  function buildHoverTransform(p) {
    const ep = easeOutCubic(p);
    return `translateZ(${POP_Z * ep}px) scale(${1 + (POP_SCALE - 1) * ep})`;
  }

  /* ────────────────────────────────
     HOVER HELPERS
  ──────────────────────────────── */
  function clearHover() {
    if (hoverExitTimer) { clearTimeout(hoverExitTimer); hoverExitTimer = null; }
    if (exitingCard) {
      const inner = exitingCard.querySelector('.card-inner');
      if (inner) inner.style.transform = '';
      exitingCard.classList.remove('card-hovered');
      exitingCard  = null;
      exitProgress = 0;
    }
    if (!hoveredCard) return;
    const inner = hoveredCard.querySelector('.card-inner');
    if (inner) inner.style.transform = '';
    hoveredCard.classList.remove('card-hovered');
    hoveredCard   = null;
    hoverDir      = 0;
    hoverProgress = 0;
  }

  function startHoverEnter(card) {
    if (dragging) return;
    if (hoverExitTimer) { clearTimeout(hoverExitTimer); hoverExitTimer = null; }

    if (hoveredCard === card) {
      hoverDir = 1;
      card.classList.add('card-hovered');
      return;
    }

    if (hoveredCard) {
      if (exitingCard) {
        const pi = exitingCard.querySelector('.card-inner');
        if (pi) pi.style.transform = '';
        exitingCard.classList.remove('card-hovered');
      }
      exitingCard  = hoveredCard;
      exitProgress = hoverProgress;
      exitingCard.classList.remove('card-hovered');
      hoveredCard   = null;
      hoverProgress = 0;
      hoverDir      = 0;
    }

    hoveredCard = card;
    hoverDir    = 1;
    card.classList.add('card-hovered');
  }

  function startHoverExit(card) {
    if (!hoveredCard || hoveredCard !== card) return;
    if (hoverExitTimer) clearTimeout(hoverExitTimer);
    hoverExitTimer = setTimeout(() => {
      hoverExitTimer = null;
      if (!hoveredCard || hoveredCard !== card) return;
      hoverDir = -1;
      hoveredCard.classList.remove('card-hovered');
    }, 60);
  }

  function finishHoverExit() {
    if (!hoveredCard) return;
    const inner = hoveredCard.querySelector('.card-inner');
    if (inner) inner.style.transform = '';
    hoveredCard.classList.remove('card-hovered');
    hoveredCard   = null;
    hoverDir      = 0;
    hoverProgress = 0;
  }

  /* ────────────────────────────────
     DRAG
  ──────────────────────────────── */
  let lastDragX = 0;
  let lastDragT = 0;

  function onDragStart(x) {
    clearHover();
    dragging  = true;
    lastDragX = x;
    lastDragT = performance.now();
    velocity  = 0;
  }

  function onDragMove(x) {
    if (!dragging) return;
    const dx = x - lastDragX;
    const dt = performance.now() - lastDragT;
    velocity  = Math.max(-MAX_VEL, Math.min(MAX_VEL, (dx / (dt || 1)) * 1.3));
    currentAngle += dx * 0.15;
    setRingAngle(currentAngle);
    lastDragX = x;
    lastDragT = performance.now();
  }

  function onDragEnd() {
    if (!dragging) return;
    dragging = false;
  }

  viewport.addEventListener('mousedown', e => { onDragStart(e.clientX); e.preventDefault(); });
  window.addEventListener('mousemove',   e => { if (dragging) onDragMove(e.clientX); });
  window.addEventListener('mouseup',     onDragEnd);

  viewport.addEventListener('touchstart', e => { onDragStart(e.touches[0].clientX); }, { passive: true });
  viewport.addEventListener('touchmove',  e => { if (dragging) onDragMove(e.touches[0].clientX); }, { passive: true });
  viewport.addEventListener('touchend',   onDragEnd);

  viewport.addEventListener('mouseleave', () => { if (hoveredCard) startHoverExit(hoveredCard); });

  /* ────────────────────────────────
     SCROLL / WHEEL acceleration
  ──────────────────────────────── */
  let inView = false;
  const visIO = new IntersectionObserver(en => { inView = en[0].isIntersecting; }, { threshold: 0.2 });
  visIO.observe(viewport);

  window.addEventListener('wheel', e => {
    if (!inView) return;
    velocity = Math.max(-MAX_VEL, Math.min(MAX_VEL, velocity + e.deltaY * 0.015));
  }, { passive: true });

  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    if (!inView) return;
    const dy = window.scrollY - lastScrollY;
    lastScrollY = window.scrollY;
    velocity = Math.max(-MAX_VEL, Math.min(MAX_VEL, velocity + dy * 0.04));
  }, { passive: true });

  /* ────────────────────────────────
     CARD HOVER EVENTS
  ──────────────────────────────── */
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => startHoverEnter(card));
    card.addEventListener('mouseleave', () => startHoverExit(card));
  });

  /* ════════════════════════════════════════════════════════
     MASTER LOOP — single RAF handles ring + hover every frame
  ════════════════════════════════════════════════════════ */
  function masterLoop(now) {
    const dt = prevTime ? Math.min(now - prevTime, 50) : 16;
    prevTime = now;

    /* Smooth idle spin — ramps back to IDLE_SPEED without a jerk */
    if (!dragging && !hoveredCard && velocity < IDLE_SPEED) {
      velocity = Math.min(IDLE_SPEED, velocity + IDLE_NUDGE);
    }

    if (!dragging) velocity *= FRICTION;
    currentAngle += velocity;
    setRingAngle(currentAngle);

    /* Animate retreating card */
    if (exitingCard) {
      exitProgress = Math.max(0, exitProgress - dt / HOVER_OUT_MS);
      const inner = exitingCard.querySelector('.card-inner');
      if (exitProgress === 0) {
        if (inner) inner.style.transform = '';
        exitingCard = null;
      } else if (inner) {
        inner.style.transform = buildHoverTransform(exitProgress);
      }
    }

    /* Animate hovered card */
    if (hoverDir !== 0 || hoveredCard) {
      if (hoverDir === 1) {
        hoverProgress = Math.min(1, hoverProgress + dt / HOVER_IN_MS);
      } else if (hoverDir === -1) {
        hoverProgress = Math.max(0, hoverProgress - dt / HOVER_OUT_MS);
        if (hoverProgress === 0) { finishHoverExit(); }
      }
      if (hoveredCard) {
        const inner = hoveredCard.querySelector('.card-inner');
        if (inner) inner.style.transform = buildHoverTransform(hoverProgress);
      }
    }

    requestAnimationFrame(masterLoop);
  }

  setRingAngle(0);
  requestAnimationFrame(masterLoop);

})();


/* ══════════════════════════════════════════════════════
   SERVICES PAGE — scrollytelling · counters · card reveals
══════════════════════════════════════════════════════ */
(function initServicesDetail() {

  /* ── 1. SCROLLYTELLING: scroll progress drives statement reveals ── */
  const scrollyOuter = document.querySelector('.sd-scrolly-outer');
  const stmts        = document.querySelectorAll('.sd-stmt');

  if (scrollyOuter && stmts.length) {
    /* Thresholds: what scroll-progress (0→1) activates each line.
       Keep first > 0 so nothing appears before the user actually scrolls in. */
    const THRESHOLDS = [0.08, 0.42, 0.74];

    function updateScrolly() {
      const rect       = scrollyOuter.getBoundingClientRect();
      const scrollable = scrollyOuter.offsetHeight - window.innerHeight;
      /* Only compute progress when the outer is on-screen */
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const progress = scrollable > 0 ? Math.max(0, Math.min(1, -rect.top / scrollable)) : 1;
      stmts.forEach((s, i) => s.classList.toggle('active', progress >= THRESHOLDS[i]));
    }

    window.addEventListener('scroll', updateScrolly, { passive: true });
    /* Don't call on load — let the user scroll to trigger it */
  }

  /* ── 2. STAT COUNTER: animates 0 → target when orb enters view ── */
  function runCounter(orb) {
    const target = parseInt(orb.dataset.val, 10);
    const numEl  = orb.querySelector('.sd-orb-num');
    if (!numEl) return;
    const duration = 1800;
    const start    = performance.now();
    (function tick(now) {
      const p    = Math.min(1, (now - start) / duration);
      const ease = 1 - Math.pow(1 - p, 3);
      numEl.textContent = Math.floor(ease * target);
      if (p < 1) requestAnimationFrame(tick);
      else numEl.textContent = target;
    })(start);
  }

  /* ── 3. ORB ENTRANCE + COUNTER trigger ── */
  const orbs = document.querySelectorAll('.sd-orb');
  if (orbs.length) {
    const orbIO = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const orb   = e.target;
        const delay = parseInt(orb.dataset.orbDelay || '0', 10);
        setTimeout(() => { orb.classList.add('orb-in'); runCounter(orb); }, delay);
        orbIO.unobserve(orb);
      });
    }, { threshold: 0.25 });

    orbs.forEach((orb, i) => { orb.dataset.orbDelay = String(i * 130); orbIO.observe(orb); });
  }

  /* ── 4. SERVICE CARDS: staggered entrance on scroll ── */
  const sdCards = document.querySelectorAll('.sd-card');
  if (sdCards.length) {
    const cardIO = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const idx = Array.from(sdCards).indexOf(e.target);
        setTimeout(() => e.target.classList.add('card-in'), idx * 110);
        cardIO.unobserve(e.target);
      });
    }, { threshold: 0.12 });
    sdCards.forEach(c => cardIO.observe(c));
  }

})();


/* ──────────────────────────────────────────
   Nav active link on scroll
────────────────────────────────────────── */
(function initActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  function updateActive() {
    let current = '';
    sections.forEach(sec => { if (sec.getBoundingClientRect().top < 100) current = sec.id; });
    navLinks.forEach(a => a.classList.toggle('nav-active', a.getAttribute('href') === '#' + current));
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
})();
