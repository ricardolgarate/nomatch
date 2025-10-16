// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDhf20Nwx3QP8AXzOyHjbrc7bbaET5K-v8",
  authDomain: "nomatch-df763.firebaseapp.com",
  projectId: "nomatch-df763",
  storageBucket: "nomatch-df763.firebasestorage.app",
  messagingSenderId: "616287301053",
  appId: "1:616287301053:web:8b5f844ecd72e833f5b6d4",
  measurementId: "G-B7F6RGEZPT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;

