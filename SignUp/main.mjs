import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { googleProvider } from "../firebase.mjs";

const signUpForm = document.getElementById("signupForm");
const signupBtn = document.getElementById("signupBtn");
const googleBtn = document.getElementById("googleBtn");
const errorDiv = document.createElement("div");
errorDiv.className = "error-message";
errorDiv.style.display = "none";
signUpForm.parentElement.insertBefore(errorDiv, signUpForm);

// Email/Password Sign Up
signUpForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    errorDiv.textContent = "Passwords do not match.";
    errorDiv.style.display = "block";
    return;
  }

  if (password.length < 6) {
    errorDiv.textContent = "Password must be at least 6 characters.";
    errorDiv.style.display = "block";
    return;
  }

  signupBtn.disabled = true;
  signupBtn.textContent = "Creating account...";
  errorDiv.style.display = "none";

  try {
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Redirect happens via onAuthStateChanged listener
  } catch (error) {
    errorDiv.textContent = error.message || "Failed to create account. Please try again.";
    errorDiv.style.display = "block";
    signupBtn.disabled = false;
    signupBtn.textContent = "Create Account";
  }
});

// Google Sign-Up
googleBtn.addEventListener("click", async () => {
  try {
    const auth = getAuth();
    const userCredential = await signInWithPopup(auth, googleProvider);
    // Redirect happens via onAuthStateChanged listener
  } catch (error) {
    console.error("Google sign-up error:", error);
    alert("Google sign-up failed: " + (error.message || "Please try again."));
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
