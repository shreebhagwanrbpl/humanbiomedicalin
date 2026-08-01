import { initializeApp } from "firebase/app";
import { getFirestore, setLogLevel } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGIJXX3MR1CxmIJbJHyVzbfRa0M0Sw6FQ",
  authDomain: "rajbiosis-central.firebaseapp.com",
  projectId: "rajbiosis-central",
  storageBucket: "rajbiosis-central.firebasestorage.app",
  messagingSenderId: "190335913620",
  appId: "1:190335913620:web:99a14edcbb528f06c1ee81"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Suppress Firestore connection warnings when offline/dev container is offline
setLogLevel("silent");

//  ADD THESE LINES
export const db = getFirestore(app);
export const auth = getAuth(app);
