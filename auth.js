/* ============================================================
   SERHANT. ORLANDO PORTAL — MICROSOFT SSO AUTH
   MSAL.js v2 — Role-Based Access Control
   ============================================================ */

(function () {

  /* ---- Access lists ---- */
  const HOME_SQUAD = [
    'mraumaker@serhant.com',
    'sarah.raumaker@serhant.com',
    'claire.jesso@serhant.com',
    'mary.deboer@serhant.com',
    'silvia.kinkela@serhant.com',
    'vanessa.scotland@serhant.com',
    'genson.blimline@serhant.com',
    'jonathan.fadoul@serhant.com',
    'liza.farzati@serhant.com',
    'andrea.florez@serhant.com',
    'rob.stack@serhant.com',
    'chris.kinkela@serhant.com',
  ];

  /* ---- MSAL Configuration ---- */
  const msalConfig = {
    auth: {
      clientId: 'f2995b88-7c96-492a-8956-70dcf9b0e70c',
      authority: 'https://login.microsoftonline.com/78533c6a-7050-42e0-81e7-c21fcab6bf16',
      redirectUri: window.location.origin + window.location.pathname,
    },
    cache: {
      cacheLocation: 'memoryStorage',
      storeAuthStateInCookie: false,
    },
  };

  const loginRequest = {
    scopes: ['openid', 'profile', 'email'],
  };

  /* ---- Helpers ---- */
  function isSquadMember(email) {
    return HOME_SQUAD.includes((email || '').toLowerCase());
  }

  function isSquadPage() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    return page === 'squad.html';
  }

  function getFirstName(account) {
    if (!account) return 'Agent';
    // Try name field first, fallback to username before @
    const name = account.name || account.username || '';
    const first = name.split(' ')[0].split('@')[0];
    return first.charAt(0).toUpperCase() + first.slice(1);
  }

  function getUserEmail(account) {
    if (!account) return '';
    // preferredUsername is usually the UPN (email)
    return (account.username || account.preferredUsername || '').toLowerCase();
  }

  /* ---- Inject login overlay HTML into body ---- */
  function injectLoginOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'auth-login-overlay';
    overlay.innerHTML = `
      <div class="auth-login-box">
        <img src="assets/logo-full-white.png" alt="SERHANT. Orlando" class="auth-login-logo">
        <div class="auth-login-hub">Agent Hub</div>
        <button id="auth-signin-btn" class="auth-signin-btn">
          <svg width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M10.5 0.5H0.5V10.5H10.5V0.5Z" fill="#F25022"/>
            <path d="M21 0.5H11V10.5H21V0.5Z" fill="#7FBA00"/>
            <path d="M10.5 11H0.5V21H10.5V11Z" fill="#00A4EF"/>
            <path d="M21 11H11V21H21V11Z" fill="#FFB900"/>
          </svg>
          Sign in with Microsoft
        </button>
        <div class="auth-login-tagline">Sign in with your @serhant.com email</div>
        <div id="auth-login-error" class="auth-login-error" style="display:none"></div>
      </div>
    `;
    document.body.prepend(overlay);
  }

  /* ---- Reveal page ---- */
  function revealPage() {
    document.body.style.visibility = 'visible';
  }

  /* ---- Apply user state to UI ---- */
  function applyUserToUI(account) {
    const email = getUserEmail(account);
    const firstName = getFirstName(account);

    // Show/hide Squad nav link based on membership
    document.querySelectorAll('.nav-links a').forEach(a => {
      if (a.getAttribute('href') === 'squad.html') {
        a.parentElement.style.display = isSquadMember(email) ? '' : 'none';
      }
    });

    // Inject user greeting + sign out into nav
    injectNavUser(firstName, account);

    // Reveal page content
    revealPage();
  }

  /* ---- Inject user name + sign out into the nav ---- */
  function injectNavUser(firstName, account) {
    // Avoid duplicate injection
    if (document.getElementById('auth-nav-user')) return;

    const navInner = document.querySelector('.nav-inner');
    if (!navInner) return;

    const userEl = document.createElement('div');
    userEl.id = 'auth-nav-user';
    userEl.className = 'auth-nav-user';
    userEl.innerHTML = `
      <span class="auth-nav-greeting">Hi, ${firstName}</span>
      <button id="auth-signout-btn" class="auth-signout-btn">Sign Out</button>
    `;
    navInner.appendChild(userEl);

    document.getElementById('auth-signout-btn').addEventListener('click', handleSignOut);
  }

  /* ---- Sign out handler ---- */
  function handleSignOut() {
    const msalInstance = window.__msalInstance;
    if (!msalInstance) return;

    const accounts = msalInstance.getAllAccounts();
    const logoutRequest = accounts.length ? { account: accounts[0] } : {};

    // Clear body visibility lock
    document.body.style.visibility = 'visible';

    msalInstance.logoutPopup(logoutRequest).then(() => {
      window.location.href = 'index.html';
    }).catch(() => {
      // Fallback: clear cache manually and redirect
      // cleared by MSAL logout
      window.location.href = 'index.html';
    });
  }

  /* ---- Show login overlay (covers page content via fixed position) ---- */
  function showLoginScreen() {
    injectLoginOverlay();
    // Reveal body (overlay is fixed and covers everything)
    revealPage();

    const btn = document.getElementById('auth-signin-btn');
    btn.addEventListener('click', handleSignIn);
  }

  /* ---- Sign in handler ---- */
  function handleSignIn() {
    const btn = document.getElementById('auth-signin-btn');
    const errorEl = document.getElementById('auth-login-error');
    btn.disabled = true;
    btn.innerHTML = 'Opening Microsoft…';

    const msalInstance = window.__msalInstance;

    msalInstance.loginPopup(loginRequest).then(response => {
      const account = response.account;
      const email = getUserEmail(account);

      // Validate @serhant.com domain
      if (!email.endsWith('@serhant.com')) {
        errorEl.textContent = 'Access restricted to @serhant.com accounts.';
        errorEl.style.display = 'block';
        btn.disabled = false;
        btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M10.5 0.5H0.5V10.5H10.5V0.5Z" fill="#F25022"/><path d="M21 0.5H11V10.5H21V0.5Z" fill="#7FBA00"/><path d="M10.5 11H0.5V21H10.5V11Z" fill="#00A4EF"/><path d="M21 11H11V21H21V11Z" fill="#FFB900"/></svg> Sign in with Microsoft`;
        return;
      }

      // Squad page: check membership
      if (isSquadPage() && !isSquadMember(email)) {
        errorEl.textContent = 'Squad page access is restricted to Home Squad members.';
        errorEl.style.display = 'block';
        btn.disabled = false;
        btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M10.5 0.5H0.5V10.5H10.5V0.5Z" fill="#F25022"/><path d="M21 0.5H11V10.5H21V0.5Z" fill="#7FBA00"/><path d="M10.5 11H0.5V21H10.5V11Z" fill="#00A4EF"/><path d="M21 11H11V21H21V11Z" fill="#FFB900"/></svg> Sign in with Microsoft`;
        setTimeout(() => { window.location.replace('index.html'); }, 1500);
        return;
      }

      // Remove overlay (page is already visible behind it)
      const overlay = document.getElementById('auth-login-overlay');
      if (overlay) overlay.remove();

      applyUserToUI(account);

    }).catch(err => {
      console.error('MSAL login error:', err);
      errorEl.textContent = 'Sign-in failed. Please try again.';
      errorEl.style.display = 'block';
      btn.disabled = false;
      btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M10.5 0.5H0.5V10.5H10.5V0.5Z" fill="#F25022"/><path d="M21 0.5H11V10.5H21V0.5Z" fill="#7FBA00"/><path d="M10.5 11H0.5V21H10.5V11Z" fill="#00A4EF"/><path d="M21 11H11V21H21V11Z" fill="#FFB900"/></svg> Sign in with Microsoft`;
    });
  }

  /* ---- Main auth entry point ---- */
  function initAuth() {
    // Wait for msal to be available
    if (typeof msal === 'undefined') {
      console.error('MSAL not loaded');
      return;
    }

    const msalInstance = new msal.PublicClientApplication(msalConfig);
    window.__msalInstance = msalInstance;

    // Handle redirect response (for cases where popup was blocked)
    msalInstance.handleRedirectPromise().then(() => {
      const accounts = msalInstance.getAllAccounts();

      if (accounts.length > 0) {
        // Already authenticated
        const account = accounts[0];
        const email = getUserEmail(account);

        // Validate domain
        if (!email.endsWith('@serhant.com')) {
          msalInstance.logoutPopup({ account }).catch(() => {});
          showLoginScreen();
          return;
        }

        // Squad page guard
        if (isSquadPage() && !isSquadMember(email)) {
          window.location.replace('index.html');
          return;
        }

        // All good — reveal page and apply UI
        applyUserToUI(account);

      } else {
        // Not authenticated — determine behavior by page
        const page = window.location.pathname.split('/').pop() || 'index.html';

        if (page === 'index.html' || page === '') {
          // Show login on home page
          showLoginScreen();
        } else {
          // Redirect all other pages back to index.html
          window.location.replace('index.html');
        }
      }

    }).catch(err => {
      console.error('MSAL redirect error:', err);
      showLoginScreen();
    });
  }

  /* ---- Boot: wait for DOM ready ---- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
  } else {
    initAuth();
  }

})();
