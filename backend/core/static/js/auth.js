// const toggleAuthMode = document.getElementById('toggle-auth-mode');
// const signupFields = document.getElementById('signup-fields');
// const formTitle = document.querySelector('.card-title');
// const cardDescription = document.querySelector('.card-description');
// const submitButton = document.getElementById('form-submit-button');
// const separatorText = document.getElementById('separator-text');

// let isLogin = true;

// function updateFormMode() {
//   if (isLogin) {
//     formTitle.textContent = 'Bienvenue sur PauseCoquine';
//     cardDescription.textContent = 'Connectez-vous à votre compte';
//     toggleAuthMode.textContent = 'Pas encore inscrit ? Créer un compte';
//     submitButton.textContent = 'Se connecter';
//     separatorText.textContent = 'ou se connecter manuellement';
//     signupFields.style.display = 'none';
//     history.replaceState({}, '', '?mode=login');
//   } else {
//     formTitle.textContent = 'Inscrivez-vous sur PauseCoquine';
//     cardDescription.textContent = 'Créez votre compte pour commencer';
//     toggleAuthMode.textContent = 'Déjà inscrit ? Se connecter';
//     submitButton.textContent = 'Créer mon compte';
//     separatorText.textContent = "ou s'inscrire manuellement";
//     signupFields.style.display = 'block';
//     history.replaceState({}, '', '?mode=signup');
//   }
// }

// toggleAuthMode.addEventListener('click', function (e) {
//   e.preventDefault();
//   isLogin = !isLogin;
//   updateFormMode();
// });

// function getCookie(name) {
//   let cookieValue = null;
//   if (document.cookie && document.cookie !== '') {
//     const cookies = document.cookie.split(';');
//     for (let cookie of cookies) {
//       if (cookie.trim().startsWith(name + '=')) {
//         cookieValue = decodeURIComponent(cookie.trim().substring(name.length + 1));
//         break;
//       }
//     }
//   }
//   return cookieValue;
// }

// console.log("Script started"); // Should appear in console
// window.addEventListener('DOMContentLoaded', function () {
//   console.log("DOMContentLoaded fired"); // Check if this appears
//   const ageSelect = document.getElementById('age');
//   console.log(ageSelect);
//   if (ageSelect) {
//     ageSelect.innerHTML = '<option value="">Sélectionnez votre âge</option>';

//     for (let i = 18; i <= 80; i++) {
//       const option = document.createElement('option');
//       option.value = i;
//       option.textContent = i;
//       ageSelect.appendChild(option);
//     }
//   }

//   const params = new URLSearchParams(window.location.search);
//   isLogin = !(params.get('mode') === 'signup');
//   updateFormMode();

//   const form = document.getElementById('login-form');
//   form.addEventListener('submit', function (e) {
//     e.preventDefault();

//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;
//     const csrftoken = getCookie('csrftoken');

//     if (isLogin) {
//       fetch('/accounts/login/', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'X-CSRFToken': csrftoken
//         },
//         body: JSON.stringify({ email, password })
//       })
//         .then(res => res.json())
//         .then(data => {
//           if (data.success) {
//             localStorage.setItem('user', JSON.stringify({ email: data.user.email })); // Set user data

//             window.location.href = '/accounts/dashboard/';
//           } else {
//             alert(data.error || 'Login failed');
//           }
//         });
//     } else {
//       const name = document.getElementById('firstName').value;
//       const age = document.getElementById('age').value;

//       fetch('/accounts/signup/', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'X-CSRFToken': csrftoken
//         },
//         body: JSON.stringify({ name, email, password, age })
//       })
//         .then(res => res.json())
//         .then(data => {
//           if (data.success) {
//             localStorage.setItem('user', JSON.stringify({ email: data.user.email })); // Set user data
//             window.location.href = '/accounts/dashboard/';
//           } else {
//             alert(data.error || 'Signup failed');
//           }
//         });
//     }
//   });
// });
