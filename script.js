// Map initialization
let map;
let userMarker;

// Simple shared auth utilities (mirrors logic in login.js)
const AUTH_KEY = 'rescue_ai_is_logged_in';
const USERS_KEY = 'rescue_ai_users';
const CURRENT_USER_KEY = 'rescue_ai_current_user';

function seedUsersIfNeeded() {
  const existing = localStorage.getItem(USERS_KEY);
  if (existing) return;
  const seeded = [
    { id: 'gov-1', email: 'gov@rescue.ai', password: 'Gov@12345', role: 'admin', profileComplete: true },
    { id: 'clg-1', email: 'admin@college.edu', password: 'Admin@123', role: 'Colledge admin', profileComplete: true },
    { id: 'stf-1', email: 'teacher@college.edu', password: 'Teacher@123', role: 'Staff', profileComplete: true },
    { id: 'std-1', email: 'student@college.edu', password: 'Student@123', role: 'Students', profileComplete: false }
  ];
  localStorage.setItem(USERS_KEY, JSON.stringify(seeded));
}

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch (_) {
    return [];
  }
}

function setCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ id: user.id, email: user.email, role: user.role, profileComplete: user.profileComplete }));
}

function setAuth(isLoggedIn) {
  localStorage.setItem(AUTH_KEY, isLoggedIn ? 'true' : 'false');
}

function findUserByEmailRole(email, role) {
  const users = getUsers();
  const normalizedEmail = String(email).trim().toLowerCase();
  return users.find((u) => String(u.email).toLowerCase() === normalizedEmail && u.role === role);
}

function initMap() {
  const defaultLatLng = [20.5937, 78.9629]; // India center
  map = L.map('map').setView(defaultLatLng, 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Demo marker
  L.marker([19.076, 72.8777]).addTo(map).bindPopup('Example alert: Mumbai');
}

function locateUser() {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported on this device/browser.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const accuracy = pos.coords.accuracy;

      if (userMarker) {
        map.removeLayer(userMarker);
      }

      userMarker = L.marker([lat, lng]).addTo(map).bindPopup('You are here');
      map.setView([lat, lng], 14);

      L.circle([lat, lng], { radius: accuracy, color: '#ff4d5a', fillOpacity: 0.1 }).addTo(map);
    },
    (err) => {
      console.error(err);
      alert('Unable to retrieve your location.');
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
  );
}

// Form placeholder submit
function handleFormSubmit() {
  const form = document.getElementById('alert-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    console.log('Alert submitted', data);
    alert('Alert submitted! (Demo)');
    form.reset();
  });
}

// Simple auth gate using localStorage
function setupAuthGate() {
  const loginModal = document.getElementById('login-modal');
  const loginBackdrop = document.getElementById('login-backdrop');
  const openBtn = document.getElementById('open-login');
  const closeBtn = document.getElementById('close-login');
  const loginForm = document.getElementById('login-form');
  const gatedLinks = document.querySelectorAll('.requires-auth');

  function setGatedState(enabled) {
    gatedLinks.forEach((a) => {
      if (enabled) {
        a.removeAttribute('aria-disabled');
      } else {
        a.setAttribute('aria-disabled', 'true');
      }
    });
  }

  function openModal() {
    loginModal.hidden = false;
    loginBackdrop.hidden = false;
  }
  function closeModal() {
    loginModal.hidden = true;
    loginBackdrop.hidden = true;
  }

  const isLoggedIn = localStorage.getItem(AUTH_KEY) === 'true';
  setGatedState(isLoggedIn);

  if (!isLoggedIn) {
    if (loginModal && loginBackdrop) {
      openModal();
    }
  }

  openBtn?.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);
  loginBackdrop?.addEventListener('click', closeModal);

  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(loginForm).entries());
    const email = data.username;
    const password = data.password;
    const role = data.role;

    if (!email || !password || !role) {
      alert('Please fill all fields.');
      return;
    }

    // Ensure users are seeded and validate against them
    seedUsersIfNeeded();
    const user = findUserByEmailRole(email, role);
    if (!user || user.password !== password) {
      alert('Invalid credentials or role.');
      return;
    }

    setAuth(true);
    setCurrentUser(user);
    setGatedState(true);
    closeModal();
    alert('Logged in successfully.');
  });
}

// Event bindings
window.addEventListener('DOMContentLoaded', () => {
  // Ensure demo users exist for auth validation
  seedUsersIfNeeded();
  initMap();
  handleFormSubmit();
  document.getElementById('locate-btn').addEventListener('click', locateUser);
  setupAuthGate();

  // Logout button for temporary demo auth
  let logoutBtn = document.getElementById('logout-btn');
  if (!logoutBtn) {
    const navActions = document.querySelector('.nav-actions');
    if (navActions) {
      logoutBtn = document.createElement('button');
      logoutBtn.id = 'logout-btn';
      logoutBtn.className = 'btn btn-light';
      logoutBtn.title = 'Clear login and go to Login';
      logoutBtn.textContent = 'Logout';
      navActions.appendChild(logoutBtn);
    }
  }

  logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem('rescue_ai_is_logged_in');
    localStorage.removeItem('rescue_ai_current_user');
    window.location.href = 'login.html';
  });
});


