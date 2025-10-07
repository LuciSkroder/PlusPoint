import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your Firebase configuration (get this from Project settings -> General in the Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyDpsWFFZINv7aXPXK0uBum9U_w8mRSEL64",
  authDomain: "pluspoint-f355e.firebaseapp.com",
  databaseURL:
    "https://pluspoint-f355e-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "pluspoint-f355e",
  storageBucket: "pluspoint-f355e.firebasestorage.app",
  messagingSenderId: "520562860299",
  appId: "1:520562860299:web:b1a821c743b563d0ef420e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the Realtime Database service
export const DataBase = getDatabase(app);
