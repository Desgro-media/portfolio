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
  /* Reuse the loader already in the HTML — avoids a flash before JS runs */
  const loader = document.querySelector('.page-loader');

  setTimeout(() => {
    revealHero();
    if (loader) {
      loader.classList.add('exit');
      /* Hard-remove after transition + buffer; transitionend is unreliable on mobile */
      setTimeout(() => { try { loader.remove(); } catch(e) {} }, 1000);
    }
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
     CONTACT SECTION — title + columns reveal
  ──────────────────────────────── */
  (function initContactReveal() {
    const title   = document.querySelector('.contact-title');
    const infoCol = document.querySelector('.contact-info-col');
    const formCol = document.querySelector('.contact-form-col');
    const targets = [title, infoCol, formCol].filter(Boolean);
    if (!targets.length) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('anim-in');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.14 });

    targets.forEach(t => obs.observe(t));
  })();

  /* ────────────────────────────────
     CONTACT FORM — AJAX submission via FormSubmit
  ──────────────────────────────── */
  (function initContactForm() {
    const form      = document.getElementById('contactForm');
    const successEl = document.getElementById('cfSuccess');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const btn = form.querySelector('.cf-submit');
      const btnLabel = btn.querySelector('.ct-btn-label') || btn;
      btn.disabled = true;
      btnLabel.textContent = 'Sending…';

      try {
        const data = new FormData(form);
        data.append('_captcha', 'false');
        data.append('_subject', 'New enquiry from Desgro Media website');
        const res = await fetch('https://formsubmit.co/ajax/hello@desgromedia.com', {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: data,
        });
        if (res.ok) {
          form.reset();
          if (successEl) successEl.classList.add('visible');
          setTimeout(() => { if (successEl) successEl.classList.remove('visible'); }, 6000);
        }
      } catch (_) {
        /* silent — user can retry */
      } finally {
        btn.disabled = false;
        btnLabel.textContent = 'Send Message';
      }
    });
  })();

  /* ────────────────────────────────
     MOBILE SERVICE CARD TAP-TO-REVEAL
  ──────────────────────────────── */
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.sd-card').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('.sd-card-arrow')) return;
        const wasActive = card.classList.contains('card-tap-active');
        document.querySelectorAll('.sd-card.card-tap-active')
          .forEach(c => c.classList.remove('card-tap-active'));
        if (!wasActive) card.classList.add('card-tap-active');
      });
    });
  }

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
     CONTACT HERO — dedicated observer adds .ct-played (not .sr)
     so the headline text is NEVER hidden before the observer fires.
  ──────────────────────────────── */
  (function initContactHero() {
    const hero = document.getElementById('ctHero');
    if (!hero) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('ct-played');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.05 });
    io.observe(hero);
  })();


  /* ────────────────────────────────
     3D GLASS ASTERISKS — Three.js WebGL
     Two full-canvas WebGLRenderers (alpha:true) so one canvas sits
     behind the title (z-index 3) and one in front (z-index 15).
     Shape: ExtrudeGeometry of a 6-arm rounded star.
     Material: MeshPhysicalMaterial — dark, glossy, glass-like clearcoat.
     Spring physics + continuous rotation respond to cursor.
  ──────────────────────────────── */
  (function initAsterisk3D() {
    if (typeof THREE === 'undefined') return;

    const hero   = document.getElementById('heroIntroWrap');
    const cBack  = document.getElementById('astCanvasBack');
    const cFront = document.getElementById('astCanvasFront');
    if (!hero || !cBack || !cFront) return;

    /* 6-arm asterisk using one quadratic bezier per arm.
       Control point is the extended tip — gives a clean rounded cap.
       Inner waists are sharp notches (correct for an asterisk).
       This avoids Catmull-Rom tangent artifacts on alternating radii. */
    function makeAstShape(rOut, rIn) {
      const arms  = 6;
      const step  = (2 * Math.PI) / arms;
      const sh    = new THREE.Shape();

      const waist0A = -Math.PI / 2 - step / 2;
      sh.moveTo(rIn * Math.cos(waist0A), rIn * Math.sin(waist0A));

      for (let i = 0; i < arms; i++) {
        const tipA     = i * step - Math.PI / 2;
        const nextWaistA = tipA + step / 2;
        /* Control point slightly beyond the tip → clean convex rounding */
        sh.quadraticCurveTo(
          rOut * Math.cos(tipA) * 1.12,
          rOut * Math.sin(tipA) * 1.12,
          rIn  * Math.cos(nextWaistA),
          rIn  * Math.sin(nextWaistA)
        );
      }

      sh.closePath();
      return sh;
    }

    /* Create a full-viewport WebGL scene on a given canvas */
    function buildScene(canvas, cfg) {
      const W = hero.offsetWidth, H = hero.offsetHeight;
      const isMobile = W < 768;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setSize(W, H);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 2.2;
      renderer.shadowMap.enabled = false;

      const scene  = new THREE.Scene();
      /* Mobile: wider FOV + closer camera so asterisks fill the viewport */
      const fov = isMobile ? 62 : 42;
      const camZ = isMobile ? 6.5 : 10;
      const camera = new THREE.PerspectiveCamera(fov, W / H, 0.1, 100);
      camera.position.z = camZ;

      const geo = new THREE.ExtrudeGeometry(makeAstShape(cfg.rOut, cfg.rIn), {
        depth:          cfg.depth,
        bevelEnabled:   true,
        bevelThickness: cfg.bevel,
        bevelSize:      cfg.bevel * 0.85,
        bevelSegments:  20,
        curveSegments:  56,
      });
      geo.center();

      /* Dark glossy — dark charcoal body, red emissive glow in shadowed areas */
      const mat = new THREE.MeshPhysicalMaterial({
        color:              0x181818,
        emissive:           0xeb2027,
        emissiveIntensity:  cfg.emissive,
        metalness:          0.05,
        roughness:          0.05,
        clearcoat:          1.0,
        clearcoatRoughness: 0.03,
        reflectivity:       1.0,
      });

      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);

      scene.add(new THREE.AmbientLight(0x222222, 4));

      const key = new THREE.PointLight(0xffffff, 80, 50);
      key.position.set(-4, 6, 8);
      scene.add(key);

      const key2 = new THREE.PointLight(0xffeedd, 40, 45);
      key2.position.set(5, 3, 6);
      scene.add(key2);

      /* Red fill — signature red glow on edges */
      const redFront = new THREE.PointLight(0xeb2027, 20, 25);
      redFront.position.set(0, -3, 5);
      scene.add(redFront);

      const redBack = new THREE.PointLight(0xeb2027, 12, 20);
      redBack.position.set(-3, 3, -5);
      scene.add(redBack);

      const rim = new THREE.PointLight(0x334466, 8, 22);
      rim.position.set(2, -6, -3);
      scene.add(rim);

      window.addEventListener('resize', () => {
        const nW = hero.offsetWidth, nH = hero.offsetHeight;
        const nm = nW < 768;
        camera.fov = nm ? 62 : 42;
        camera.position.z = nm ? 6.5 : 10;
        camera.aspect = nW / nH;
        camera.updateProjectionMatrix();
        renderer.setSize(nW, nH);
      }, { passive: true });

      return { renderer, scene, camera, mesh };
    }

    /* Back: bigger, upper-left quadrant — rIn narrow for clear arm separation */
    const back  = buildScene(cBack,  { rOut: 2.10, rIn: 0.52, depth: 0.70, bevel: 0.16, emissive: 0.30 });
    /* Front: slightly smaller, lower-right */
    const front = buildScene(cFront, { rOut: 1.65, rIn: 0.40, depth: 0.58, bevel: 0.12, emissive: 0.18 });

    /* ── Spring / cursor tracking ── */
    let mx = 0, my = 0;
    let smx = 0, smy = 0;
    let vmx = 0, vmy = 0;
    let inside = false;

    hero.addEventListener('mousemove', e => {
      const r = hero.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width  - 0.5;
      my = (e.clientY - r.top)  / r.height - 0.5;
      inside = true;
    });
    hero.addEventListener('mouseleave', () => { inside = false; });

    /* Pause rendering when hero is not visible — saves 2 WebGL draws/frame */
    let astActive = true;
    new IntersectionObserver(([e]) => { astActive = e.isIntersecting; }, { threshold: 0 }).observe(hero);

    /* Cache mobile breakpoint; re-evaluate only on resize */
    let mob = window.innerWidth < 768;
    window.addEventListener('resize', () => { mob = window.innerWidth < 768; }, { passive: true });

    function animate() {
      requestAnimationFrame(animate);
      if (!astActive) return;

      const tx = inside ? mx : 0, ty = inside ? my : 0;
      /* tighter spring = snappier cursor response */
      vmx = vmx * 0.72 + (tx - smx) * 0.12;
      vmy = vmy * 0.72 + (ty - smy) * 0.12;
      smx += vmx; smy += vmy;

      /* Back: upper-left — tighter positions on mobile so it stays on-screen */
      back.mesh.position.x  = (mob ? -2.0 : -3.8) + smx * (mob ? 1.4 : 3.0);
      back.mesh.position.y  = (mob ?  0.9 :  1.4) - smy * (mob ? 1.0 : 2.0);
      back.mesh.position.z  = mob ? 0.8 : 0;
      back.mesh.rotation.z -= 0.0024;
      back.mesh.rotation.x  = smy * 1.0;
      back.mesh.rotation.y  = smx * 0.85;
      back.renderer.render(back.scene, back.camera);

      /* Front: lower-right — same treatment */
      front.mesh.position.x  = (mob ?  1.8 :  3.2) - smx * (mob ? 1.0 : 2.0);
      front.mesh.position.y  = (mob ? -1.1 : -1.8) + smy * (mob ? 0.7 : 1.4);
      front.mesh.position.z  = mob ? 0.8 : 0;
      front.mesh.rotation.z += 0.0017;
      front.mesh.rotation.x  = -smy * 0.70;
      front.mesh.rotation.y  = -smx * 0.55;
      front.renderer.render(front.scene, front.camera);
    }
    /* Force an immediate render so the canvas has pixels before the RAF loop fires.
       On mobile (Android Chrome) requestAnimationFrame is throttled until the first
       user interaction — without this the canvas stays blank even when opacity-in. */
    back.renderer.render(back.scene, back.camera);
    front.renderer.render(front.scene, front.camera);
    animate();

    /* Fade in as the loader exits — force a fresh render before revealing */
    const fadeMs = 1600;
    setTimeout(() => {
      back.renderer.render(back.scene, back.camera);
      cBack.classList.add('ast-visible');
      setTimeout(() => {
        front.renderer.render(front.scene, front.camera);
        cFront.classList.add('ast-visible');
      }, 300);
    }, fadeMs);

    /* Mobile fallback: if the user touches before the timer fires, show immediately */
    document.addEventListener('touchstart', function onFirstTouch() {
      back.renderer.render(back.scene, back.camera);
      front.renderer.render(front.scene, front.camera);
      cBack.classList.add('ast-visible');
      cFront.classList.add('ast-visible');
    }, { once: true, passive: true });
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
      const inner = exitingCard._inner;
      if (inner) inner.style.transform = '';
      exitingCard.classList.remove('card-hovered');
      exitingCard  = null;
      exitProgress = 0;
    }
    if (!hoveredCard) return;
    const inner = hoveredCard._inner;
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
        const pi = exitingCard._inner;
        if (pi) pi.style.transform = '';
        exitingCard.classList.remove('card-hovered');
      }
      exitingCard  = hoveredCard;
      exitingCard._inner = hoveredCard._inner;
      exitProgress = hoverProgress;
      exitingCard.classList.remove('card-hovered');
      hoveredCard   = null;
      hoverProgress = 0;
      hoverDir      = 0;
    }

    hoveredCard = card;
    hoveredCard._inner = card.querySelector('.card-inner'); /* cache once */
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
    const inner = hoveredCard._inner;
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
      const inner = exitingCard._inner;
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
        const inner = hoveredCard._inner;
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
    const THRESHOLDS = [0.08, 0.42, 0.74];
    let scrollyPending = false;

    function updateScrolly() {
      if (scrollyPending) return;
      scrollyPending = true;
      requestAnimationFrame(() => {
        scrollyPending = false;
        const rect       = scrollyOuter.getBoundingClientRect();
        const scrollable = scrollyOuter.offsetHeight - window.innerHeight;
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const progress = scrollable > 0 ? Math.max(0, Math.min(1, -rect.top / scrollable)) : 1;
        stmts.forEach((s, i) => s.classList.toggle('active', progress >= THRESHOLDS[i]));
      });
    }

    window.addEventListener('scroll', updateScrolly, { passive: true });

  } else if (stmts.length) {
    /* No .sd-scrolly-outer in the DOM — reveal each statement on scroll-into-view */
    const stmtIO = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const i = Array.from(stmts).indexOf(e.target);
        setTimeout(() => e.target.classList.add('active'), i * 220);
        stmtIO.unobserve(e.target);
      });
    }, { threshold: 0.25 });
    stmts.forEach(s => stmtIO.observe(s));
  }

  /* ── 2. STAT ROW COUNTER: animates 0 → target, then suffix springs ── */
  function runRowCounter(row) {
    const target = parseInt(row.dataset.val, 10);
    const numEl  = row.querySelector('.sd-stat-num');
    const sufEl  = row.querySelector('.sd-stat-suf');
    if (!numEl || isNaN(target)) return;
    const duration = 1800;
    const start    = performance.now();
    (function tick(now) {
      const p    = Math.min(1, (now - start) / duration);
      const ease = 1 - Math.pow(1 - p, 3);
      numEl.textContent = Math.floor(ease * target);
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        numEl.textContent = target;
        /* Suffix spring bounce when counter lands */
        if (sufEl) {
          sufEl.style.transform = 'scale(1.35) translateY(-4px)';
          setTimeout(() => { sufEl.style.transform = ''; }, 380);
        }
      }
    })(start);
  }

  /* ── 3. STAT ROW ENTRANCE + COUNTER trigger ── */
  const statRows = document.querySelectorAll('.sd-stat-row');
  if (statRows.length) {
    const rowIO = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const row   = e.target;
        const delay = parseInt(row.dataset.rowDelay || '0', 10);
        setTimeout(() => { row.classList.add('row-in'); runRowCounter(row); }, delay);
        rowIO.unobserve(row);
      });
    }, { threshold: 0.2 });

    statRows.forEach((row, i) => { row.dataset.rowDelay = String(i * 120); rowIO.observe(row); });
  }

  /* ── 4. SERVICE CARDS: staggered entrance on scroll ── */
  const sdCards = document.querySelectorAll('.sd-card');
  if (sdCards.length) {
    const cardIO = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const idx = Array.from(sdCards).indexOf(e.target);
        setTimeout(() => e.target.classList.add('card-in'), idx * 90);
        cardIO.unobserve(e.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
    sdCards.forEach(c => cardIO.observe(c));
  }

})();


/* ──────────────────────────────────────────
   Nav active link on scroll
────────────────────────────────────────── */
(function initActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  let activePending = false;

  function updateActive() {
    if (activePending) return;
    activePending = true;
    requestAnimationFrame(() => {
      activePending = false;
      let current = '';
      sections.forEach(sec => { if (sec.getBoundingClientRect().top < 100) current = sec.id; });
      navLinks.forEach(a => a.classList.toggle('nav-active', a.getAttribute('href') === '#' + current));
    });
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
})();


/* ──────────────────────────────────────────
   PERSONALITIES — 3D tilt + holographic shine
────────────────────────────────────────── */
(function initPersCards() {
  const cards  = document.querySelectorAll('.pers-card');
  if (!cards.length) return;

  const MAX_TILT  = 18;
  const MAX_TRANS = 12;
  const isMobile  = () => window.matchMedia('(hover: none)').matches;

  function applyTilt(card, dx, dy, sx, sy) {
    const shine = card.querySelector('.pers-shine');
    const rotY  =  dx * MAX_TILT;
    const rotX  = -dy * MAX_TILT;

    card.style.transform =
      `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(${MAX_TRANS}px) scale(1.04)`;
    card.style.boxShadow =
      `${-dx * 20}px ${-dy * 20}px 60px rgba(0,0,0,0.75),
       0 0 0 1.5px rgba(255,255,255,0.14)`;

    if (shine) {
      shine.style.background =
        `radial-gradient(circle at ${sx}% ${sy}%, rgba(255,255,255,0.24) 0%, transparent 58%)`;
      shine.style.opacity = '1';
    }
  }

  function resetCard(card) {
    const shine = card.querySelector('.pers-shine');
    card.style.transition = 'transform 0.65s cubic-bezier(0.23,1,0.32,1), box-shadow 0.65s ease';
    card.style.transform  = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)';
    card.style.boxShadow  = '0 20px 60px rgba(0,0,0,0.6)';
    if (shine) shine.style.opacity = '0';
  }

  /* Desktop: mouse tracking */
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.12s ease, box-shadow 0.3s ease';
    });

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const dx   = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
      const dy   = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
      const sx   = ((e.clientX - rect.left) / rect.width)  * 100;
      const sy   = ((e.clientY - rect.top)  / rect.height) * 100;
      applyTilt(card, dx, dy, sx, sy);
    });

    card.addEventListener('mouseleave', () => resetCard(card));
  });

  /* Mobile: touch tilt on individual card */
  cards.forEach(card => {
    let touchActive = false;

    card.addEventListener('touchstart', () => {
      touchActive = true;
      card.style.transition = 'transform 0.12s ease, box-shadow 0.3s ease';
    }, { passive: true });

    card.addEventListener('touchmove', e => {
      if (!touchActive) return;
      const touch = e.touches[0];
      const rect  = card.getBoundingClientRect();
      const dx    = (touch.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
      const dy    = (touch.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
      const sx    = ((touch.clientX - rect.left) / rect.width)  * 100;
      const sy    = ((touch.clientY - rect.top)  / rect.height) * 100;
      applyTilt(card, Math.max(-1, Math.min(1, dx)), Math.max(-1, Math.min(1, dy)), sx, sy);
    }, { passive: true });

    card.addEventListener('touchend', () => {
      touchActive = false;
      resetCard(card);
    });
  });

  /* Mobile: gyroscope tilt */
  if (window.DeviceOrientationEvent) {
    let baseBeta = null, baseGamma = null;

    window.addEventListener('deviceorientation', e => {
      if (!isMobile()) return;
      if (baseBeta  === null) baseBeta  = e.beta;
      if (baseGamma === null) baseGamma = e.gamma;

      const dy = Math.max(-1, Math.min(1, (e.beta  - baseBeta)  / 20));
      const dx = Math.max(-1, Math.min(1, (e.gamma - baseGamma) / 20));

      cards.forEach(card => {
        const shine = card.querySelector('.pers-shine');
        card.style.transition = 'transform 0.1s ease';
        card.style.transform  =
          `perspective(800px) rotateX(${-dy * 10}deg) rotateY(${dx * 10}deg) translateZ(4px)`;
        if (shine) {
          shine.style.background =
            `radial-gradient(circle at ${50 + dx * 40}% ${50 + dy * 40}%, rgba(255,255,255,0.16) 0%, transparent 60%)`;
          shine.style.opacity = '0.7';
        }
      });
    }, { passive: true });
  }

  /* ── Seamless marquee: clone the track so the loop never jumps ── */
  const row   = document.querySelector('.pers-reel-row');
  const track = document.querySelector('.pers-reel-track');
  if (!row || !track) return;

  const clone = track.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  /* cloned videos should also autoplay */
  clone.querySelectorAll('video').forEach(v => { v.muted = true; v.play().catch(() => {}); });
  row.appendChild(clone);

  /* Scroll-in entry animation (original cards only) */
  const origCards = track.querySelectorAll('.pers-card');
  
  /* Force play original videos in case CDN (like Cloudflare) strips autoplay attribute */
  origCards.forEach(card => {
    const v = card.querySelector('video');
    if (v) { v.muted = true; v.play().catch(() => {}); }
  });
  const io = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    origCards.forEach((card, i) => {
      card.style.opacity   = '0';
      card.style.transform = `perspective(800px) rotateX(22deg) translateY(70px)`;
      setTimeout(() => {
        card.style.transition = 'transform 0.9s cubic-bezier(0.16,1,0.3,1), opacity 0.75s ease';
        card.style.opacity    = '1';
        card.style.transform  = 'perspective(800px) rotateX(0deg) translateY(0px)';
      }, i * 110);
    });
    io.disconnect();
  }, { threshold: 0.15 });

  io.observe(row);
})();




/* ── NEWS SLIDER ── */
(function () {
  const track = document.querySelector('.news-slider-track');
  if (!track) return;

  const dots  = document.querySelectorAll('.news-dot');
  const prev  = document.querySelector('.news-nav-prev');
  const next  = document.querySelector('.news-nav-next');
  const total = track.querySelectorAll('.news-slide').length;
  let current = 0;
  let timer;

  function goTo(idx) {
    current = (idx + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('news-dot--active', i === current));
  }

  function startAuto() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 4000);
  }

  if (prev) prev.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  if (next) next.addEventListener('click', () => { goTo(current + 1); startAuto(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); startAuto(); }));

  /* Pause on hover, resume on leave */
  track.addEventListener('mouseenter', () => clearInterval(timer));
  track.addEventListener('mouseleave', startAuto);

  /* Pause entirely when scrolled out of view */
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) startAuto();
    else clearInterval(timer);
  }, { threshold: 0.1 }).observe(track);

  /* Touch / swipe */
  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    clearInterval(timer);
  }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 48) goTo(current + (dx < 0 ? 1 : -1));
    startAuto();
  }, { passive: true });

  startAuto();
})();

/* ── WORKS CARD IMAGE SLIDERS ── */
document.querySelectorAll('.wc-imgslider').forEach(slider => {
  const track = slider.querySelector('.wc-imgslider-track');
  const dots  = slider.querySelectorAll('.wc-imgslider-dot');
  const total = track.querySelectorAll('img').length;
  let cur = 0, timer = null;

  function goTo(idx) {
    cur = (idx + total) % total;
    track.style.transform = `translateX(-${cur * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('wc-imgslider-dot--active', i === cur));
  }

  /* Only run while the card is in the viewport */
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) {
      timer = setInterval(() => goTo(cur + 1), 3000);
    } else {
      clearInterval(timer);
      timer = null;
    }
  }, { threshold: 0.1 }).observe(slider);
});

/* ── WORKS CARD MODAL ── */
(function () {
  function openModal(modal) {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /* Open on card click */
  document.querySelectorAll('[data-modal]').forEach(card => {
    card.addEventListener('click', () => {
      const modal = document.getElementById(card.dataset.modal);
      if (modal) openModal(modal);
    });
  });

  /* Each modal: close btn, backdrop, Escape key, gallery slider */
  document.querySelectorAll('.wc-modal').forEach(modal => {
    modal.querySelector('.wc-modal-close')
         .addEventListener('click', () => closeModal(modal));
    modal.querySelector('.wc-modal-backdrop')
         .addEventListener('click', () => closeModal(modal));

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal(modal);
    });

    /* Gallery inside modal */
    const gTrack = modal.querySelector('.wc-modal-gallery-track');
    if (!gTrack) return;
    const gDots  = modal.querySelectorAll('.wc-modal-dot');
    const gTotal = gTrack.querySelectorAll('img').length;
    let gCur = 0, gTimer;

    function gGoTo(idx) {
      gCur = (idx + gTotal) % gTotal;
      gTrack.style.transform = `translateX(-${gCur * 100}%)`;
      gDots.forEach((d, i) => d.classList.toggle('wc-modal-dot--active', i === gCur));
    }

    gDots.forEach((d, i) => d.addEventListener('click', () => {
      gGoTo(i);
      clearInterval(gTimer);
      gTimer = setInterval(() => gGoTo(gCur + 1), 3500);
    }));

    /* Auto-play while open, reset when closed */
    new MutationObserver(() => {
      if (modal.classList.contains('is-open')) {
        gGoTo(0);
        gTimer = setInterval(() => gGoTo(gCur + 1), 3500);
      } else {
        clearInterval(gTimer);
      }
    }).observe(modal, { attributes: true, attributeFilter: ['class'] });
  });
})();


/* ══════════════════════════════════════════════════════
   REVERSE SCROLL PARALLAX
   Multi-layer depth parallax on headings + eyebrows.
   Negative speed = element "lags behind" (feels far).
   Positive speed = element "rushes ahead" (feels close).
   Fully bidirectional — reverse scroll plays it in reverse.

   Bidirectional works card reveal:
   Forward  → cards rise up from below (existing .sr system).
   Backward → cards tilt in 3D and sink back below viewport.
══════════════════════════════════════════════════════ */
(function initReverseParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ── Depth layers ── */
  const layers = [
    { sel: '.works-title',   speed: -0.08 },
    { sel: '.pers-title',    speed: -0.07 },
    { sel: '.tc-heading',    speed: -0.06 },
    { sel: '.sd-why-h',      speed: -0.09 },
    { sel: '.team-title',    speed: -0.05 },
    { sel: '.ct-headline',   speed: -0.07 },
    { sel: '.works-eyebrow', speed:  0.06 },
    { sel: '.pers-eyebrow',  speed:  0.05 },
    { sel: '.tc-eyebrow',    speed:  0.05 },
    { sel: '.sd-eyebrow',    speed:  0.06 },
  ];

  const pItems = [];
  layers.forEach(({ sel, speed }) => {
    document.querySelectorAll(sel).forEach(el => {
      el.style.willChange = 'transform';
      pItems.push({ el, speed });
    });
  });

  /* ── RAF parallax loop ── */
  let rafId = null;

  function tick() {
    rafId = null;
    const vhH   = window.innerHeight;
    const vhMid = vhH * 0.5;

    pItems.forEach(({ el, speed }) => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < -400 || rect.top > vhH + 400) return;
      const fromCentre = (rect.top + rect.height * 0.5) - vhMid;
      el.style.transform = `translateY(${(fromCentre * speed).toFixed(2)}px)`;
    });
  }

  window.addEventListener('scroll', () => {
    if (!rafId) rafId = requestAnimationFrame(tick);
  }, { passive: true });

  requestAnimationFrame(tick);

  /* ── Bidirectional works card reveal ──
     The global .sr observer handles the first reveal (unobserves after).
     This observer keeps watching so reverse scroll can play a creative
     3D sink-back animation when cards exit below the viewport again.  */
  document.querySelectorAll('.works-card').forEach(card => {
    let everSeen = false;

    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        everSeen = true;
        card.style.transition = '';
        card.style.transform  = '';
        card.style.opacity    = '';
        card.classList.add('sr-visible');
      } else if (everSeen && entry.boundingClientRect.top > 0) {
        /* Exiting BELOW viewport = user scrolled back up past the card.
           Creative reverse: tilt forward in 3D then sink back down.   */
        card.style.transition = 'transform 0.55s cubic-bezier(0.4,0,0.2,1), opacity 0.45s ease';
        card.style.transform  = 'perspective(560px) rotateX(14deg) translateY(72px)';
        card.style.opacity    = '0';
        card.classList.remove('sr-visible');
      }
      /* Exiting ABOVE = scrolled down past = leave visible */
    }, { threshold: 0.08 }).observe(card);
  });

})();


/* ── Film strip: cursor-speed control + per-card 3D tilt ── */
(function initFilmStrip() {
  const row   = document.querySelector('.filmstrip-row');
  const inner = document.querySelector('.filmstrip-inner');
  const track = document.querySelector('.filmstrip-track');
  if (!row || !inner || !track) return;

  /* Clone for seamless loop */
  const clone = track.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  inner.appendChild(clone);

  /* ── Delegated tilt: one listener on inner instead of N×2 per-frame ──
     getBoundingClientRect only called when the cursor enters a NEW frame  */
  let activeFrame = null;
  let tiltRect    = null;

  inner.addEventListener('mousemove', e => {
    const frame = e.target.closest('.filmstrip-frame');
    if (!frame) return;
    if (frame !== activeFrame) {
      if (activeFrame) activeFrame.style.transform = '';
      activeFrame = frame;
      tiltRect = frame.getBoundingClientRect();   /* read rect once per frame-change */
    }
    const x = (e.clientX - tiltRect.left) / tiltRect.width  - 0.5;
    const y = (e.clientY - tiltRect.top)  / tiltRect.height - 0.5;
    frame.style.transform = `perspective(480px) rotateY(${x * 18}deg) rotateX(${-y * 12}deg) scale(1.05)`;
  }, { passive: true });

  inner.addEventListener('mouseleave', () => {
    if (activeFrame) { activeFrame.style.transform = ''; activeFrame = null; }
    tiltRect = null;
  });

  /* ── Speed control — cache row rect, only recalculate on resize ── */
  const BASE = 0.65;
  let speed    = BASE;
  let target   = BASE;
  let rowRect  = null;

  const resizeObs = new ResizeObserver(() => { rowRect = null; });
  resizeObs.observe(row);

  row.addEventListener('mousemove', e => {
    if (!rowRect) rowRect = row.getBoundingClientRect();
    const rx = (e.clientX - rowRect.left) / rowRect.width;
    target = BASE * (0.1 + rx * 2.1);
  }, { passive: true });

  row.addEventListener('mouseleave', () => { target = BASE; rowRect = null; });

  /* ── Wait for images to load so natural widths are settled ── */
  const imgs = [...track.querySelectorAll('img')];
  Promise.all(
    imgs.map(img => img.complete
      ? Promise.resolve()
      : new Promise(r => { img.onload = r; img.onerror = r; })
    )
  ).then(() => {
    const trackW = track.scrollWidth;
    let offset   = 0;

    (function loop() {
      speed  += (target - speed) * 0.06;
      offset += speed;
      if (offset >= trackW) offset -= trackW;
      if (offset < 0)       offset += trackW;
      inner.style.transform = `translateX(${-offset}px)`;
      requestAnimationFrame(loop);
    })();
  });
})();
