// DOM Elements
const signupFields = document.getElementById('signup-fields');
const formTitle = document.querySelector('.card-title');
const cardDescription = document.querySelector('.card-description');
const submitButton = document.getElementById('form-submit-button');
const separatorText = document.getElementById('separator-text');
const toggleAuthMode = document.getElementById('toggle-auth-mode');

let isLogin = true;

// Detect mode based on URL path
const path = window.location.pathname;
if (path.includes('signup-page')) {
  isLogin = false;
} else {
  isLogin = true;
}

// Update form UI based on mode
function updateFormMode() {
  if (isLogin) {
    formTitle.textContent = 'Bienvenue sur PauseCoquine';
    cardDescription.textContent = 'Connectez-vous à votre compte';
    submitButton.textContent = 'Se connecter';
    separatorText.textContent = 'ou se connecter manuellement';
    signupFields.style.display = 'none';

    if (toggleAuthMode) {
      toggleAuthMode.textContent = 'Pas encore inscrit ? Créer un compte';
    }
  } else {
    formTitle.textContent = 'Inscrivez-vous sur PauseCoquine';
    cardDescription.textContent = 'Créez votre compte pour commencer';
    submitButton.textContent = 'Créer mon compte';
    separatorText.textContent = "ou s'inscrire manuellement";
    signupFields.style.display = 'block';

    if (toggleAuthMode) {
      toggleAuthMode.textContent = 'Déjà inscrit ? Se connecter';
    }
  }
}

// Redirect-based toggle behavior
if (toggleAuthMode) {
  toggleAuthMode.addEventListener('click', function (e) {
    e.preventDefault();
    if (isLogin) {
      window.location.href = '/accounts/signup-page/';
    } else {
      window.location.href = '/accounts/';
    }
  });
}

// CSRF helper
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      if (cookie.trim().startsWith(name + '=')) {
        cookieValue = decodeURIComponent(cookie.trim().substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// On page load
window.addEventListener('DOMContentLoaded', function () {
  // Fill age dropdown
  const ageSelect = document.getElementById('age');
  if (ageSelect) {
    ageSelect.innerHTML = '<option value="">Sélectionnez votre âge</option>';
    for (let i = 18; i <= 80; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = i;
      ageSelect.appendChild(option);
    }
  }

  // Update form texts and fields
  updateFormMode();

  // Handle form submit
  const form = document.getElementById('login-form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const csrftoken = getCookie('csrftoken');

    if (isLogin) {
      // LOGIN
      fetch('/accounts/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({ email, password })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            localStorage.setItem('user', JSON.stringify({ email }));
            window.location.href = '/accounts/dashboard/';
          } else {
            alert(data.error || 'Login failed');
          }
        });
    } else {
      // SIGNUP
      const name = document.getElementById('firstName').value;
      const rawAge = document.getElementById('age').value;
      const age = rawAge === "" ? null : parseInt(rawAge);

      fetch('/accounts/signup/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({ name, email, password, age })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            localStorage.setItem('user', JSON.stringify({ email }));
            window.location.href = '/accounts/dashboard/';
          } else {
            alert(data.error || 'Signup failed');
          }
        });
    }
  });
});
