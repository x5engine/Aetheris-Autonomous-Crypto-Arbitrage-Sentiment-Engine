import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration from environment variables or fallback to project defaults
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA5wjZM78tGyAVDlv2Yy95HKl0kjFvjkLk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hackathon-project-245ba.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hackathon-project-245ba",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hackathon-project-245ba.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "13696281360",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:13696281360:web:07952d00bbbf12d8c0d395"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore (read-only for client)
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

export default app;

