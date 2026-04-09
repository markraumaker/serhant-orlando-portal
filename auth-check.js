/**
 * SERHANT. Orlando Portal — Auth Guard
 * Add to every portal page. Checks session, redirects to login if needed.
 * Hides body until auth confirmed to prevent flash of content.
 */
(async function() {
  // Load Supabase SDK if not already on the page
  if (!window.supabase) {
    await new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
      s.onload = resolve;
      s.onerror = resolve;
      document.head.appendChild(s);
    });
  }

  const SB_URL = 'https://lqothpzxhxvhvyikmphx.supabase.co';
  const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxb3RocHp4aHh2aHZ5aWttcGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5ODkzNjgsImV4cCI6MjA5MDU2NTM2OH0.zDE-lniLRF3TdYZmMMSQL20vF_H74_qiMlJM2tX_nKo';

  const ROLES = {
    leadership: ['mark@serhant.com','sarah.raumaker@serhant.com'],
    home_squad: [
      'mark@serhant.com','sarah.raumaker@serhant.com',
      'andrea.florez@serhant.com','chris.kinkela@serhant.com',
      'claire@serhant.com','genson@serhant.com',
      'jonathan.fadoul@serhant.com','liza@serhant.com',
      'mary.deboer@serhant.com','silvia@serhant.com',
      'vanessa.scotland@serhant.com'
    ]
  };

  // Pages that require a specific role
  const PROTECTED = {
    'squad.html':      'home_squad',
    'leadership.html': 'leadership'
  };

  // Hide body immediately to prevent flash
  document.documentElement.style.visibility = 'hidden';

  const sb = supabase.createClient(SB_URL, SB_KEY);
  const page = window.location.pathname.split('/').pop() || 'index.html';

  const { data: { session } } = await sb.auth.getSession();

  if (!session) {
    // Save where they were trying to go
    sessionStorage.setItem('portal_redirect', window.location.href);
    window.location.replace('login.html');
    return;
  }

  const email = session.user.email?.toLowerCase() || '';

  // Role check for protected pages
  if (PROTECTED[page] && !ROLES[PROTECTED[page]].includes(email)) {
    window.location.replace('index.html');
    return;
  }

  // Show page
  document.documentElement.style.visibility = '';

  // Apply role-based nav after DOM loads
  function applyNav() {
    // Squad link -- home squad only
    document.querySelectorAll('a[href="squad.html"]').forEach(el => {
      el.style.display = ROLES.home_squad.includes(email) ? '' : 'none';
    });
    // Leaders link -- leadership only
    const leadersEl = document.getElementById('leadership-nav-link');
    if (leadersEl) leadersEl.style.display = ROLES.leadership.includes(email) ? '' : 'none';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyNav);
  } else {
    applyNav();
  }

  // Make session available to page scripts
  window.__session = session;
  window.__email  = email;
  window.__roles  = {
    isLeadership: ROLES.leadership.includes(email),
    isHomeSquad:  ROLES.home_squad.includes(email)
  };
})();
