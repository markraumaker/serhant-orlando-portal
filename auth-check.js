/**
 * SERHANT. Orlando Portal — Auth Guard + Role-Based Nav
 * Runs on every portal page. Checks Supabase session.
 * Redirects to login.html if not authenticated.
 * Shows/hides nav links based on role.
 */

(async function() {
  const SB_URL = 'https://lqothpzxhxvhvyikmphx.supabase.co';
  const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxb3RocHp4aHh2aHZ5aWttcGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5ODkzNjgsImV4cCI6MjA5MDU2NTM2OH0.zDE-lniLRF3TdYZmMMSQL20vF_H74_qiMlJM2tX_nKo';

  // ── ROLE DEFINITIONS ──────────────────────────────────────
  const ROLES = {
    leadership: [
      'mark@serhant.com',
      'sarah.raumaker@serhant.com'
    ],
    home_squad: [
      'mark@serhant.com',
      'sarah.raumaker@serhant.com',
      'andrea.florez@serhant.com',
      'chris.kinkela@serhant.com',
      'claire@serhant.com',
      'genson@serhant.com',
      'jonathan.fadoul@serhant.com',
      'liza@serhant.com',
      'mary.deboer@serhant.com',
      'silvia@serhant.com',
      'vanessa.scotland@serhant.com'
    ],
    all_agents: [
      'mark@serhant.com','sarah.raumaker@serhant.com','andrea.florez@serhant.com',
      'chris.kinkela@serhant.com','claire@serhant.com','genson@serhant.com',
      'jonathan.fadoul@serhant.com','liza@serhant.com','mary.deboer@serhant.com',
      'silvia@serhant.com','vanessa.scotland@serhant.com',
      'aroman@serhant.com','allison@serhant.com','ashleymccoy@serhant.com',
      'ben@serhant.com','chad@serhant.com','claire.fernando@serhant.com',
      'cluke@serhant.com','daniel.botton@serhant.com','dino@serhant.com',
      'elleneortega@serhant.com','gabysadler@serhant.com','gavin@serhant.com',
      'gladys.bezerra@serhant.com','hailey@serhant.com','jeffrogers@serhant.com',
      'jimmy@serhant.com','jocelinyau@serhant.com','johnharbuck@serhant.com',
      'josuepolo@serhant.com','jbarreiro@serhant.com','lisell@serhant.com',
      'luisq@serhant.com','mark.b@serhant.com','nia.medina@serhant.com',
      'octavia@serhant.com','ppetroski@serhant.com','rob@serhant.com',
      'sammy@serhant.com','shawn@serhant.com','sophiarogers@serhant.com',
      'vanessa.scotland@serhant.com','zoe@serhant.com','mraumaker@serhant.com'
    ]
  };

  // Page-level protection (redirect away if wrong role)
  const PAGE_ROLES = {
    'leadership.html': 'leadership',
    'squad.html':      'home_squad'
  };

  const sb = supabase.createClient(SB_URL, SB_KEY);

  // Get current page filename
  const page = window.location.pathname.split('/').pop() || 'index.html';

  // Check session
  const { data: { session } } = await sb.auth.getSession();

  if (!session) {
    // Not logged in -- save intended destination and redirect to login
    sessionStorage.setItem('portal_redirect', window.location.href);
    window.location.replace('login.html');
    return;
  }

  const email = session.user.email?.toLowerCase();

  // Check page-level role protection
  if (PAGE_ROLES[page]) {
    const required = PAGE_ROLES[page];
    if (!ROLES[required].includes(email)) {
      window.location.replace('index.html');
      return;
    }
  }

  // Apply role-based nav visibility
  function applyNav() {
    // LEADERS link -- leadership only
    const leadersLink = document.getElementById('leadership-nav-link');
    if (leadersLink) {
      leadersLink.style.display = ROLES.leadership.includes(email) ? '' : 'none';
    }

    // SQUAD link -- home squad only
    const squadLink = document.querySelector('a[href="squad.html"]');
    if (squadLink) {
      squadLink.style.display = ROLES.home_squad.includes(email) ? '' : 'none';
    }
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyNav);
  } else {
    applyNav();
  }

  // Expose session to page scripts
  window.__portalSession = session;
  window.__portalEmail   = email;
  window.__portalRoles   = {
    isLeadership: ROLES.leadership.includes(email),
    isHomeSquad:  ROLES.home_squad.includes(email),
    isAgent:      ROLES.all_agents.includes(email)
  };

})();
