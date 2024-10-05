import { createContext, useContext, useState, useEffect } from "react";
import { signInAnonymously, signOut, signInWithPopup, linkWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

// Create Auth Context
export const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let unsubscribe;
    const initializeAuth = async () => {
      try {
        unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setAuthLoading(false);
        });

        // Check if a user is already logged in
        if (auth.currentUser === null) {
          await signInAnonymously(auth); // Sign in anonymously
        }
      } catch (error) {
        console.error("Error initializing authentication:", error);
        setUser(null);
        setAuthLoading(false);
      }
    };

    initializeAuth();

    // Cleanup function to unsubscribe from the auth state listener
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Function to link Google Account to Anonymous Account
  const linkGoogleAccount = async () => {
    try {
      setAuthLoading(true);
      if (user && user.isAnonymous) {
        await linkWithPopup(user, googleProvider); // Link Google to Anonymous
      } else {
        await signInWithPopup(auth, googleProvider); // Directly sign in with Google
      }

      console.log("Google Account Linked Successfully");
    } catch (error) {
      console.error("Error linking Google Account:", error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      setAuthLoading(true);
      await signOut(auth);
      setUser(null);
      console.log("User successfully logged out");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, linkGoogleAccount, logout, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
