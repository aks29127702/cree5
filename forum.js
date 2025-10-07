(function () {
  const USERS_KEY = 'rescue_ai_users';
  const CURRENT_USER_KEY = 'rescue_ai_current_user';

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
  function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    } catch (_) {
      return null;
    }
  }
  function setCurrentUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }

  const form = document.getElementById('profile-form');

  // If current user already completed profile, go home
  const current = getCurrentUser();
  if (!current) {
    // not logged in; bounce to login
    window.location.href = 'login.html';
    return;
  }
  if (current.profileComplete) {
    window.location.href = 'emeregency%20alert%20System.html';
    return;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(form).entries());

    // Extra validation
    if (values.phone && !/^[0-9+()\-\s]{7,}$/.test(values.phone)) {
      alert('Please enter a valid phone number.');
      return;
    }
    if (!values.guardianEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.guardianEmail)) {
      alert("Please enter a valid Guardian's email.");
      return;
    }

    // Persist profile data in localStorage under the user record
    const users = getUsers();
    const idx = users.findIndex((u) => u.id === current.id);
    if (idx === -1) {
      alert('User record not found.');
      return;
    }

    users[idx] = {
      ...users[idx],
      profileComplete: true,
      profile: {
        name: values.name,
        dob: values.dob,
        gender: values.gender,
        aadhaar: values.aadhaar || '',
        phone: values.phone || '',
        city: values.city,
        state: values.state,
        institution: values.institution,
        course: values.course,
        guardianEmail: values.guardianEmail
      }
    };
    saveUsers(users);

    // Update current user snapshot
    const updatedCurrent = { ...current, profileComplete: true };
    setCurrentUser(updatedCurrent);

    alert('Profile submitted successfully.');
    window.location.href = 'emeregency%20alert%20System.html';
  });
})();


