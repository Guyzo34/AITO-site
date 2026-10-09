/* AITO — Maintenance mode controller */
(function(){
  var EXEMPT = [
    'maintenance.html',
    'acces-admin.html',
    'connexion.html',
    'espace-membre.html',
    'adhesion-formule.html',
    'dashboard-admin.html',
    'dashboard-president.html',
    'dashboard-vicepresident.html',
    'dashboard-secretaire.html',
    'dashboard-tresorier.html',
    'dashboard-bureau.html',
    'dashboard-visiteur.html',
    'dashboard-commissaire.html',
  ];

  var page = window.location.pathname.split('/').pop() || 'index.html';
  var isExempt = EXEMPT.some(function(e){ return page.indexOf(e) !== -1; });

  // Aussi exempter si l'utilisateur est connecté (session active)
  var session = localStorage.getItem('aito_session');
  var isLoggedIn = false;
  if(session){ try{ isLoggedIn = !!JSON.parse(session).user; }catch(e){} }

  // Default: maintenance OFF
  if(localStorage.getItem('aito_maintenance') === null){
    localStorage.setItem('aito_maintenance', 'off');
  }

  if(!isExempt && !isLoggedIn && localStorage.getItem('aito_maintenance') === 'on'){
    window.location.replace('maintenance.html');
  }
})();
