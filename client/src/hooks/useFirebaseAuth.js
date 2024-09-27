import { useEffect, useState } from "react";
import { getAuth, signInAnonymously, onAuthStateChanged, signOut } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../firebaseConfig";

// Initialize Firebase only once globally
initializeApp(firebaseConfig);

function useFirebaseAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();

    if (auth.currentUser) {
      auth.currentUser.getIdToken(true).then((token) => {
        if (token) {
          console.log("Firebase ID Token:", token);
        }
      });
    }

    // Sign in anonymously if not authenticated
    signInAnonymously(auth)
      .then(() => console.log("User signed in anonymously"))
      .catch((error) => console.error("Error with anonymous sign-in:", error));

    // Listen for changes in authentication state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); // Update the user state
      } else {
        setUser(null); // Reset the user state
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  // Logout function
  const logout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => console.log("User signed out successfully"))
      .catch((error) => console.error("Error signing out:", error));
  };

  return { user, isLoggedIn: !!user, logout };
}

export default useFirebaseAuth;
