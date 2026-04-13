/**
 * SERHANT. Orlando Portal — Auth Guard
 * Add to every portal page. Checks session, redirects to login if needed.
 * Hides body until auth confirmed to prevent flash of content.
 */
(async function() {

  // Load Supabase SDK if not already on the page
  if (typeof window.supabase === 'undefined') {
    await new Promise(function(resolve) {
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
      s.onload = resolve;
      s.onerror = resolve;
      document.head.appendChild(s);
    });
  }

  var SB_URL = 'https://lqothpzxhxvhvyikmphx.supabase.co';
  var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxb3RocHp4aHh2aHZ5aWttcGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5ODkzNjgsImV4cCI6MjA5MDU2NTM2OH0.zDE-lniLRF3TdYZmMMSQL20vF_H74_qiMlJM2tX_nKo';

  var ROLES = {
    leadership: ['mark@serhant.com', 'sarah.raumaker@serhant.com'],
    home_squad: [
      'mark@serhant.com', 'sarah.raumaker@serhant.com',
      'andrea.florez@serhant.com', 'chris.kinkela@serhant.com',
      'claire@serhant.com', 'genson@serhant.com',
      'jonathan.fadoul@serhant.com', 'liza@serhant.com',
      'mary.deboer@serhant.com', 'silvia@serhant.com',
      'vanessa.scotland@serhant.com'
    ]
  };

  var PROTECTED = {
    'squad.html':      'home_squad',
    'leadership.html': 'leadership'
  };

  // Hide body immediately to prevent flash of unstyled content
  document.documentElement.style.visibility = 'hidden';

  var sb = window.supabase.createClient(SB_URL, SB_KEY);
  var page = window.location.pathname.split('/').pop() || 'index.html';

  var sessionResult = await sb.auth.getSession();
  var session = sessionResult.data.session;

  // Check Microsoft auth token if no Supabase session
  var msToken = localStorage.getItem('portal_auth_token');
  var msEmail = (localStorage.getItem('portal_user_email') || '').toLowerCase();

  if (!session && !msToken) {
    sessionStorage.setItem('portal_redirect', window.location.href);
    window.location.replace('login.html');
    return;
  }

  var email = session ? (session.user.email || '').toLowerCase() : msEmail;

  // Role check for protected pages
  if (PROTECTED[page] && ROLES[PROTECTED[page]].indexOf(email) === -1) {
    window.location.replace('index.html');
    return;
  }

  // All good — show the page
  document.documentElement.style.visibility = '';

  function applyNav() {
    document.querySelectorAll('a[href="squad.html"]').forEach(function(el) {
      el.style.display = ROLES.home_squad.indexOf(email) !== -1 ? '' : 'none';
    });
    var leadersEl = document.getElementById('leadership-nav-link');
    if (leadersEl) {
      leadersEl.style.display = ROLES.leadership.indexOf(email) !== -1 ? '' : 'none';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyNav);
  } else {
    applyNav();
  }

  window.__session = session;
  window.__email  = email;
  window.__roles  = {
    isLeadership: ROLES.leadership.indexOf(email) !== -1,
    isHomeSquad:  ROLES.home_squad.indexOf(email) !== -1
  };

})();
