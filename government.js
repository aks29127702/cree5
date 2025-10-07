(function () {
  const AUTH_KEY = 'rescue_ai_is_logged_in';
  const CURRENT_USER_KEY = 'rescue_ai_current_user';
  const USERS_KEY = 'rescue_ai_users';

  function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    } catch (_) {
      return null;
    }
  }

  function requireAdmin() {
    const loggedIn = localStorage.getItem(AUTH_KEY) === 'true';
    const user = getCurrentUser();
    if (!loggedIn || !user || user.role !== 'admin') {
      window.location.href = 'login.html';
      return null;
    }
    return user;
  }

  window.addEventListener('DOMContentLoaded', () => {
    // Realtime receive from students
    window.Realtime?.onMessage((msg) => {
      if (msg?.type === 'student:sos') {
        const who = msg.fromUserId || 'student';
        const loc = msg.location ? ` @ (${msg.location.lat.toFixed(4)}, ${msg.location.lng.toFixed(4)})` : '';
        window.Realtime.ui.showToast(`SOS from ${who}${loc}`);
        window.Realtime.notifyBrowser('SOS Alert', `SOS from ${who}`);
      }
    });

    const user = requireAdmin();
    if (!user) return;

    const identity = document.getElementById('gov-identity');
    if (identity) identity.textContent = `${user.email}`;

    document.getElementById('gov-logout')?.addEventListener('click', () => {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);
      window.location.href = 'login.html';
    });

    // Manage Users modal open/close and demo handlers
    const openBtn = document.getElementById('manage-users-link');
    const modal = document.getElementById('manage-users-modal');
    const backdrop = document.getElementById('manage-users-backdrop');
    const closeBtn = document.getElementById('close-manage-users');
    function setDisplay(el, shown) {
      if (!el) return;
      el.hidden = !shown;
      el.style.display = shown ? '' : 'none';
    }
    function openModal() { setDisplay(modal, true); setDisplay(backdrop, true); }
    function closeModal() { setDisplay(modal, false); setDisplay(backdrop, false); }
    // Ensure modal is closed on initial load regardless of prior state
    setDisplay(modal, false);
    setDisplay(backdrop, false);
    openBtn?.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    closeBtn?.addEventListener('click', closeModal);
    backdrop?.addEventListener('click', closeModal);

    // USERS TABLE RENDERING (reads from localStorage for now)
    function getUsers() {
      try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch (_) { return []; }
    }
    function renderUsersTable() {
      const tbody = document.getElementById('manage-users-tbody');
      if (!tbody) return;
      const users = getUsers().filter(u => u.role === 'Colledge admin');
      tbody.innerHTML = '';
      users.forEach((u, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${idx + 1}</td>
          <td>${u.name || '—'}</td>
          <td>${u.email}</td>
          <td>${u.password || '—'}</td>
          <td style="text-align:right;">
            <button class="btn btn-light user-edit" data-id="${u.id}">Edit</button>
            <button class="btn btn-primary user-delete" data-id="${u.id}" style="background:#fee2e2;color:#991b1b;">Delete</button>
          </td>`;
        tbody.appendChild(tr);
      });
    }
    renderUsersTable();

    // Delete/edit/add actions (delete persists to localStorage; others are placeholders)
    document.getElementById('manage-users-tbody')?.addEventListener('click', (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.classList.contains('user-delete')) {
        const id = target.getAttribute('data-id');
        const users = getUsers().filter(u => u.id !== id);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        renderUsersTable();
      }
      if (target.classList.contains('user-edit')) {
        alert('Open edit form (to be implemented)');
      }
    });

    // ADD USER MODAL
    const addBackdrop = document.getElementById('add-user-backdrop');
    const addModal = document.getElementById('add-user-modal');
    const addBtn = document.getElementById('add-user-btn');
    const addClose = document.getElementById('close-add-user');
    function openAdd() { setDisplay(addModal, true); setDisplay(addBackdrop, true); }
    function closeAdd() { setDisplay(addModal, false); setDisplay(addBackdrop, false); }
    setDisplay(addModal, false); setDisplay(addBackdrop, false);
    addBtn?.addEventListener('click', (e) => { e.preventDefault(); openAdd(); });
    addClose?.addEventListener('click', closeAdd);
    addBackdrop?.addEventListener('click', closeAdd);

    // Add User form handlers
    const addForm = document.getElementById('add-user-form');
    const addReset = document.getElementById('add-user-reset');
    addReset?.addEventListener('click', () => addForm?.reset());
    addForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(addForm).entries());
      const id = `clg-${Date.now()}`;
      const newUser = {
        id,
        name: data.name,
        email: String(data.email).trim().toLowerCase(),
        password: data.password,
        role: 'Colledge admin',
        profileComplete: true
      };
      const users = getUsers();
      users.push(newUser);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      addForm.reset();
      closeAdd();
      renderUsersTable();
      alert('User added. You can now log in with the new email/password under Colledge admin role.');
    });
  });
})();


