import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { googleProvider } from "../firebase.mjs";

const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const googleBtn = document.getElementById("googleBtn");
const errorDiv = document.createElement("div");
errorDiv.className = "error-message";
errorDiv.style.display = "none";
loginForm.parentElement.insertBefore(errorDiv, loginForm);

// Email/Password Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  loginBtn.disabled = true;
  loginBtn.textContent = "Signing in...";
  errorDiv.style.display = "none";

  try {
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Redirect happens via onAuthStateChanged listener
  } catch (error) {
    errorDiv.textContent = error.message || "Failed to sign in. Please check your credentials.";
    errorDiv.style.display = "block";
    loginBtn.disabled = false;
    loginBtn.textContent = "Sign In";
  }
});

// Google Sign-In
googleBtn.addEventListener("click", async () => {
  try {
    const auth = getAuth();
    const userCredential = await signInWithPopup(auth, googleProvider);
    // Redirect happens via onAuthStateChanged listener
  } catch (error) {
    console.error("Google sign-in error:", error);
    alert("Google sign-in failed: " + (error.message || "Please try again."));
  }
});

const getCurrentUser = () => {
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.location.href = "../Posts/index.html";
    }
  });
};

getCurrentUser();
