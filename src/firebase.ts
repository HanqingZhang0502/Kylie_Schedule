import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://console.firebase.google.com/
const firebaseConfig = {
    apiKey: "AIzaSyD9PgiZ2OuZw5vnVqg-7chYwqkLN17Skts",
    authDomain: "kylie-schedule.firebaseapp.com",
    projectId: "kylie-schedule",
    storageBucket: "kylie-schedule.firebasestorage.app",
    messagingSenderId: "861523037554",
    appId: "1:861523037554:web:28556cc42b423a278ae1eb",
    measurementId: "G-2GFB27GNKF"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);
export const db = getFirestore(app);
