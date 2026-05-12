/* ═══════════════════════════════════════════════════════════
   PH AURORA — main.js
   Vanilla ES2020: no frameworks, no build step
   ═══════════════════════════════════════════════════════════ */

/* ── 1. Header sticky ── */
(function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const update = () => {
    if (window.scrollY > 80) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ── 2. Mobile hamburger menu ── */
(function initMenu() {
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('header-nav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      nav.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      btn.focus();
    }
  });
})();

/* ── 3. Reveal on scroll (IntersectionObserver) ── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
})();

/* ── 4. Hero bg parallax-lite & load class ── */
(function initHero() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  requestAnimationFrame(() => hero.classList.add('loaded'));
})();

/* ── 5. Disponibilidad slider ── */
(function initDispSlider() {
  const track = document.getElementById('disp-track');
  const prev  = document.getElementById('disp-prev');
  const next  = document.getElementById('disp-next');
  const dotsContainer = document.getElementById('disp-dots');
  if (!track) return;

  const slides = track.querySelectorAll('.disp-slide');
  const total  = slides.length;
  let current  = 0;

  /* Build dots */
  const dots = Array.from({ length: total }, (_, i) => {
    const btn = document.createElement('button');
    btn.className = 'slider-dot' + (i === 0 ? ' active' : '');
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-label', `Diapositiva ${i + 1}`);
    btn.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(btn);
    return btn;
  });

  const goTo = (index) => {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  };

  prev.addEventListener('click', () => goTo(current - 1));
  next.addEventListener('click', () => goTo(current + 1));

  /* Touch swipe */
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) goTo(dx < 0 ? current + 1 : current - 1);
  });

  /* Auto-advance */
  let timer = setInterval(() => goTo(current + 1), 4500);
  track.addEventListener('mouseenter', () => clearInterval(timer));
  track.addEventListener('mouseleave', () => { timer = setInterval(() => goTo(current + 1), 4500); });
})();

/* ── 6. El Proyecto background slider ── */
(function initProyectoSlider() {
  const slides = document.querySelectorAll('.proyecto-slide');
  const dots   = document.querySelectorAll('.proyecto-dot');
  if (!slides.length) return;

  let current = 0;
  let timer;

  const goTo = (index) => {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  };

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(+dot.dataset.slide);
      resetTimer();
    });
  });

  const resetTimer = () => {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 5000);
  };

  resetTimer();
})();

/* ── 7. Galería lightbox ── */
(function initLightbox() {
  const lb      = document.getElementById('lightbox');
  const lbImg   = document.getElementById('lightbox-img');
  const lbClose = document.getElementById('lightbox-close');
  const lbPrev  = document.getElementById('lightbox-prev');
  const lbNext  = document.getElementById('lightbox-next');
  if (!lb) return;

  const items = Array.from(document.querySelectorAll('.galeria-item'));
  let currentIndex = 0;

  const open = (index) => {
    currentIndex = index;
    const img = items[index].querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  };

  const close = () => {
    lb.hidden = true;
    document.body.style.overflow = '';
    items[currentIndex]?.focus();
  };

  const navigate = (dir) => open((currentIndex + dir + items.length) % items.length);

  items.forEach((item, i) => item.addEventListener('click', () => open(i)));
  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click',  () => navigate(-1));
  lbNext.addEventListener('click',  () => navigate(1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });

  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });
})();

/* ── 8. Contact form → WhatsApp ── */
(function initContactForm() {
  const form = document.getElementById('contacto-form');
  const errEl = document.getElementById('form-error');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const nombre   = form.querySelector('#f-nombre').value.trim();
    const telefono = form.querySelector('#f-telefono').value.trim();
    const email    = form.querySelector('#f-email').value.trim();
    const mensaje  = form.querySelector('#f-mensaje').value.trim();

    if (!nombre || !telefono || !email) {
      errEl.hidden = false;
      form.querySelector(':invalid')?.focus();
      return;
    }

    errEl.hidden = true;

    const text = [
      `Hola, mi nombre es ${nombre}.`,
      `Teléfono: ${telefono}`,
      `Email: ${email}`,
      mensaje ? `Mensaje: ${mensaje}` : '',
      `Me gustaría más información de PH AURORA. www.phaurora.com`
    ].filter(Boolean).join('\n');

    const url = `https://wa.me/50764747574?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });
})();

/* ── 9. Privacy & Disclaimer modals ── */
(function initModals() {
  const privacyLink     = document.getElementById('privacy-link');
  const disclaimerLink  = document.getElementById('disclaimer-link');
  const modalPrivacy    = document.getElementById('modal-privacy');
  const modalDisclaimer = document.getElementById('modal-disclaimer');
  if (!privacyLink) return;

  let projectData = null;

  const loadData = async () => {
    if (projectData) return projectData;
    try {
      const res = await fetch('data/project.json');
      projectData = await res.json();
    } catch (_) {
      projectData = { project: { privacyPolicy: '<p>No disponible.</p>', contentDisclaimer: '<p>No disponible.</p>' } };
    }
    return projectData;
  };

  const openModal = async (modal, bodyId, key) => {
    const data = await loadData();
    document.getElementById(bodyId).innerHTML = data.project[key] || '<p>No disponible.</p>';
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modal.querySelector('.modal-close')?.focus();
  };

  const closeModal = (modal) => {
    modal.hidden = true;
    document.body.style.overflow = '';
  };

  privacyLink.addEventListener('click', e => {
    e.preventDefault();
    openModal(modalPrivacy, 'modal-privacy-body', 'privacyPolicy');
  });

  disclaimerLink.addEventListener('click', e => {
    e.preventDefault();
    openModal(modalDisclaimer, 'modal-disclaimer-body', 'contentDisclaimer');
  });

  [modalPrivacy, modalDisclaimer].forEach(modal => {
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(modal); });
    modal.querySelector('.modal-close')?.addEventListener('click', () => closeModal(modal));
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (!modalPrivacy.hidden)    closeModal(modalPrivacy);
      if (!modalDisclaimer.hidden) closeModal(modalDisclaimer);
    }
  });
})();

/* ── 10. Google Map (deferred) ── */
(function initMap() {
  const mapContainer = document.getElementById('map-container');
  const mapDiv       = document.getElementById('google-map');
  const mapFallback  = document.getElementById('map-fallback');
  if (!mapContainer) return;

  const API_KEY = 'AIzaSyCBCU3IZL4TlGN1H0j5ldNnGmt6qaaIxUU';
  const LAT     = 8.990541;
  const LNG     = -79.506369;
  const MARKER  = 'https://www.phaurora.com/data/project/2020/08/icon_marker_img/c8c85ef866be43b883ac992f025cda29';

  let mapLoaded = false;

  const loadMap = () => {
    if (mapLoaded) return;
    mapLoaded = true;

    window.initGoogleMap = () => {
      if (!window.google) return;
      mapFallback.style.display = 'none';
      mapDiv.style.display = 'block';

      const map = new google.maps.Map(mapDiv, {
        center: { lat: LAT, lng: LNG },
        zoom: 16,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#f0f1f8' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#b8c5e8' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }
        ]
      });

      new google.maps.Marker({
        position: { lat: LAT, lng: LNG },
        map,
        title: 'PH Aurora',
        icon: {
          url: MARKER,
          scaledSize: new google.maps.Size(40, 52)
        }
      });
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initGoogleMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  };

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      loadMap();
      observer.disconnect();
    }
  }, { rootMargin: '200px' });

  observer.observe(mapContainer);
})();

/* ── 11. Footer copyright year ── */
(function initYear() {
  const el = document.getElementById('copy-year');
  if (el) el.textContent = new Date().getFullYear();
})();
