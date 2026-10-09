// ============================================================
//  AITO — Auth locale (mode test sans serveur)
//  Remplacer par Supabase une fois en production
// ============================================================

const SUPABASE_URL      = 'https://idsrfklwwtxehmaqdaih.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkc3Jma2x3d3R4ZWhtYXFkYWloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NjM3MDIsImV4cCI6MjEwNzEzOTcwMn0.Wjm-UkQsNHupPnq7-7AApbM1buyO6oN61wCkFlJ0_uk';

// ── Redirections par rôle ──────────────────────────────────
const ROLE_REDIRECTS = {
  admin:         'dashboard-admin.html',
  president:     'dashboard-president.html',
  vicepresident: 'dashboard-vicepresident.html',
  secretaire:    'dashboard-secretaire.html',
  tresorier:     'dashboard-tresorier.html',
  visiteur:      'dashboard-visiteur.html',
  commissaire:   'dashboard-commissaire.html',
};

// ── Comptes locaux (test hors-ligne) ──────────────────────
const LOCAL_USERS = [
  { email: 'admin@aito34.fr',   pwd: '6b59e7ce319dc3f59a04e96a9a1d483a5e997bdaf3d1262ce48b1c3059c58fc2', role: 'admin',    prenom: 'Guy',      nom: 'Administrateur' },
  { email: 'visite1@aito34.fr', pwd: '6b59e7ce319dc3f59a04e96a9a1d483a5e997bdaf3d1262ce48b1c3059c58fc2', role: 'visiteur', prenom: 'Visiteur', nom: 'Un' },
  { email: 'visite2@aito34.fr', pwd: '6b59e7ce319dc3f59a04e96a9a1d483a5e997bdaf3d1262ce48b1c3059c58fc2', role: 'visiteur', prenom: 'Visiteur', nom: 'Deux' },
  { email: 'membre.test@aito34.fr', pwd: '5dc21563ca6b8efdce3bd258d480ee5096c002758bb86ddfed856e4ac8aa6ce4', role: 'membre',   prenom: 'Kofi',      nom: 'Asante' },
  // ── Comptes bureau par titre (accès temporaires, rôles à personnaliser) ──
  { email: 'president@aito-herault.fr',     pwd: '6b59e7ce319dc3f59a04e96a9a1d483a5e997bdaf3d1262ce48b1c3059c58fc2', role: 'president',     prenom: 'Président',     nom: 'AITO' },
  { email: 'vicepresident@aito-herault.fr', pwd: '6b59e7ce319dc3f59a04e96a9a1d483a5e997bdaf3d1262ce48b1c3059c58fc2', role: 'vicepresident', prenom: 'Vice-Président', nom: 'AITO' },
  { email: 'secretaire@aito-herault.fr',    pwd: '6b59e7ce319dc3f59a04e96a9a1d483a5e997bdaf3d1262ce48b1c3059c58fc2', role: 'secretaire',    prenom: 'Secrétaire',    nom: 'AITO' },
  { email: 'tresorier@aito-herault.fr',     pwd: '6b59e7ce319dc3f59a04e96a9a1d483a5e997bdaf3d1262ce48b1c3059c58fc2', role: 'tresorier',     prenom: 'Trésorier',     nom: 'AITO' },
  // ── Membres bureau — rôles définitifs à attribuer via le dashboard président ──
  { email: 'jeremie@aito-herault.fr',   pwd: '2cfabbc32d76c5c9960b78db5b1c421614a84715cabf914ea28e4e86a69b6ac9', role: 'membre', prenom: 'Jérémie',   nom: 'Bureau AITO' },
  { email: 'serge@aito-herault.fr',     pwd: 'f383e42ddf6f9f20cc342121df39eb6579efd97e9b7b93fb855c7351f19f5bb4', role: 'membre', prenom: 'Serge',     nom: 'Bureau AITO' },
  { email: 'ange@aito-herault.fr',      pwd: '7cea9556b0b8f9ef0ed4c046a381e2281ee72ad598e866a4a9a2b81ba986db52', role: 'membre', prenom: 'Ange',      nom: 'Bureau AITO' },
  { email: 'bodelaire@aito-herault.fr', pwd: '3e8996a1a45356571e227edc864b22e97d5f5dd61312ca14b924826b67a79011', role: 'membre', prenom: 'Bodelaire', nom: 'Bureau AITO' },
  // ── Commissaires — accès dashboard commissariat ────────────
  { email: 'culture@aito-herault.fr',    pwd: '6b59e7ce319dc3f59a04e96a9a1d483a5e997bdaf3d1262ce48b1c3059c58fc2', role: 'commissaire', commissariat: 'culture',    prenom: 'Commissaire', nom: 'Culture',    emoji: '🎭', couleur: '#7C3AED' },
  { email: 'relations@aito-herault.fr',  pwd: '6b59e7ce319dc3f59a04e96a9a1d483a5e997bdaf3d1262ce48b1c3059c58fc2', role: 'commissaire', commissariat: 'relations',  prenom: 'Commissaire', nom: 'Relations',  emoji: '🤝', couleur: '#1d4ed8' },
  { email: 'solidarite@aito-herault.fr', pwd: '6b59e7ce319dc3f59a04e96a9a1d483a5e997bdaf3d1262ce48b1c3059c58fc2', role: 'commissaire', commissariat: 'solidarite', prenom: 'Commissaire', nom: 'Solidarité', emoji: '🤲', couleur: '#059669' },
  { email: 'etudiants@aito-herault.fr',  pwd: '6b59e7ce319dc3f59a04e96a9a1d483a5e997bdaf3d1262ce48b1c3059c58fc2', role: 'commissaire', commissariat: 'etudiants',  prenom: 'Commissaire', nom: 'Étudiants', emoji: '🎓', couleur: '#F77F00' },
  { email: 'loisirs@aito-herault.fr',    pwd: '6b59e7ce319dc3f59a04e96a9a1d483a5e997bdaf3d1262ce48b1c3059c58fc2', role: 'commissaire', commissariat: 'loisirs',    prenom: 'Commissaire', nom: 'Loisirs',    emoji: '🎉', couleur: '#0891b2' },
  { email: 'projets@aito-herault.fr',    pwd: '6b59e7ce319dc3f59a04e96a9a1d483a5e997bdaf3d1262ce48b1c3059c58fc2', role: 'commissaire', commissariat: 'projets',    prenom: 'Commissaire', nom: 'Projets',   emoji: '📊', couleur: '#b45309' },
];

// ── Hash SHA-256 ───────────────────────────────────────────
async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

// ── Détection navigateur / OS / appareil ──────────────────
function getDeviceInfo() {
  const ua = navigator.userAgent;
  let browser = 'Inconnu';
  if (ua.includes('Edg/')) browser = 'Edge';
  else if (/OPR\/|Opera/.test(ua)) browser = 'Opera';
  else if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Safari/')) browser = 'Safari';
  let os = 'Inconnu';
  if (ua.includes('Windows NT')) os = 'Windows';
  else if (ua.includes('Mac OS X')) os = 'macOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (/iPhone|iPad/.test(ua)) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';
  return { browser, os, appareil: /Mobi|Android|iPhone|iPad/i.test(ua) ? 'Mobile' : 'Bureau' };
}

// ── Géolocalisation IP (ipapi.co, 2.5s timeout) ───────────
async function getGeoInfo() {
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 2500);
    const r = await fetch('https://ipapi.co/json/', { signal: ctrl.signal });
    const d = await r.json();
    return { ip: d.ip||'—', ville: d.city||'—', pays: d.country_name||'—' };
  } catch { return { ip: '—', ville: '—', pays: '—' }; }
}

// ── Journal des connexions (localStorage) ─────────────────
async function logConnexion(user, statut) {
  const geo = await getGeoInfo();
  const entry = {
    id: Date.now().toString(36),
    ts: new Date().toISOString(),
    email: user.email||'—', role: user.role||'—',
    prenom: user.prenom||'', nom: user.nom||'',
    statut, ...geo, ...getDeviceInfo()
  };
  const log = JSON.parse(localStorage.getItem('aito_connexions_log')||'[]');
  log.unshift(entry);
  if (log.length > 300) log.length = 300;
  localStorage.setItem('aito_connexions_log', JSON.stringify(log));
  if (statut === 'success') {
    const sess = JSON.parse(localStorage.getItem('aito_sessions_actives')||'[]');
    sess.unshift({...entry});
    localStorage.setItem('aito_sessions_actives', JSON.stringify(sess));
  }
}

// ── Données mock pour les tables ──────────────────────────
const MOCK_EVENEMENTS = [
  { mois: 6, titre: 'Assemblée Générale Annuelle', statut: 'a_venir' },
  { mois: 6, titre: 'Gala annuel de l\'association', statut: 'a_venir' },
  { mois: 7, titre: 'Tournoi sportif inter-associations', statut: 'a_venir' },
  { mois: 8, titre: 'Fête de l\'Indépendance ivoirienne', statut: 'a_venir' },
];
const MOCK_ACTUALITES = [
  { titre: 'Assemblée générale annuelle 2025', contenu: 'L\'assemblée générale se tiendra le 15 juin 2025. Tous les adhérents à jour de cotisation sont invités à participer au bilan moral et financier.', categorie: 'Communiqué', date_publication: '2025-05-01', publie: true },
  { titre: 'Gala de l\'association — 28 juin 2025', contenu: 'Le traditionnel gala annuel aura lieu le 28 juin. Inscriptions ouvertes — places limitées ! Venez profiter d\'une soirée festive entre membres.', categorie: 'Événement', date_publication: '2025-04-20', publie: true },
  { titre: 'Nouveau partenaire : Assurances Sérénité', contenu: 'L\'association accueille un nouveau partenaire dans le domaine des assurances, avec des offres exclusives pour les adhérents AITO.', categorie: 'Partenariat', date_publication: '2025-04-10', publie: true },
];

// ── QueryBuilder (mock Supabase) ───────────────────────────
function QueryBuilder(table) {
  this._table = table;
  this._filters = {};
  this._updateData = null;
}
QueryBuilder.prototype.select = function() { return this; };
QueryBuilder.prototype.eq = function(col, val) { this._filters[col] = val; return this; };
QueryBuilder.prototype.order = function() { return this; };
QueryBuilder.prototype.limit = function() { return this; };
QueryBuilder.prototype.update = function(data) { this._updateData = data; return this; };
QueryBuilder.prototype.single = function() { return this._run(true); };
QueryBuilder.prototype.then = function(res, rej) { return this._run(false).then(res, rej); };
QueryBuilder.prototype._run = async function(single) {
  const MEMBRES_KEY = 'aito_membres_local';

  if (this._updateData) {
    if (this._table === 'membres') {
      const list = JSON.parse(localStorage.getItem(MEMBRES_KEY) || '[]');
      const email = this._filters['email'];
      const idx = list.findIndex(m => m.email === email);
      if (idx >= 0) { list[idx] = Object.assign(list[idx], this._updateData); localStorage.setItem(MEMBRES_KEY, JSON.stringify(list)); }
    }
    return { data: null, error: null };
  }

  if (this._table === 'membres') {
    let list = JSON.parse(localStorage.getItem(MEMBRES_KEY) || '[]');
    const email = this._filters['email'];
    if (email) {
      let m = list.find(function(x){ return x.email === email; });
      if (!m) {
        // Créer un profil par défaut pour le membre connecté
        const sess = JSON.parse(localStorage.getItem('aito_session') || '{}');
        const u = (sess.user && sess.user.user_metadata) || {};
        m = { email: email, nom: u.nom || '', prenom: u.prenom || '', statut: 'actif', statut_cotisation: 'paye', formule: 'Adherent', montant: 30, telephone: '', adresse: '', notes: '', avatar_url: '' };
        list.push(m);
        localStorage.setItem(MEMBRES_KEY, JSON.stringify(list));
      }
      return { data: single ? m : [m], error: null };
    }
    return { data: list, error: null };
  }

  if (this._table === 'evenements') return { data: MOCK_EVENEMENTS, error: null };
  if (this._table === 'actualites') return { data: MOCK_ACTUALITES, error: null };
  return { data: [], error: null };
};

// ── Objet db compatible Supabase ──────────────────────────
const db = {
  auth: {
    signInWithPassword: async ({ email, password }) => {
      const hash = await sha256(password);
      const user = LOCAL_USERS.find(u => u.email === email && u.pwd === hash);
      if (!user) {
        await logConnexion({ email, role: '—', prenom: '', nom: '' }, 'echec');
        return { data: null, error: { message: 'Identifiants incorrects.' } };
      }
      const _ov = JSON.parse(localStorage.getItem('aito_role_overrides') || '{}');
      const _role = _ov[user.email] || user.role;
      const session = { user: { id: user.email, email: user.email, user_metadata: { role: _role, prenom: user.prenom, nom: user.nom, commissariat: user.commissariat || null, emoji: user.emoji || null, couleur: user.couleur || null } } };
      localStorage.setItem('aito_session', JSON.stringify(session));
      await logConnexion(user, 'success');
      return { data: session, error: null };
    },
    getUser: async () => {
      const s = localStorage.getItem('aito_session');
      if (!s) return { data: { user: null }, error: null };
      try { return { data: JSON.parse(s), error: null }; }
      catch { return { data: { user: null }, error: null }; }
    },
    signOut: async () => {
      const s = localStorage.getItem('aito_session');
      if (s) {
        try {
          const email = JSON.parse(s)?.user?.email;
          if (email) {
            const sess = JSON.parse(localStorage.getItem('aito_sessions_actives')||'[]');
            const idx = sess.findIndex(x => x.email === email);
            if (idx > -1) sess.splice(idx, 1);
            localStorage.setItem('aito_sessions_actives', JSON.stringify(sess));
          }
        } catch {}
      }
      localStorage.removeItem('aito_session');
      return { error: null };
    },
    updateUser: async () => { return { error: null }; },
    signInWithOAuth: async () => {
      alert('Connexion OAuth non disponible en mode test local.');
      return { error: { message: 'OAuth non disponible.' } };
    },
  },
  from: function(table) { return new QueryBuilder(table); },
  storage: {
    from: function() {
      return {
        upload: async () => ({ error: { message: 'Upload non disponible en mode local.' } }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      };
    }
  },
};

// ── Guard rôle ────────────────────────────────────────────
async function guardRole(allowedRoles) {
  const { data: { user } } = await db.auth.getUser();
  if (!user) { window.location.href = 'acces-admin.html'; return null; }
  const role = user.user_metadata?.role;
  if (allowedRoles && !allowedRoles.includes(role)) {
    window.location.href = 'acces-admin.html'; return null;
  }
  return user;
}

// ── Déconnexion universelle ───────────────────────────────
async function logout() {
  await db.auth.signOut();
  window.location.href = 'acces-admin.html';
}

// ── Toast ─────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:1.5rem;right:1.5rem;z-index:99999;padding:.75rem 1.25rem;border-radius:8px;font-size:.87rem;font-weight:600;color:#fff;box-shadow:0 4px 16px rgba(0,0,0,.3);transition:opacity .4s';
  t.style.background = type === 'success' ? '#166534' : type === 'error' ? '#dc2626' : '#1d4ed8';
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 400); }, 3500);
}
