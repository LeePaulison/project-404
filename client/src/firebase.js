// src/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "./firebaseConfig";

// Initialize Firebase app only if not already initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export the `auth` instance for use in other components
const auth = getAuth(app);

export { app, auth };
