// src/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider, EmailAuthProvider } from "firebase/auth";
import { firebaseConfig } from "./firebaseConfig";

// Initialize Firebase app only if not already initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export the `auth` instance for use in other components
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
const emailProvider = new EmailAuthProvider();

export { app, auth, googleProvider, githubProvider, emailProvider };
