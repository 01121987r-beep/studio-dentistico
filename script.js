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
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');

if (reviewTrack) {
  const originalCards = Array.from(reviewTrack.querySelectorAll('.review-card'));
  let setWidth = 0;
  let paused = false;
  let lastTime = 0;

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

  reviewTrack.addEventListener('mouseenter', () => {
    paused = true;
  });
  reviewTrack.addEventListener('mouseleave', () => {
    paused = false;
  });
  reviewTrack.addEventListener('touchstart', () => {
    paused = true;
  }, { passive: true });
  reviewTrack.addEventListener('touchend', () => {
    paused = false;
  });

  calcSetWidth();
  requestAnimationFrame(autoScroll);
  window.addEventListener('resize', calcSetWidth);

  if (prevBtn && nextBtn) {
    const slideBy = () => Math.min(320, reviewTrack.clientWidth * 0.9);

    nextBtn.addEventListener('click', () => {
      reviewTrack.scrollBy({ left: slideBy(), behavior: 'smooth' });
    });

    prevBtn.addEventListener('click', () => {
      reviewTrack.scrollBy({ left: -slideBy(), behavior: 'smooth' });
    });
  }
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
