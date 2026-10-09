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

// ── Restructuration dropdown Services (groupes) ──
(function() {
  const dm = document.querySelector('.nav-menu .dropdown .dropdown-menu');
  if (!dm) return;
  dm.innerHTML = `
    <span class="dd-group">Adhésion</span>
    <a href="adhesion.html">&#128203; Adhésion &amp; Cotisations</a>
    <span class="dd-group">Communauté</span>
    <a href="compatriotes.html">&#127757; Infos Compatriotes</a>
    <a href="bourse-echange.html">&#128257; Bourse d'échange</a>
    <a href="boutique.html">&#128717;&#65039; Boutique AITO</a>
    <span class="dd-group">Ressources &amp; Soutien</span>
    <a href="collectivites.html">&#127963; Collectivités</a>
    <a href="projets-economiques.html">&#128188; Projets économiques</a>
    <a href="financement.html">&#128176; Financement &amp; Subventions</a>
    <a href="assurances.html">&#128737;&#65039; Assurances décès</a>
    <span class="dd-group">Découvrir</span>
    <a href="tourisme.html">&#127796; Tourisme Côte d'Ivoire</a>
    <a href="reunions.html">&#128249; Réunions en ligne</a>
  `;
})();

// ── Bottom navigation mobile ──
(function() {
  const page = location.pathname.split('/').pop() || 'index.html';
  const isDashboard = /^dashboard-|^espace-membre|^acces-admin|^connexion|^adhesion-formule|^maintenance/.test(page);
  if (isDashboard) return;

  const svgHome = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12L12 3l9 9"/><path d="M4 11v9a1 1 0 001 1h4v-5h6v5h4a1 1 0 001-1v-9"/></svg>`;
  const svgCal  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`;
  const svgMenu = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>`;
  const svgImg  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
  const svgUser = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`;

  const isActive = p => page === p ? 'active' : '';

  const nav = document.createElement('nav');
  nav.className = 'bottom-nav';
  nav.setAttribute('aria-label', 'Navigation principale mobile');
  nav.innerHTML = `
    <a href="index.html" class="bn-item ${isActive('index.html')}" aria-label="Accueil">${svgHome}<span>Accueil</span></a>
    <a href="evenements.html" class="bn-item ${isActive('evenements.html')}" aria-label="Événements">${svgCal}<span>Événements</span></a>
    <button class="bn-item bn-center" id="bn-menu-btn" aria-label="Ouvrir le menu" aria-expanded="false">
      <div class="bn-center-bubble">${svgMenu}</div>
      <span>Menu</span>
    </button>
    <a href="galerie.html" class="bn-item ${isActive('galerie.html')}" aria-label="Galerie">${svgImg}<span>Galerie</span></a>
    <a href="connexion.html" class="bn-item ${isActive('connexion.html') || isActive('espace-membre.html')}" aria-label="Mon espace">${svgUser}<span>Mon espace</span></a>
  `;
  document.body.appendChild(nav);

  const menuBtn = document.getElementById('bn-menu-btn');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      const t = document.getElementById('navToggle');
      const m = document.getElementById('navMenu');
      if (t && m) {
        const isOpen = m.classList.toggle('open');
        t.classList.toggle('open', isOpen);
        menuBtn.classList.toggle('open', isOpen);
        menuBtn.setAttribute('aria-expanded', isOpen);
      }
    });
  }
})();

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
