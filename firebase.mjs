import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyALxHUWc912K5EmYx66SznRLaPViWFSWoo",
  authDomain: "luminea-38232.firebaseapp.com",
  projectId: "luminea-38232",
  storageBucket: "luminea-38232.firebasestorage.app",
  messagingSenderId: "711422096606",
  appId: "1:711422096606:web:cb070a73a5101d36103e4f",
  measurementId: "G-0PG4Q6TR46"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };