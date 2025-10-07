(function () {
  const CHANNEL_NAME = 'rescue_ai_realtime_v1';
  const STORAGE_KEY = 'rescue_ai_realtime_messages';

  function nowIso() { return new Date().toISOString(); }

  function readStored() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch (_) { return []; }
  }
  function writeStored(messages) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }

  function storeMessage(message) {
    const messages = readStored();
    messages.push(message);
    writeStored(messages);
  }

  function createChannel() {
    try { return new BroadcastChannel(CHANNEL_NAME); } catch (_) { return null; }
  }

  function notifyAllListeners(message) {
    document.dispatchEvent(new CustomEvent('rescue:realtime', { detail: message }));
  }

  // Fallback via storage events
  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY) return;
    try {
      const messages = JSON.parse(String(e.newValue || '[]'));
      const last = messages[messages.length - 1];
      if (last) notifyAllListeners(last);
    } catch (_) {}
  });

  const channel = createChannel();
  if (channel) {
    channel.onmessage = (e) => { notifyAllListeners(e.data); };
  }

  function send(message) {
    const withMeta = { id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`, createdAt: nowIso(), ...message };
    storeMessage(withMeta);
    if (channel) { try { channel.postMessage(withMeta); } catch (_) {} }
    // Trigger fallback listeners in same tab
    notifyAllListeners(withMeta);
  }

  // Simple toast UI
  function showToast(text) {
    let container = document.getElementById('realtime-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'realtime-toast-container';
      container.style.position = 'fixed';
      container.style.right = '16px';
      container.style.bottom = '16px';
      container.style.display = 'grid';
      container.style.gap = '10px';
      container.style.zIndex = '2000';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.textContent = text;
    toast.style.background = '#111827';
    toast.style.color = '#fff';
    toast.style.padding = '10px 12px';
    toast.style.borderRadius = '10px';
    toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.25)';
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4500);
  }

  // Web Notification helper
  async function notifyBrowser(title, body) {
    try {
      if (!('Notification' in window)) return;
      if (Notification.permission === 'default') await Notification.requestPermission();
      if (Notification.permission === 'granted') new Notification(title, { body });
    } catch (_) {}
  }

  // Public API
  window.Realtime = {
    send,
    onMessage(handler) {
      document.addEventListener('rescue:realtime', (e) => handler(e.detail));
    },
    ui: { showToast },
    notifyBrowser,
    readStored
  };
})();


