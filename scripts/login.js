import { auth } from './firebase-config.js'; // ajusta la ruta si es necesario
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// Elementos del modal de login
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const mensajeError = document.getElementById('mensajeError');
const logoutBtn = document.getElementById("logout-btn");

// Controlar visibilidad del modal y del botón de logout según el estado de autenticación
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Usuario autenticado
    if (loginModal) loginModal.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
  } else {
    // No autenticado
    if (loginModal) loginModal.style.display = 'flex';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }
});

// Iniciar sesión
loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    mensajeError.textContent = "";
  } catch (error) {
    mensajeError.textContent = "Correo o contraseña incorrectos.";
    console.error(error);
  }
});

// Cerrar sesión
logoutBtn?.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      console.log("Sesión cerrada");
      location.reload(); // Recargar la página
    })
    .catch((error) => {
      console.error("Error al cerrar sesión:", error);
    });
});
