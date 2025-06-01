// Importación del SDK y configuración personalizada de tu proyecto


// SDK de Firebase v9 modular
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Configuración personalizada de tu proyecto (sacada desde Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyD3IJrBzTVpAf1kdfEbTp00UOyLiAkpwCE",
  authDomain: "mundial-jag-2025.firebaseapp.com",
  projectId: "mundial-jag-2025",
  storageBucket: "mundial-jag-2025.firebasestorage.app",
  messagingSenderId: "729549583991",
  appId: "1:729549583991:web:97f407686d4e5e291db872"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
