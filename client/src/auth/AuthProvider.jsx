import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { signInAnonymously, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // Manage loading state
  const [githubSession, setGithubSession] = useState(false); // Manage GitHub session separately

  // Check for existing GitHub session on initial load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/current_user", { withCredentials: true });
        if (response.data.user) {
          console.log("GitHub Session Found:", response.data.user);
          setUser(response.data.user); // Set the GitHub user
          setGithubSession(true);
        } else {
          console.log("No GitHub session found.");
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching GitHub session:", error);
        setUser(null);
      } finally {
        setAuthLoading(false); // Set loading to false after session check
      }
    };

    checkSession();
  }, []);

  // Firebase Auth Handling for Anonymous Users
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Firebase Auth State Changed:", user);
      // If a GitHub session is active, avoid overwriting with Firebase anonymous user
      if (user && !user.isAnonymous && !githubSession) {
        setUser(user);
      } else if (!user && !githubSession) {
        setUser(null); // Only set to null if neither GitHub nor Firebase is active
      }
    });

    return () => unsubscribe();
  }, [githubSession]); // Include githubSession in dependency array

  // GitHub Login Handler
  const loginWithGitHub = () => {
    window.open("http://localhost:5000/auth/github", "_self"); // Triggers GitHub OAuth server-side
  };

  // GitHub Logout Handler
  const logout = async () => {
    try {
      await axios.get("http://localhost:5000/api/auth/logout", { withCredentials: true });
      await signOut(auth); // Sign out of Firebase as well if using dual auth
      setUser(null); // Clear the user state
      setGithubSession(false); // Clear the GitHub session flag
      console.log("User successfully logged out");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loginWithGitHub, logout, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
