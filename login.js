(function () {
  const AUTH_KEY = 'rescue_ai_is_logged_in';
  const USERS_KEY = 'rescue_ai_users';
  const CURRENT_USER_KEY = 'rescue_ai_current_user';

  // Seed demo hierarchy if not present
  function seedUsersIfNeeded() {
    const existing = localStorage.getItem(USERS_KEY);
    if (existing) return;
    const seeded = [
      // Government / Super panel
      { id: 'gov-1', email: 'gov@rescue.ai', password: 'Gov@12345', role: 'admin', profileComplete: true },
      // College admin created by government
      { id: 'clg-1', email: 'admin@college.edu', password: 'Admin@123', role: 'Colledge admin', profileComplete: true },
      // Staff created by college
      { id: 'stf-1', email: 'teacher@college.edu', password: 'Teacher@123', role: 'Staff', profileComplete: true },
      // Student created by college (first time -> needs profile)
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

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
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

  // Enable/disable gated links
  const gated = document.querySelectorAll('.requires-auth');
  function setGatedState(enabled) {
    gated.forEach((a) => {
      if (enabled) {
        a.removeAttribute('aria-disabled');
      } else {
        a.setAttribute('aria-disabled', 'true');
        a.addEventListener('click', (e) => {
          e.preventDefault();
          alert('Please login first.');
        });
      }
    });
  }

  // Initialize
  seedUsersIfNeeded();
  const isLoggedIn = localStorage.getItem(AUTH_KEY) === 'true';
  setGatedState(isLoggedIn);

  const form = document.getElementById('login-form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const email = data.username; // Treat username field as email for now
    const password = data.password;
    const role = data.role;

    if (!email || !password || !role) {
      alert('Please fill all fields.');
      return;
    }

    const user = findUserByEmailRole(email, role);
    if (!user) {
      alert('Invalid credentials or role.');
      return;
    }
    if (user.password !== password) {
      alert('Invalid credentials or role.');
      return;
    }

    // Auth success
    setAuth(true);
    setCurrentUser(user);

    // Redirect logic
    if (user.role === 'Students') {
      window.location.href = 'student.html';
      return;
    }
    if (user.role === 'admin') {
      window.location.href = 'government.html';
      return;
    }
    if (user.role === 'Colledge admin') {
      window.location.href = 'college.html';
      return;
    }

    alert('Logged in successfully.');
    window.location.href = 'emeregency%20alert%20System.html';
  });
})();


