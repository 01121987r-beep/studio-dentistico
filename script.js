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
  let setWidth = 0;
  let paused = false;
  let lastTime = 0;
  let isPointerDown = false;
  let pointerStartX = 0;
  let startScrollLeft = 0;

  if (originalCards.length) {
    const cloneFragment = document.createDocumentFragment();
    originalCards.forEach((card) => {
      cloneFragment.appendChild(card.cloneNode(true));
    });
    reviewTrack.appendChild(cloneFragment);
  }

  const calcSetWidth = () => {
    const style = window.getComputedStyle(reviewTrack);
    const gap = parseFloat(style.gap || '0') || 0;
    setWidth = originalCards.reduce((sum, card) => sum + card.getBoundingClientRect().width, 0);
    if (originalCards.length > 1) {
      setWidth += gap * (originalCards.length - 1);
    }
    if (reviewTrack.scrollLeft >= setWidth && setWidth > 0) {
      reviewTrack.scrollLeft -= setWidth;
    }
  };

  const autoScroll = (time) => {
    if (!lastTime) {
      lastTime = time;
    }
    const delta = time - lastTime;
    lastTime = time;

    if (!paused && setWidth > 0) {
      reviewTrack.scrollLeft += delta * 0.045;
      if (reviewTrack.scrollLeft >= setWidth) {
        reviewTrack.scrollLeft -= setWidth;
      }
    }
    requestAnimationFrame(autoScroll);
  };

  const normalizeLoop = () => {
    if (setWidth <= 0) {
      return;
    }
    while (reviewTrack.scrollLeft >= setWidth) {
      reviewTrack.scrollLeft -= setWidth;
    }
    while (reviewTrack.scrollLeft < 0) {
      reviewTrack.scrollLeft += setWidth;
    }
  };

  reviewTrack.addEventListener('mouseenter', () => {
    paused = true;
  });
  reviewTrack.addEventListener('mouseleave', () => {
    if (!isPointerDown) {
      paused = false;
    }
  });
  reviewTrack.addEventListener('touchstart', () => {
    paused = true;
  }, { passive: true });
  reviewTrack.addEventListener('touchend', () => {
    paused = false;
  });

  reviewTrack.addEventListener('pointerdown', (event) => {
    isPointerDown = true;
    paused = true;
    pointerStartX = event.clientX;
    startScrollLeft = reviewTrack.scrollLeft;
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
    reviewTrack.scrollLeft = startScrollLeft - deltaX;
    normalizeLoop();
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
    reviewTrack.scrollLeft += delta;
    normalizeLoop();
    clearTimeout(reviewTrack._resumeTimer);
    reviewTrack._resumeTimer = setTimeout(() => {
      paused = false;
    }, 900);
  }, { passive: false });

  calcSetWidth();
  reviewTrack.scrollLeft = 0;
  requestAnimationFrame(autoScroll);
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
