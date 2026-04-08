/* ============================================================
   SERHANT. ORLANDO PORTAL — SHARED JS
   ============================================================ */

(function () {
  /* ---- Active nav detection ---- */
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ---- Scroll-based nav shadow ---- */
  const nav = document.querySelector('.site-nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Mobile nav toggle ---- */
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const open = toggle.classList.toggle('open');
      navLinks.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open);
    });
    // Close on link click
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  /* ---- Scroll fade-in ---- */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

  requestAnimationFrame(() => {
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  });

  /* ---- FAQ accordion ---- */
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      // close all
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ---- Filter pills (rankings) ---- */
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const group = pill.closest('.filter-pills');
      group.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });

})();

// Show Leaders nav link only for leadership emails
(async function() {
  const LEADER_EMAILS = ['mark@serhant.com','sarah.raumaker@serhant.com'];
  const SUPABASE_URL = 'https://lqothpzxhxvhvyikmphx.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxb3RocHp4aHh2aHZ5aWttcGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5ODkzNjgsImV4cCI6MjA5MDU2NTM2OH0.zDE-lniLRF3TdYZmMMSQL20vF_H74_qiMlJM2tX_nKo';
  try {
    if (typeof supabase === 'undefined') return;
    const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data: { session } } = await sb.auth.getSession();
    if (session && LEADER_EMAILS.includes(session.user.email)) {
      const el = document.getElementById('leadership-nav-link');
      if (el) el.style.display = '';
    }
  } catch(e) {}
})();
