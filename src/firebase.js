// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Make sure these values are correct from your Firebase project settings
const firebaseConfig = {
  apiKey: "AIzaSyB0uM25o_-ud-_YJmdCVIyzLppiWubMo3w",
  authDomain: "mentorbook-e17ef.firebaseapp.com",
  projectId: "mentorbook-e17ef",
  storageBucket: "mentorbook-e17ef.appspot.com",
  messagingSenderId: "539434026136",
  appId: "1:539434026136:web:d8c07c504a476ddaa4fced",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
