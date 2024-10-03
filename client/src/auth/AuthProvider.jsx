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
  const [authLoading, setAuthLoading] = useState(true);
  const [githubSession, setGithubSession] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Trigger Firebase Anonymous Auth
        console.log("No session found. Signing in anonymously...");
        const userCredential = await signInAnonymously(auth);

        // Set the Firebase anonymous user and generate JWT tokens
        setUser(userCredential.user);
        console.log("Firebase Anonymous User:", userCredential.user);

        // Create user entry in MongoDB and generate JWT tokens
        await createToken(userCredential.user.uid);
      } catch (error) {
        console.error("Error during Firebase anonymous login:", error);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Function to create JWT tokens via /api/create_token
  const createToken = async (firebaseUserId, githubUserId = null) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/create_token",
        { firebaseUserId, githubUserId },
        { withCredentials: true } // Include cookies in the request
      );
      console.log("JWT tokens generated and stored in cookies:", response.data.message);
    } catch (error) {
      console.error("Error creating JWT tokens:", error);
    }
  };
  // Function to link GitHub Account to the Firebase Anonymous session
  // Function to link GitHub Account to the existing Firebase Anonymous session
  const linkGitHubAccount = async () => {
    if (!user || !user.uid) return;

    try {
      localStorage.setItem("firebaseUserId", user.uid); // Store Firebase UID temporarily for callback
      console.log("Redirecting to GitHub OAuth...");
      window.open("http://localhost:5000/auth/github", "_self"); // Redirect to GitHub OAuth
    } catch (error) {
      console.error("Error during GitHub linking:", error);
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
      setUser(null);
      setGithubSession(false);
      console.log("User successfully logged out");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Function to handle the post-GitHub linking callback
  useEffect(() => {
    const handleGitHubCallback = async () => {
      const firebaseUserId = localStorage.getItem("firebaseUserId");
      if (firebaseUserId && githubSession) {
        try {
          // Retrieve the GitHub user ID from the backend session check or cookie
          const response = await axios.get("http://localhost:5000/api/current_user", { withCredentials: true });
          const githubUserId = response.data.githubUserId;
          console.log("Retrieved GitHub User ID:", githubUserId);

          // Call createToken again to generate new JWT tokens with both IDs
          await createToken(firebaseUserId, githubUserId);
          localStorage.removeItem("firebaseUserId"); // Clean up local storage after linking
        } catch (error) {
          console.error("Error in GitHub callback handling:", error);
        }
      }
    };

    handleGitHubCallback();
  }, [githubSession]);

  return (
    <AuthContext.Provider value={{ user, loginWithGitHub, linkGitHubAccount, logout, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
