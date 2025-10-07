(function () {
  const AUTH_KEY = 'rescue_ai_is_logged_in';
  const CURRENT_USER_KEY = 'rescue_ai_current_user';

  function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    } catch (_) {
      return null;
    }
  }

  function requireStudent() {
    const loggedIn = localStorage.getItem(AUTH_KEY) === 'true';
    const user = getCurrentUser();
    if (!loggedIn || !user || user.role !== 'Students') {
      // Not a student or not logged in -> go to login
      window.location.href = 'login.html';
      return null;
    }
    return user;
  }

  window.addEventListener('DOMContentLoaded', () => {
    const user = requireStudent();
    if (!user) return;

    // Identity in navbar
    const identity = document.getElementById('student-identity');
    if (identity) {
      identity.textContent = `${user.email}`;
    }

    // Logout
    const logoutBtn = document.getElementById('student-logout');
    logoutBtn?.addEventListener('click', () => {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);
      window.location.href = 'login.html';
    });

    // Realtime: send SOS/message to admins
    document.getElementById('create-sos')?.addEventListener('click', async () => {
      const payload = {
        type: 'student:sos',
        fromUserId: user.id,
        fromRole: 'Students',
        text: 'SOS triggered by student',
      };
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          payload.location = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
          window.Realtime?.send(payload);
        }, () => { window.Realtime?.send(payload); });
      } else {
        window.Realtime?.send(payload);
      }
      alert('SOS sent');
    });
    document.getElementById('refresh-alerts')?.addEventListener('click', () => {
      alert('Alerts refreshed (demo).');
    });
    document.getElementById('edit-profile')?.addEventListener('click', () => {
      alert('Profile edit coming soon (demo).');
    });

    // Chat widget (student)
    const chat = document.getElementById('chat-student');
    const chatMsgs = document.getElementById('chat-messages-student');
    const chatForm = document.getElementById('chat-form-student');
    const chatInput = document.getElementById('chat-input-student');
    const chatClose = document.getElementById('chat-close-student');
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
      window.Realtime?.send({ type: 'chat:student-to-college', fromUserId: user.id, text });
      appendBubble(text, true);
      chatInput.value = '';
    });
    chatClose?.addEventListener('click', () => { if (chat) chat.hidden = true; });

    window.Realtime?.onMessage((msg) => {
      if (msg?.type === 'chat:college-to-student') appendBubble(msg.text, false);
    });
  });
})();


