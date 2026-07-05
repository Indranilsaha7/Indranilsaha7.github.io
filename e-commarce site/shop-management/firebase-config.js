
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD7mdceEoKJSHnxhOJfQxln0GDPJR0yD9g",
  authDomain: "barodashop1.firebaseapp.com",
  projectId: "barodashop1",
  storageBucket: "barodashop1.firebasestorage.app",
  messagingSenderId: "370097021728",
  appId: "1:370097021728:web:5b15bd2aafa556b0d7ad45",
  measurementId: "G-7990TT8RHQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth };
