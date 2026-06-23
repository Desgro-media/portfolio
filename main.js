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


/* ──────────────────────────────────────────
   Scroll-fade
────────────────────────────────────────── */
(function initFadeIn() {
  const targets = document.querySelectorAll('.hero-bottom-row, .video-section, .team-header, .contact-inner');
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
  const POP_Z     = 220;
  const POP_SCALE = 1.45;

  /* ── Hover animation durations (ms) ── */
  const HOVER_IN_MS  = 480;
  const HOVER_OUT_MS = 360;

  /* ── Physics ── */
  const FRICTION   = 0.96;
  const IDLE_SPEED = 0.28;
  const MAX_VEL    = 8;
  /*
   * Idle nudge: exact amount to add each frame so that after FRICTION is
   * applied, velocity holds at IDLE_SPEED.
   * Derivation: (v + I) * FRICTION = v  →  I = v * (1/FRICTION − 1)
   */
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
  let angleAtHoverStart = 0;

  /* ── Easing ── */
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  /* ── Render ring ── */
  function setRingAngle(deg) {
    track.style.transform =
      `rotateX(${TILT_X}deg) rotateZ(${TILT_Z}deg) rotateY(${deg}deg)`;
  }

  /* ── Build hover card transform for progress p ── */
  function buildHoverTransform(card, p) {
    const baseAngle = parseFloat(card.dataset.baseAngle);
    const totalY    = currentAngle + baseAngle;
    const ep        = easeOutCubic(p);
    return `rotateY(${-totalY * ep}deg) rotateZ(${-TILT_Z * ep}deg) rotateX(${-TILT_X * ep}deg) translateZ(${POP_Z * ep}px) scale(${1 + (POP_SCALE - 1) * ep})`;
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

    hoveredCard       = card;
    angleAtHoverStart = currentAngle;
    hoverDir          = 1;
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
     Eliminates the two-loop race condition that caused jitter.

     Idle spin: instead of a setInterval jerk, we add IDLE_NUDGE
     each frame when velocity < IDLE_SPEED so the ring smoothly
     ramps back up after slowing — no sudden kick.
  ════════════════════════════════════════════════════════ */
  function masterLoop(now) {
    const dt = prevTime ? Math.min(now - prevTime, 50) : 16;
    prevTime = now;

    /* ── 1. Idle spin — smooth ramp, no jerk ── */
    if (!dragging && !hoveredCard && velocity < IDLE_SPEED) {
      velocity = Math.min(IDLE_SPEED, velocity + IDLE_NUDGE);
    }

    /* ── 2. Friction + advance angle ── */
    if (!dragging) {
      velocity *= FRICTION;
    }
    currentAngle += velocity;
    setRingAngle(currentAngle);

    /* ── 3. Safety: exit hover if ring has spun too far ── */
    if (hoveredCard && hoverDir === 1 && Math.abs(currentAngle - angleAtHoverStart) > 38) {
      startHoverExit(hoveredCard);
    }

    /* ── 4. Animate retreating card back into ring ── */
    if (exitingCard) {
      exitProgress = Math.max(0, exitProgress - dt / HOVER_OUT_MS);
      const inner = exitingCard.querySelector('.card-inner');
      if (exitProgress === 0) {
        if (inner) inner.style.transform = '';
        exitingCard = null;
      } else if (inner) {
        inner.style.transform = buildHoverTransform(exitingCard, exitProgress);
      }
    }

    /* ── 5. Animate hovered card in / out ── */
    if (hoverDir !== 0 || hoveredCard) {
      if (hoverDir === 1) {
        hoverProgress = Math.min(1, hoverProgress + dt / HOVER_IN_MS);
      } else if (hoverDir === -1) {
        hoverProgress = Math.max(0, hoverProgress - dt / HOVER_OUT_MS);
        if (hoverProgress === 0) { finishHoverExit(); }
      }
      if (hoveredCard) {
        const inner = hoveredCard.querySelector('.card-inner');
        if (inner) inner.style.transform = buildHoverTransform(hoveredCard, hoverProgress);
      }
    }

    requestAnimationFrame(masterLoop);
  }

  /* Boot */
  setRingAngle(0);
  requestAnimationFrame(masterLoop);

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
