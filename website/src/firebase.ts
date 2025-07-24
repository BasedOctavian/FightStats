// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCzqDSzCBD_nRcOb3_zchS1rNbJM0cRyBs",
  authDomain: "fightstats-30352.firebaseapp.com",
  projectId: "fightstats-30352",
  storageBucket: "fightstats-30352.firebasestorage.app",
  messagingSenderId: "24304917844",
  appId: "1:24304917844:web:9511c97afb15ed167abcc1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app; 