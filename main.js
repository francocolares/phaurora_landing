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

/* ── 2. Reveal on scroll (IntersectionObserver) ── */
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

/* ── 3. Hero bg load + video resize ── */
(function initHero() {
  const hero   = document.querySelector('.hero');
  const iframe = hero?.querySelector('.hero-video-bg iframe');
  if (!hero) return;

  requestAnimationFrame(() => hero.classList.add('loaded'));

  if (!iframe) return;

  const RATIO = 16 / 9;

  function resizeHeroBg() {
    const w = hero.offsetWidth;
    const h = hero.offsetHeight;
    if (w / h > RATIO) {
      iframe.style.width  = w + 'px';
      iframe.style.height = (w / RATIO) + 'px';
    } else {
      iframe.style.height = h + 'px';
      iframe.style.width  = (h * RATIO) + 'px';
    }
  }

  resizeHeroBg();
  window.addEventListener('resize', resizeHeroBg, { passive: true });
})();

/* ── 4. Lead form (hero) ── */
(function initLeadForm() {
  const form        = document.getElementById('lead-form');
  const errEl       = document.getElementById('form-error');
  const formContent = document.getElementById('form-content');
  const successMsg  = document.getElementById('success-msg');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const nombre    = form.querySelector('#f-nombre').value.trim();
    const telefono  = form.querySelector('#f-telefono').value.trim();
    const email     = form.querySelector('#f-email').value.trim();
    const tipologia = form.querySelector('#f-tipologia').value;

    if (!nombre || !telefono || !email) {
      errEl.hidden = false;
      form.querySelector(':invalid')?.focus();
      return;
    }

    errEl.hidden = true;

    /* Enviar lead a WhatsApp */
    const text = [
      `Hola, mi nombre es ${nombre}.`,
      `Teléfono: ${telefono}`,
      `Email: ${email}`,
      tipologia ? `Tipología de interés: ${tipologia}` : '',
      `Me gustaría más información de PH AURORA. www.phaurora.com`
    ].filter(Boolean).join('\n');

    window.open(
      `https://wa.me/50764747574?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer'
    );

    /* Mostrar estado de éxito con acceso al tour 360° */
    formContent.style.display = 'none';
    successMsg.hidden = false;
  });
})();

/* ── 5. Privacy & Disclaimer modals ── */
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

/* ── 6. Google Map (deferred) ── */
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

/* ── 7. Footer copyright year ── */
(function initYear() {
  const el = document.getElementById('copy-year');
  if (el) el.textContent = new Date().getFullYear();
})();
