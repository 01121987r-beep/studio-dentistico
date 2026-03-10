const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');

if (header && toggle) {
  toggle.addEventListener('click', () => {
    const isOpen = header.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  header.querySelectorAll('.mobile-nav a').forEach((link) => {
    link.addEventListener('click', () => {
      header.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const reviewTrack = document.querySelector('.reviews-track');

if (reviewTrack) {
  const originalCards = Array.from(reviewTrack.querySelectorAll('.review-card'));
  const marquee = document.createElement('div');
  marquee.className = 'reviews-marquee';
  originalCards.forEach((card) => marquee.appendChild(card));
  reviewTrack.appendChild(marquee);

  let setWidth = 0;
  let offset = 0;
  let paused = false;
  let lastTime = 0;
  let isPointerDown = false;
  let pointerStartX = 0;
  let startOffset = 0;
  let resumeTimer = null;
  let animationStarted = false;

  if (originalCards.length) {
    const cloneFragment = document.createDocumentFragment();
    originalCards.forEach((card) => {
      cloneFragment.appendChild(card.cloneNode(true));
    });
    marquee.appendChild(cloneFragment);
  }

  const applyOffset = () => {
    marquee.style.transform = `translate3d(${-offset}px, 0, 0)`;
  };

  const normalizeLoop = () => {
    if (setWidth <= 0) {
      return;
    }

    while (offset >= setWidth) {
      offset -= setWidth;
    }

    while (offset < 0) {
      offset += setWidth;
    }
  };

  const calcSetWidth = () => {
    const style = window.getComputedStyle(marquee);
    const gap = parseFloat(style.gap || '0') || 0;
    setWidth = originalCards.reduce((sum, card) => sum + card.getBoundingClientRect().width, 0);
    if (originalCards.length > 1) {
      setWidth += gap * (originalCards.length - 1);
    }
    normalizeLoop();
    applyOffset();
  };

  const autoScroll = (time) => {
    if (!lastTime) {
      lastTime = time;
    }
    const delta = time - lastTime;
    lastTime = time;

    if (!paused && setWidth > 0) {
      offset += delta * 0.03;
      normalizeLoop();
      applyOffset();
    }
    requestAnimationFrame(autoScroll);
  };

  reviewTrack.addEventListener('pointerdown', (event) => {
    isPointerDown = true;
    paused = true;
    pointerStartX = event.clientX;
    startOffset = offset;
    reviewTrack.classList.add('is-dragging');
    if (reviewTrack.setPointerCapture) {
      try {
        reviewTrack.setPointerCapture(event.pointerId);
      } catch (_error) {}
    }
  });

  reviewTrack.addEventListener('pointermove', (event) => {
    if (!isPointerDown) {
      return;
    }
    const deltaX = event.clientX - pointerStartX;
    offset = startOffset - deltaX;
    normalizeLoop();
    applyOffset();
  });

  const endDrag = (event) => {
    if (!isPointerDown) {
      return;
    }
    isPointerDown = false;
    reviewTrack.classList.remove('is-dragging');
    normalizeLoop();
    paused = false;
    if (event && reviewTrack.releasePointerCapture) {
      try {
        reviewTrack.releasePointerCapture(event.pointerId);
      } catch (_error) {}
    }
  };

  reviewTrack.addEventListener('pointerup', endDrag);
  reviewTrack.addEventListener('pointercancel', endDrag);
  reviewTrack.addEventListener('lostpointercapture', endDrag);

  reviewTrack.addEventListener('wheel', (event) => {
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (Math.abs(delta) < 1) {
      return;
    }
    event.preventDefault();
    paused = true;
    offset += delta;
    normalizeLoop();
    applyOffset();
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      paused = false;
    }, 900);
  }, { passive: false });

  const startCarousel = () => {
    if (animationStarted) {
      return;
    }
    calcSetWidth();
    normalizeLoop();
    if (setWidth > 0) {
      animationStarted = true;
      applyOffset();
      requestAnimationFrame(autoScroll);
    }
  };

  offset = 0;
  applyOffset();
  window.addEventListener('load', startCarousel, { once: true });
  requestAnimationFrame(startCarousel);
  window.addEventListener('resize', () => {
    calcSetWidth();
    normalizeLoop();
  });
}

const form = document.querySelector('#contactForm');
const status = document.querySelector('#formStatus');

if (form && status) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const message = String(data.get('message') || '').trim();
    const privacyConsent = data.get('privacyConsent');

    if (!name || !email || !message || !privacyConsent) {
      status.textContent = 'Compila i campi obbligatori e accetta la privacy prima di inviare.';
      status.style.color = '#b91c1c';
      return;
    }

    status.textContent = 'Richiesta ricevuta. Ti ricontatteremo al più presto.';
    status.style.color = '#0284c7';
    form.reset();
  });
}
