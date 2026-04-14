/**
 * Preview Mode - "View As" dropdown for operators (Mark/Sarah).
 * Overrides the effective email used by Studios pages.
 * Only visible to operators. Resets on page reload unless pinned.
 *
 * Usage: Include this script on any Studios page.
 * It exposes window.__previewEmail which pages should use instead of raw localStorage email.
 */
(function() {
  var OPERATORS = ['mark@serhant.com', 'sarah.raumaker@serhant.com'];
  var realEmail = (localStorage.getItem('portal_user_email') || '').toLowerCase();

  // Preview personas
  var PERSONAS = [
    { email: realEmail, label: 'Myself (' + (localStorage.getItem('portal_user_name') || 'Me') + ')' },
    { email: 'daniel.botton@serhant.com', label: 'Danny (Producer)' },
    { email: 'hailey@serhant.com', label: 'Hailey (Producer)' },
    { email: 'sarah.raumaker@serhant.com', label: 'Sarah (Operator)' },
    { email: 'andrea.florez@serhant.com', label: 'Andrea (Agent)' },
    { email: 'chris.kinkela@serhant.com', label: 'Chris (Agent)' },
    { email: 'test.agent@serhant.com', label: 'Test Agent' },
  ];

  // Check if operator
  if (OPERATORS.indexOf(realEmail) === -1) {
    window.__previewEmail = realEmail;
    window.__previewName = localStorage.getItem('portal_user_name') || '';
    return;
  }

  // Check for saved preview
  var savedPreview = sessionStorage.getItem('portal_preview_email');
  var activeEmail = savedPreview || realEmail;
  window.__previewEmail = activeEmail;
  window.__previewName = activeEmail === realEmail
    ? (localStorage.getItem('portal_user_name') || '')
    : PERSONAS.find(function(p) { return p.email === activeEmail; })?.label?.split(' (')[0] || activeEmail.split('@')[0];

  // Build the dropdown
  function render() {
    var container = document.createElement('div');
    container.id = 'preview-bar';
    container.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;display:flex;align-items:center;justify-content:center;gap:12px;padding:8px 16px;background:rgba(104,104,238,0.95);backdrop-filter:blur(8px);font-family:Montserrat,sans-serif;font-size:12px;font-weight:600;color:white;';

    var label = document.createElement('span');
    label.textContent = 'VIEW AS';
    label.style.cssText = 'letter-spacing:2px;opacity:0.7;font-size:10px;';

    var select = document.createElement('select');
    select.style.cssText = 'background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);border-radius:8px;padding:6px 12px;color:white;font-family:Montserrat,sans-serif;font-size:12px;font-weight:600;cursor:pointer;outline:none;';

    PERSONAS.forEach(function(p) {
      var opt = document.createElement('option');
      opt.value = p.email;
      opt.textContent = p.label;
      opt.style.color = '#1a1a2e';
      if (p.email === activeEmail) opt.selected = true;
      select.appendChild(opt);
    });

    select.onchange = function() {
      var val = select.value;
      if (val === realEmail) {
        sessionStorage.removeItem('portal_preview_email');
      } else {
        sessionStorage.setItem('portal_preview_email', val);
      }
      window.location.reload();
    };

    var exitBtn = document.createElement('button');
    exitBtn.textContent = 'EXIT PREVIEW';
    exitBtn.style.cssText = 'background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);border-radius:8px;padding:6px 14px;color:white;font-family:Montserrat,sans-serif;font-size:10px;font-weight:700;letter-spacing:1px;cursor:pointer;display:' + (activeEmail !== realEmail ? 'block' : 'none') + ';';
    exitBtn.onclick = function() {
      sessionStorage.removeItem('portal_preview_email');
      window.location.reload();
    };

    container.appendChild(label);
    container.appendChild(select);
    container.appendChild(exitBtn);

    // Add padding to body so content isn't hidden behind the bar
    document.body.style.paddingTop = '40px';
    document.body.insertBefore(container, document.body.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
