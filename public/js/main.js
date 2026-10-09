// ── Bannière cookies RGPD ──
(function() {
  if (!localStorage.getItem('cookiesAccepted')) {
    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.style.cssText = `
      position:fixed;bottom:0;left:0;right:0;z-index:9998;
      background:#1a2e5a;color:#fff;padding:1rem 1.5rem;
      display:flex;align-items:center;justify-content:space-between;
      gap:1rem;flex-wrap:wrap;font-size:.88rem;box-shadow:0 -4px 20px rgba(0,0,0,.2);
    `;
    banner.innerHTML = `
      <p style="margin:0;flex:1;min-width:200px;">
        🍪 Ce site utilise des cookies techniques nécessaires à son fonctionnement.
        <a href="mentions-legales.html#cookies" style="color:#e0b04a;text-decoration:underline;">En savoir plus</a>
      </p>
      <div style="display:flex;gap:.75rem;flex-shrink:0;">
        <button onclick="document.getElementById('cookie-banner').remove();localStorage.setItem('cookiesAccepted','true')"
          style="background:#c9952a;color:#fff;border:none;padding:.5rem 1.25rem;border-radius:50px;font-weight:600;cursor:pointer;font-size:.85rem;">
          Accepter
        </button>
        <button onclick="document.getElementById('cookie-banner').remove()"
          style="background:rgba(255,255,255,.15);color:#fff;border:1px solid rgba(255,255,255,.3);padding:.5rem 1.25rem;border-radius:50px;font-weight:600;cursor:pointer;font-size:.85rem;">
          Refuser
        </button>
      </div>
    `;
    document.body.appendChild(banner);
  }
})();

// ── Navigation mobile ──
const toggle = document.getElementById('navToggle');
const menu = document.getElementById('navMenu');

if (toggle && menu) {
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    menu.classList.toggle('open');
  });
  // Fermer au clic sur un lien — sauf les triggers de dropdown
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        // Ne pas fermer si c'est le trigger d'un sous-menu
        if (a.closest('.dropdown') && !a.closest('.dropdown-menu')) return;
        toggle.classList.remove('open');
        menu.classList.remove('open');
        // Refermer tous les dropdowns ouverts
        document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
      }
    });
  });
}

// ── Dropdown : toggle au clic (desktop ET mobile) ──
document.querySelectorAll('.dropdown > a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const dropdown = link.parentElement;
    const wasOpen = dropdown.classList.contains('open');
    // Fermer tous les dropdowns ouverts
    document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
    if (!wasOpen) dropdown.classList.add('open');
  });
});

// Fermer le dropdown en cliquant ailleurs
document.addEventListener('click', () => {
  document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
});

// ── Accordéon ──
document.querySelectorAll('.accordion-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const isOpen = btn.classList.contains('open');
    // Fermer tous
    document.querySelectorAll('.accordion-btn').forEach(b => {
      b.classList.remove('open');
      b.nextElementSibling.classList.remove('open');
    });
    if (!isOpen) {
      btn.classList.add('open');
      btn.nextElementSibling.classList.add('open');
    }
  });
});

// ── Onglets ──
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const group = btn.closest('[data-tabs]') || btn.parentElement.parentElement;
    const target = btn.dataset.tab;
    btn.parentElement.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    group.querySelectorAll('.tab-panel').forEach(p => {
      p.classList.toggle('active', p.id === target);
    });
  });
});

// ── Active nav link ──
const currentPage = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-menu a').forEach(a => {
  const href = a.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    a.classList.add('active');
  }
});

// ── Animation au scroll ──
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.card, .feature-item, .event-card, .partner-card, .pricing-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity .5s ease, transform .5s ease';
  observer.observe(el);
});

// ── Toast notification ──
function showToast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = 'toast toast-' + type;
  t.textContent = msg;
  t.style.cssText = `
    position:fixed;bottom:2rem;right:2rem;z-index:9999;
    padding:.85rem 1.5rem;border-radius:10px;font-size:.93rem;font-weight:600;
    background:${type === 'success' ? '#15803d' : '#1a2e5a'};color:#fff;
    box-shadow:0 4px 20px rgba(0,0,0,.2);opacity:0;transition:opacity .3s;
  `;
  document.body.appendChild(t);
  setTimeout(() => t.style.opacity = '1', 10);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 350); }, 3500);
}

// ── Formulaire générique ──
document.querySelectorAll('form[data-form]').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const orig = btn.textContent;
    btn.textContent = 'Envoi...';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = orig;
      btn.disabled = false;
      form.reset();
      showToast('Votre message a bien été envoyé !');
    }, 1200);
  });
});

// ── Restauration thème au chargement ──
(function() {
  const t = localStorage.getItem('mia-theme');
  if (t) document.documentElement.setAttribute('data-theme', t);
})();

// ── Chargement éditeur bureau si rôle détecté ──
(function() {
  const role = localStorage.getItem('mia-role');
  const bureauRoles = ['bureau','admin','president','vicepresident','secretaire','tresorier'];
  if (bureauRoles.includes(role)) {
    const s = document.createElement('script');
    s.src = 'js/editor.js';
    document.body.appendChild(s);
  }
})();
