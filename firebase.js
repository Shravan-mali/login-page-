// ============================================
// Firebase Configuration
// ============================================

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import { getAuth } from
  "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD-7G8z5qsxtqyWUj0YxTlmKVFxmAfYhNI",
  authDomain: "ai-agent-50d79.firebaseapp.com",
  projectId: "ai-agent-50d79",
  storageBucket: "ai-agent-50d79.firebasestorage.app",
  messagingSenderId: "899391408657",
  appId: "1:899391408657:web:922d1e26c656e33582bfb0",
  measurementId: "G-FYWMHM8B5S"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Firebase Authentication
export const auth = getAuth(app);