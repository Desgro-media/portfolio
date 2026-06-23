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
  let rafId        = null;
  let dragging     = false;

  /* ── Hover state ── */
  let hoveredCard      = null;  // card currently animating OUT
  let hoverProgress    = 0;     // 0 = in ring, 1 = fully out & straight
  let hoverDir         = 0;     // 1 = entering, -1 = exiting

  let exitingCard      = null;  // previous card retreating back into ring
  let exitProgress     = 0;     // its progress (counts down to 0)

  let hoverExitTimer   = null;  // debounce timer for mouseleave
  let prevHoverTime    = 0;
  let angleAtHoverStart = 0;

  /* ── Easing ── */
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  /* ── Render ring ── */
  function setRingAngle(deg) {
    track.style.transform =
      `rotateX(${TILT_X}deg) rotateZ(${TILT_Z}deg) rotateY(${deg}deg)`;
  }

  /* ── Momentum physics ── */
  const FRICTION = 0.90;

  function tick() {
    velocity     *= FRICTION;
    currentAngle += velocity;
    setRingAngle(currentAngle);

    if (Math.abs(velocity) < 0.004) {
      velocity = 0;
      rafId = null;
      return;
    }
    rafId = requestAnimationFrame(tick);
  }

  function kick() {
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  /* ── Build the counter-rotation transform string for a card at progress p ── */
  function buildHoverTransform(card, p) {
    const baseAngle = parseFloat(card.dataset.baseAngle);
    const totalY = currentAngle + baseAngle;
    const ep = easeOutCubic(p);
    return `rotateY(${-totalY * ep}deg) rotateZ(${-TILT_Z * ep}deg) rotateX(${-TILT_X * ep}deg) translateZ(${POP_Z * ep}px) scale(${1 + (POP_SCALE - 1) * ep})`;
  }

  /* ────────────────────────────────
     HOVER HELPERS
  ──────────────────────────────── */

  /* Instant snap-back — used when drag starts */
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

    /* Cancel any pending debounced exit */
    if (hoverExitTimer) { clearTimeout(hoverExitTimer); hoverExitTimer = null; }

    /* Re-entering the same card while it was exiting — just reverse */
    if (hoveredCard === card) {
      hoverDir = 1;
      card.classList.add('card-hovered');
      return;
    }

    /* Entering a NEW card — retire the current hovered card to exitingCard */
    if (hoveredCard) {
      /* If something was already retreating, snap it instantly to clear the slot */
      if (exitingCard) {
        const prevInner = exitingCard.querySelector('.card-inner');
        if (prevInner) prevInner.style.transform = '';
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

  /* Debounced exit — 60 ms grace period to absorb gap-crossing events */
  function startHoverExit(card) {
    if (!hoveredCard || hoveredCard !== card) return;
    if (hoverExitTimer) clearTimeout(hoverExitTimer);
    hoverExitTimer = setTimeout(() => {
      hoverExitTimer = null;
      /* Guard: hoveredCard may have changed during the timeout */
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
     DRAG (mouse + touch)
  ──────────────────────────────── */
  let lastDragX = 0;
  let lastDragT = 0;

  function onDragStart(x) {
    clearHover();
    dragging  = true;
    lastDragX = x;
    lastDragT = performance.now();
    velocity  = 0;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }

  function onDragMove(x) {
    if (!dragging) return;
    const dx  = x - lastDragX;
    const dt  = performance.now() - lastDragT;
    velocity  = (dx / (dt || 1)) * 0.7;
    velocity  = Math.max(-3, Math.min(3, velocity));
    currentAngle += dx * 0.10;
    setRingAngle(currentAngle);
    lastDragX = x;
    lastDragT = performance.now();
  }

  function onDragEnd() {
    if (!dragging) return;
    dragging = false;
    kick();
  }

  viewport.addEventListener('mousedown', e => { onDragStart(e.clientX); e.preventDefault(); });
  window.addEventListener('mousemove',   e => { if (dragging) onDragMove(e.clientX); });
  window.addEventListener('mouseup',     onDragEnd);

  viewport.addEventListener('touchstart', e => { onDragStart(e.touches[0].clientX); }, { passive: true });
  viewport.addEventListener('touchmove',  e => { if (dragging) onDragMove(e.touches[0].clientX); }, { passive: true });
  viewport.addEventListener('touchend',   onDragEnd);

  viewport.addEventListener('mouseleave', () => { if (hoveredCard) startHoverExit(hoveredCard); });

  /* ────────────────────────────────
     SCROLL acceleration (gentle)
  ──────────────────────────────── */
  let inView = false;
  const visIO = new IntersectionObserver(en => { inView = en[0].isIntersecting; }, { threshold: 0.2 });
  visIO.observe(viewport);

  window.addEventListener('wheel', e => {
    if (!inView) return;
    velocity += e.deltaY * 0.006;
    velocity = Math.max(-3, Math.min(3, velocity));
    kick();
  }, { passive: true });

  /* ────────────────────────────────
     CARD HOVER EVENTS
  ──────────────────────────────── */
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => startHoverEnter(card));
    card.addEventListener('mouseleave', () => startHoverExit(card));
  });

  /* ────────────────────────────────
     HOVER LOOP — runs every frame
     Tracks two cards simultaneously:
       hoveredCard  — animating out (or holding at p=1)
       exitingCard  — previous card retreating back into ring
     This eliminates glitches when the cursor crosses between cards.
  ──────────────────────────────── */
  function hoverLoop(now) {
    const dt = prevHoverTime ? Math.min(now - prevHoverTime, 50) : 16;
    prevHoverTime = now;

    /* Safety: auto-exit if ring spun far while card is out */
    if (hoveredCard && hoverDir === 1 && Math.abs(currentAngle - angleAtHoverStart) > 38) {
      startHoverExit(hoveredCard);
    }

    /* ── Animate retreating card back into ring ── */
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

    /* ── Animate the currently hovered card ── */
    if (hoverDir !== 0 || hoveredCard) {
      if (hoverDir === 1) {
        hoverProgress = Math.min(1, hoverProgress + dt / HOVER_IN_MS);
      } else if (hoverDir === -1) {
        hoverProgress = Math.max(0, hoverProgress - dt / HOVER_OUT_MS);
        if (hoverProgress === 0) {
          finishHoverExit();
          requestAnimationFrame(hoverLoop);
          return;
        }
      }

      if (hoveredCard) {
        const inner = hoveredCard.querySelector('.card-inner');
        if (inner) inner.style.transform = buildHoverTransform(hoveredCard, hoverProgress);
      }
    }

    requestAnimationFrame(hoverLoop);
  }
  requestAnimationFrame(hoverLoop);

  /* ── Idle auto-spin ── */
  const IDLE_SPEED = 0.15;

  setInterval(() => {
    if (!dragging && !hoveredCard && Math.abs(velocity) < 0.02) {
      velocity = IDLE_SPEED;
      kick();
    }
  }, 1000);

  /* Boot */
  setRingAngle(0);
  setTimeout(() => { velocity = IDLE_SPEED; kick(); }, 600);

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
