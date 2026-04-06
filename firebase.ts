// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBzPN3CBnyV4Tvq3-8HveqwK6B6G82G2bg",
  authDomain: "local-service-finder-90aea.firebaseapp.com",
  projectId: "local-service-finder-90aea",
  storageBucket: "local-service-finder-90aea.firebasestorage.app",
  messagingSenderId: "614989406180",
  appId: "1:614989406180:web:b0297ca1a37040a8f4f1f1",
  measurementId: "G-K63EVEVWEQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);