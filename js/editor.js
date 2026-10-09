/* ============================================================
   MIA — Éditeur inline bureau (localStorage)
   Chargé automatiquement si mia-role = bureau/admin/président…
   ============================================================ */
(function () {
  'use strict';

  const PAGE_KEY = 'mia-content-' + location.pathname;
  const EDITABLE = [
    '.card h3', '.card p', '.card h4',
    '.event-info h4', '.event-info p',
    '.page-hero h1', '.page-hero p',
    '.section-header h2', '.section-header p',
    '.feature-item h4', '.feature-item p',
    '.actualite-title', '.actualite-body',
    '.hero-title', '.hero-subtitle',
    '.pricing-card h3', '.pricing-card p',
    '.partner-name', '.partner-desc'
  ];

  let editMode = false;
  let changeCount = 0;
  const originalContent = {};

  // ── 1. Sauvegarder les contenus originaux ──
  function snapshotOriginals() {
    EDITABLE.forEach(sel => {
      document.querySelectorAll(sel).forEach((el, i) => {
        const key = sel + '-' + i;
        originalContent[key] = el.innerHTML;
      });
    });
  }

  // ── 2. Restaurer depuis localStorage ──
  function restoreFromStorage() {
    const saved = localStorage.getItem(PAGE_KEY);
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      EDITABLE.forEach(sel => {
        document.querySelectorAll(sel).forEach((el, i) => {
          const key = sel + '-' + i;
          if (data[key] !== undefined) el.innerHTML = data[key];
        });
      });
    } catch(e) {}
  }

  // ── 3. Activer / désactiver le mode édition ──
  function toggleEdit(active) {
    editMode = active;
    EDITABLE.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        el.contentEditable = active ? 'true' : 'false';
        el.style.outline = active ? '2px dashed #F77F00' : '';
        el.style.borderRadius = active ? '4px' : '';
        el.style.minHeight = active ? '1em' : '';
        if (active) {
          el.addEventListener('input', onContentChange);
        } else {
          el.removeEventListener('input', onContentChange);
        }
      });
    });
    updateUI();
  }

  function onContentChange() {
    changeCount++;
    updateCounter();
  }

  // ── 4. Sauvegarder dans localStorage ──
  function saveContent() {
    const data = {};
    EDITABLE.forEach(sel => {
      document.querySelectorAll(sel).forEach((el, i) => {
        data[sel + '-' + i] = el.innerHTML;
      });
    });
    localStorage.setItem(PAGE_KEY, JSON.stringify(data));
    changeCount = 0;
    updateCounter();
    showEditorToast('Modifications sauvegardées localement');
  }

  // ── 5. Réinitialiser ──
  function resetContent() {
    if (!confirm('Réinitialiser toutes les modifications de cette page ?')) return;
    localStorage.removeItem(PAGE_KEY);
    EDITABLE.forEach(sel => {
      document.querySelectorAll(sel).forEach((el, i) => {
        const key = sel + '-' + i;
        if (originalContent[key] !== undefined) el.innerHTML = originalContent[key];
      });
    });
    changeCount = 0;
    updateCounter();
    showEditorToast('Contenu réinitialisé');
  }

  // ── 6. Toast éditeur ──
  function showEditorToast(msg) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:6rem;right:1.5rem;z-index:99999;background:#00703C;color:#fff;padding:.7rem 1.25rem;border-radius:8px;font-size:.85rem;font-weight:700;box-shadow:0 4px 16px rgba(0,0,0,.25);opacity:0;transition:opacity .3s;';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.style.opacity = '1', 10);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 350); }, 2800);
  }

  // ── 7. Mise à jour du compteur de modifications ──
  function updateCounter() {
    const counter = document.getElementById('mia-editor-counter');
    if (counter) {
      counter.textContent = changeCount > 0 ? changeCount + ' modification(s) non sauvegardée(s)' : 'Aucune modification en attente';
      counter.style.color = changeCount > 0 ? '#F77F00' : '#3fb950';
    }
  }

  // ── 8. Mise à jour du bouton principal ──
  function updateUI() {
    const btn = document.getElementById('mia-edit-toggle');
    if (btn) {
      btn.textContent = editMode ? '🔒 Quitter l\'édition' : '🖊️ Activer l\'édition';
      btn.style.background = editMode ? '#F77F00' : '#00703C';
    }
  }

  // ── 9. Créer la barre d'édition flottante ──
  function createEditorBar() {
    const role = localStorage.getItem('mia-role') || 'bureau';
    const roleLabel = {
      admin: 'Administrateur', president: 'Président',
      vicepresident: 'Vice-Président', secretaire: 'Secrétaire',
      tresorier: 'Trésorier', bureau: 'Bureau'
    }[role] || 'Bureau';

    const bar = document.createElement('div');
    bar.id = 'mia-editor-bar';
    bar.style.cssText = `
      position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 99998;
      background: #fff; border: 2px solid #00703C; border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,112,60,.25); padding: 1rem 1.25rem;
      min-width: 240px; font-family: system-ui, sans-serif;
      transition: all .3s ease;
    `;

    bar.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem;">
        <div style="display:flex;align-items:center;gap:.5rem;">
          <span style="width:8px;height:8px;background:#00703C;border-radius:50%;display:inline-block;"></span>
          <strong style="font-size:.82rem;color:#213328;">Mode édition — ${roleLabel}</strong>
        </div>
        <button onclick="document.getElementById('mia-editor-bar').style.display='none'"
          style="background:none;border:none;cursor:pointer;color:#666;font-size:1.1rem;line-height:1;" title="Réduire">✕</button>
      </div>
      <div id="mia-editor-counter" style="font-size:.75rem;color:#3fb950;margin-bottom:.85rem;">Aucune modification en attente</div>
      <div style="display:flex;flex-direction:column;gap:.5rem;">
        <button id="mia-edit-toggle"
          style="background:#00703C;color:#fff;border:none;padding:.6rem 1rem;border-radius:8px;font-size:.85rem;font-weight:700;cursor:pointer;width:100%;transition:background .2s;"
          onmouseover="this.style.opacity='.88'" onmouseout="this.style.opacity='1'">
          🖊️ Activer l'édition
        </button>
        <button onclick="if(typeof saveContent==='function')saveContent()"
          style="background:#e8f5ee;color:#00703C;border:1px solid #00703C;padding:.5rem 1rem;border-radius:8px;font-size:.82rem;font-weight:600;cursor:pointer;width:100%;">
          💾 Sauvegarder
        </button>
        <button onclick="if(typeof resetContent==='function')resetContent()"
          style="background:#fff5f5;color:#dc2626;border:1px solid #dc2626;padding:.5rem 1rem;border-radius:8px;font-size:.82rem;font-weight:600;cursor:pointer;width:100%;">
          🔄 Réinitialiser la page
        </button>
      </div>
      <div style="margin-top:.85rem;padding-top:.75rem;border-top:1px solid #d9e8de;font-size:.72rem;color:#8aaa94;text-align:center;">
        ⚠️ Sauvegarde locale uniquement (test)
      </div>
    `;

    document.body.appendChild(bar);

    // Connecter les boutons aux fonctions
    document.getElementById('mia-edit-toggle').addEventListener('click', () => toggleEdit(!editMode));

    // Bouton flottant pour ré-ouvrir la barre si réduite
    const fab = document.createElement('button');
    fab.id = 'mia-editor-fab';
    fab.title = 'Ouvrir l\'éditeur bureau';
    fab.innerHTML = '🖊️';
    fab.style.cssText = `
      display:none;position:fixed;bottom:1.5rem;right:1.5rem;z-index:99998;
      width:48px;height:48px;border-radius:50%;background:#00703C;color:#fff;
      border:none;font-size:1.3rem;cursor:pointer;box-shadow:0 4px 16px rgba(0,112,60,.4);
    `;
    fab.addEventListener('click', () => {
      bar.style.display = 'block';
      fab.style.display = 'none';
    });
    document.body.appendChild(fab);

    // Quand on ferme la barre → afficher le FAB
    bar.querySelector('button[onclick*="display"]').addEventListener('click', () => {
      setTimeout(() => { fab.style.display = 'flex'; fab.style.alignItems = 'center'; fab.style.justifyContent = 'center'; }, 50);
    });
  }

  // ── INIT ──
  function init() {
    snapshotOriginals();
    restoreFromStorage();
    createEditorBar();

    // Vérifier si du contenu a été sauvegardé (indicateur)
    if (localStorage.getItem(PAGE_KEY)) {
      setTimeout(() => {
        const counter = document.getElementById('mia-editor-counter');
        if (counter) {
          counter.textContent = 'Contenu personnalisé chargé depuis la sauvegarde';
          counter.style.color = '#F77F00';
        }
      }, 100);
    }
  }

  // Lancer après chargement du DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Exposer les fonctions pour les boutons inline
  window.saveContent = saveContent;
  window.resetContent = resetContent;
})();
