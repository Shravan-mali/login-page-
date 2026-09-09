// ============================================
// YouTube AI Agent - Authentication
// ============================================

import { auth } from "./firebase.js";

import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ============================================
// ELEMENTS
// ============================================

const emailForm = document.getElementById("emailForm");
const googleBtn = document.getElementById("googleBtn");
const appleBtn = document.getElementById("appleBtn");
const signupBtn = document.getElementById("signup");
const errorBox = document.getElementById("error");


// ============================================
// ERROR FUNCTIONS
// ============================================

function showError(message) {
  if (!errorBox) return;

  errorBox.innerText = message;
  errorBox.style.display = "block";
}

function clearError() {
  if (!errorBox) return;

  errorBox.innerText = "";
  errorBox.style.display = "none";
}


// ============================================
// EMAIL LOGIN
// ============================================

if (emailForm) {
  emailForm.addEventListener("submit", async (event) => {

    event.preventDefault();
    clearError();

    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value;

    if (!email || !password) {
      showError("Please enter email and password.");
      return;
    }

    try {

      const result = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log("Login successful:", result.user);

      // Go to dashboard
      window.location.href = "./dashboard.html";

    } catch (error) {

      console.error("Email login error:", error);

      showError("Invalid email or password.");
    }
  });
}


// ============================================
// GOOGLE LOGIN
// ============================================

if (googleBtn) {
  googleBtn.addEventListener("click", async () => {

    clearError();

    try {

      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(
        auth,
        provider
      );

      console.log("Google login successful:", result.user);

      // Go to dashboard
      window.location.href = "./dashboard.html";

    } catch (error) {

      console.error("Google login error:", error);

      showError("Google login failed.");
    }
  });
}


// ============================================
// APPLE LOGIN
// ============================================

if (appleBtn) {
  appleBtn.addEventListener("click", async () => {

    clearError();

    try {

      const provider = new OAuthProvider("apple.com");

      provider.addScope("email");
      provider.addScope("name");

      const result = await signInWithPopup(
        auth,
        provider
      );

      console.log("Apple login successful:", result.user);

      // Go to dashboard
      window.location.href = "./dashboard.html";

    } catch (error) {

      console.error("Apple login error:", error);

      showError("Apple login failed.");
    }
  });
}


// ============================================
// SIGN UP
// ============================================

if (signupBtn) {
  signupBtn.addEventListener("click", async () => {

    clearError();

    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value;

    if (!email || !password) {
      showError("Enter email and password first.");
      return;
    }

    try {

      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log("Account created:", result.user);

      // Go to dashboard
      window.location.href = "./dashboard.html";

    } catch (error) {

      console.error("Sign up error:", error);

      if (error.code === "auth/email-already-in-use") {
        showError("This email is already registered.");
      }
      else if (error.code === "auth/weak-password") {
        showError("Password must be at least 6 characters.");
      }
      else if (error.code === "auth/invalid-email") {
        showError("Please enter a valid email address.");
      }
      else {
        showError(error.message);
      }
    }
  });
}