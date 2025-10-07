(function () {
  const AUTH_KEY = 'rescue_ai_is_logged_in';
  const CURRENT_USER_KEY = 'rescue_ai_current_user';

  function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem(CURRENT_USER_KEY)); } catch (_) { return null; }
  }

  function requireCollegeAdmin() {
    const loggedIn = localStorage.getItem(AUTH_KEY) === 'true';
    const user = getCurrentUser();
    if (!loggedIn || !user || user.role !== 'Colledge admin') {
      window.location.href = 'login.html';
      return null;
    }
    return user;
  }

  window.addEventListener('DOMContentLoaded', () => {
    const user = requireCollegeAdmin();
    if (!user) return;

    const identity = document.getElementById('college-identity');
    if (identity) identity.textContent = `${user.email}`;

    document.getElementById('college-logout')?.addEventListener('click', () => {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);
      window.location.href = 'login.html';
    });

    // Realtime receive
    window.Realtime?.onMessage((msg) => {
      if (msg?.type === 'student:sos') {
        const who = msg.fromUserId || 'student';
        const loc = msg.location ? ` @ (${msg.location.lat.toFixed(4)}, ${msg.location.lng.toFixed(4)})` : '';
        window.Realtime.ui.showToast(`SOS from ${who}${loc}`);
        window.Realtime.notifyBrowser('SOS Alert', `SOS from ${who}`);
      }
      if (msg?.type === 'chat:student-to-college') {
        appendBubble(msg.text, false);
      }
    });

    // Dummy click handlers for right action cards
    document.querySelectorAll('.action button').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const card = e.currentTarget.closest('.action');
        const action = card?.getAttribute('data-action');
        alert(`${action} clicked (demo)`);
      });
    });

    // Dummy click handlers for left menu links
    document.querySelectorAll('.menu-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const action = e.currentTarget.getAttribute('data-action');
        alert(`${action} clicked (demo)`);
      });
    });

    // Chat widget (college)
    const chat = document.getElementById('chat-college');
    const chatMsgs = document.getElementById('chat-messages-college');
    const chatForm = document.getElementById('chat-form-college');
    const chatInput = document.getElementById('chat-input-college');
    const chatClose = document.getElementById('chat-close-college');
    if (chat) chat.hidden = false;

    function appendBubble(text, isMe) {
      const row = document.createElement('div');
      row.className = 'chat-row';
      const b = document.createElement('div');
      b.className = `chat-bubble ${isMe ? 'me' : 'them'}`;
      b.textContent = text;
      row.appendChild(b);
      chatMsgs.appendChild(row);
      chatMsgs.scrollTop = chatMsgs.scrollHeight;
    }

    chatForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = String(chatInput.value || '').trim();
      if (!text) return;
      window.Realtime?.send({ type: 'chat:college-to-student', fromUserId: user.id, text });
      appendBubble(text, true);
      chatInput.value = '';
    });
    chatClose?.addEventListener('click', () => { if (chat) chat.hidden = true; });
  });
})();


