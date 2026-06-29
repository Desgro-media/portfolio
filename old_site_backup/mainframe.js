'use strict';

/* ============================================================
   MAINFRAME — mainframe.js
   Full-screen hero interactivity
   ============================================================ */

/* ──────────────────────────────────────────
   VIDEO MOUSE-SCRUB
   - No autoplay; scrubs forward/back on horizontal mouse movement
   - SENSITIVITY = 0.8: full window-width swipe = 80% of video duration
   - seek-flood prevention via onSeeked queue
────────────────────────────────────────── */
(function initVideoScrub() {
  const video = document.getElementById('mf-video');
  if (!video) return;

  const SENSITIVITY = 0.8;
  let prevX      = null;
  let targetTime = 0;
  let seeking    = false;

  /* Once metadata loads, park at frame 0 */
  video.addEventListener('loadedmetadata', function () {
    targetTime = 0;
    video.currentTime = 0;
  });

  /* After each seek completes, check if target moved again */
  function onSeeked() {
    seeking = false;
    if (Math.abs(targetTime - video.currentTime) > 0.016) {
      seeking = true;
      video.currentTime = targetTime;
    }
  }
  video.addEventListener('seeked', onSeeked);

  /* Mouse-move handler */
  window.addEventListener('mousemove', function (e) {
    if (prevX === null) { prevX = e.clientX; return; }

    const delta = e.clientX - prevX;
    prevX = e.clientX;

    if (!video.duration) return;

    const offset = (delta / window.innerWidth) * SENSITIVITY * video.duration;
    targetTime = Math.max(0, Math.min(video.duration, targetTime + offset));

    if (!seeking) {
      seeking = true;
      video.currentTime = targetTime;
    }
  }, { passive: true });
})();


/* ──────────────────────────────────────────
   TYPEWRITER EFFECT
   Reveals text one character at a time after startDelay ms.
   Cursor blinks while typing; hides when done.
────────────────────────────────────────── */
(function initTypewriter() {
  const textEl  = document.getElementById('mf-typewriter-text');
  const cursor  = document.getElementById('mf-cursor');
  if (!textEl) return;

  const FULL_TEXT   = "Glad you stopped in. Good taste tends to find us. Now, what are we building?";
  const SPEED_MS    = 38;   /* ms per character */
  const START_DELAY = 600;  /* ms before typing begins */

  let charIndex = 0;

  setTimeout(function () {
    var interval = setInterval(function () {
      charIndex++;
      textEl.textContent = FULL_TEXT.slice(0, charIndex);

      if (charIndex >= FULL_TEXT.length) {
        clearInterval(interval);
        if (cursor) cursor.classList.add('mf-hidden');
      }
    }, SPEED_MS);
  }, START_DELAY);
})();


/* ──────────────────────────────────────────
   PILL BUTTONS FADE-IN (400ms after load)
   Independent of typewriter animation.
────────────────────────────────────────── */
(function initPillReveal() {
  var pills = document.getElementById('mf-pills');
  if (!pills) return;

  setTimeout(function () {
    pills.classList.add('mf-visible');
  }, 400);
})();


/* ──────────────────────────────────────────
   CLIPBOARD COPY — Email pill
────────────────────────────────────────── */
(function initCopyEmail() {
  var btn = document.getElementById('mf-email-pill');
  if (!btn) return;

  var emailAddress = 'hello@mainframe.co';

  btn.addEventListener('click', function () {
    /* Modern clipboard API */
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(emailAddress).catch(function () {
        fallbackCopy(emailAddress);
      });
    } else {
      fallbackCopy(emailAddress);
    }

    /* Visual feedback: briefly replace email text */
    var emailSpan = btn.querySelector('.mf-email-underline');
    if (emailSpan) {
      var original = emailSpan.textContent;
      emailSpan.textContent = 'Copied!';
      setTimeout(function () {
        emailSpan.textContent = original;
      }, 1500);
    }
  });

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity  = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* silent fail */ }
    document.body.removeChild(ta);
  }
})();


/* ──────────────────────────────────────────
   HAMBURGER / MOBILE OVERLAY
────────────────────────────────────────── */
(function initHamburger() {
  var hamburger = document.getElementById('mf-hamburger');
  var overlay   = document.getElementById('mf-mobile-overlay');
  if (!hamburger || !overlay) return;

  function openMenu() {
    hamburger.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    if (overlay.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  /* Close when any link inside overlay is tapped */
  overlay.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /* Close on Escape key */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      closeMenu();
    }
  });
})();
