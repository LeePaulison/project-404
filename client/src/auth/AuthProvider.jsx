import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { signInAnonymously, signOut } from "firebase/auth";
import { auth } from "../firebase";

export const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // Manage loading state
  const [githubSession, setGithubSession] = useState(false); // Manage GitHub session separately

  console.log("AuthProvider mounted");

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
        console.log("Error in AuthProvider:", error.message);
        console.log("Stack Trace:", error.stack);

        setUser(null);
      } finally {
        setAuthLoading(false); // Set loading to false after session check
      }

      console.log("Current Auth State:", user);
    };

    checkSession();
  }, []);


  const handleAnonSignIn = async () => {
    try {
      const userCredential = await signInAnonymously(auth);
      console.log("Successfully signed in anonymously:", userCredential.user);
      setUser(userCredential.user); // Update the AuthProvider state
    } catch (error) {
      console.error("Error during Anonymous Sign-In:", error);
    }
  };


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
    <AuthContext.Provider value={{ user, loginWithGitHub, handleAnonSignIn, logout, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
