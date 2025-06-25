document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('login-form');
  const toggleAuthMode = document.getElementById('toggle-auth-mode');
  const errorMessage = document.getElementById('error-message');
  const signupFields = document.getElementById('signup-fields');
  const separatorText = document.querySelector('.separator span');
  const submitButton = document.querySelector('.submit-button');
  const cardDescription = document.querySelector('.card-description');
  const ageSelect = document.getElementById('age');

  let isLogin = true;

  // Initialize age dropdown
  if (ageSelect) {
    for (let i = 18; i <= 80; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = `${i} ans`;
      ageSelect.appendChild(option);
    }
  }

  // Toggle between login and signup modes
  toggleAuthMode.addEventListener('click', function (e) {
    e.preventDefault();
    isLogin = !isLogin;

    if (isLogin) {
      cardDescription.textContent = 'Connectez-vous à votre compte';
      toggleAuthMode.textContent = 'Pas encore inscrit ? Créer un compte';
      submitButton.textContent = 'Se connecter';
      separatorText.textContent = 'ou se connecter manuellement';
      signupFields.style.display = 'none';
    } else {
      cardDescription.textContent = 'Créez votre compte pour commencer';
      toggleAuthMode.textContent = 'Déjà inscrit ? Se connecter';
      submitButton.textContent = 'Créer mon compte';
      separatorText.textContent = "ou s'inscrire manuellement";
      signupFields.style.display = 'block';
    }
  });

  // Handle form submission
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (isLogin) {
      // Login validation
      if (!email || !password) {
        showError('Veuillez remplir tous les champs');
        return;
      }
    } else {
      // Signup validation
      const firstName = document.getElementById('firstName').value;
      const age = document.getElementById('age').value;

      if (!firstName || !email || !password || !age) {
        showError('Veuillez remplir tous les champs');
        return;
      }

      if (parseInt(age) < 18) {
        showError('Vous devez avoir au moins 18 ans pour vous inscrire.');
        return;
      }
    }

    // Store user and redirect
    const username = isLogin ? email.split('@')[0] : document.getElementById('firstName').value;
    localStorage.setItem('user', username);
    window.location.href = 'chat.html';
  });

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
      errorMessage.style.display = 'none';
    }, 5000);
  }

  // Check if user is already logged in
  if (localStorage.getItem('user') && window.location.pathname.endsWith('index.html')) {
    window.location.href = 'chat.html';
  }
});