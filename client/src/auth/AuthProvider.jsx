import { createContext, useContext, useEffect, useState } from "react";
import { signInAnonymously, signOut, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "../store/userSlice";
import axios from "axios";

// Create Auth Context
export const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

const AuthProvider = ({ children }) => {
  const [authLoading, setAuthLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    let unsubscribe;
    const initializeAuth = async () => {
      try {
        unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          if (currentUser) {
            const userData = await createUser(currentUser.uid, currentUser.email || '');
            if (userData) {
              dispatch(setUser(userData)); // Correctly set the user in Redux
            }
            setAuthLoading(false);
          } else {
            dispatch(clearUser());
            setAuthLoading(false);
          }
        });

        // Check if a user is already logged in
        if (!auth.currentUser) {
          await signInAnonymously(auth); // Sign in anonymously if no user is logged in
        }
      } catch (error) {
        console.error("Error initializing authentication:", error);
        dispatch(clearUser());
        setAuthLoading(false);
      }
    };

    initializeAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [dispatch]);

  // Function to create a new user or retrieve an existing user from the server
  const createUser = async (uid, email = '') => {
    try {
      const response = await axios.post("http://localhost:5000/api/users", { firebaseUIDs: [uid], email });
      return response.data; // Return the user data from the API response
    } catch (error) {
      console.error("Failed to create or retrieve user:", error);
      return null;
    }
  };

  // Function to merge anonymous UID and Google UID in the database
  const mergeUserUIDs = async (primaryUID, secondaryUID, googleUID, email) => {
    try {
      console.log("Merging User Accounts:", { primaryUID, secondaryUID, googleUID, email });

      const response = await axios.post("http://localhost:5000/api/users/merge", {
        primaryUID,
        secondaryUID,
        googleUID,
        email,
      });

      console.log("Merge Response:", response.data);
      return response.data; // Return the updated user data after merging
    } catch (error) {
      console.error("Error merging user UIDs:", error.response ? error.response.data : error.message);
      return null;
    }
  };

  // Function to link Google account to an existing anonymous account
  const linkGoogleAccount = async () => {
    const user = auth.currentUser; // Get the current authenticated user

    if (user && user.isAnonymous) {
      try {
        // Perform Google sign-in and linking
        const result = await signInWithPopup(auth, googleProvider);
        const googleUser = result.user;

        console.log("Google User:", googleUser);

        // Extract UIDs and email for merging
        const primaryUID = user.uid; // Current anonymous UID
        const secondaryUID = googleUser.uid; // Google Firebase UID
        const googleUID = googleUser.providerData[0].uid; // Google-specific UID
        const email = googleUser.email;
        const googleData = {
          displayName: googleUser.displayName,
          photoURL: googleUser.photoURL,
        }

        console.log("Google Data:", googleData);

        console.log("Linking Google Account. Primary UID:", primaryUID, "Secondary UID:", secondaryUID);

        // Merge the anonymous and Google accounts in the database
        const mergedUser = await mergeUserUIDs(primaryUID, secondaryUID, googleUID, email);

        const updatedUser = { ...mergedUser, ...googleData };

        console.log("Updated User Data:", updatedUser);

        if (mergedUser) {
          dispatch(setUser(updatedUser)); // Update Redux state with merged user data
          console.log("User successfully linked and merged:", mergedUser);
        }
      } catch (error) {
        console.error("Error linking Google account:", error);
      }
    }
  };

  const logout = async () => {
    try {
      setAuthLoading(true); // Set loading state to true during logout
      await signOut(auth); // Firebase signOut
      dispatch(clearUser()); // Clear the user from Redux
      console.log("User successfully logged out");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setAuthLoading(false); // Reset loading state after logout
    }
  };


  return (
    <AuthContext.Provider value={{ authLoading, linkGoogleAccount, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
