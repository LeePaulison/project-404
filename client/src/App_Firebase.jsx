import { useEffect, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAudGqhNPEQtwHK58oFvra9OUoZ7WQKGK8",
  authDomain: "project-404-dbd61.firebaseapp.com",
  projectId: "project-404-dbd61",
  storageBucket: "project-404-dbd61.appspot.com",
  messagingSenderId: "363501609053",
  appId: "1:363501609053:web:85cd465b13ca8ddf4c2db4",
  measurementId: "G-FQ9PQPP255"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function App() {
  const [user, setUser] = useState(null);  // Track authenticated user state

  // Use Firebase anonymous authentication on component mount
  useEffect(() => {
    // Sign in the user anonymously if they are not authenticated
    signInAnonymously(auth)
      .then((userCredential) => {
        console.log("User signed in anonymously:", userCredential.user);
      })
      .catch((error) => {
        console.error("Error signing in anonymously:", error);
      });

    // Monitor authentication state
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in (either anonymous or OAuth)
        console.log("User state changed:", user);
        setUser(user);  // Set user state to the current user

        // Get the ID token for the authenticated user and send it to the server
        user.getIdToken().then((idToken) => {
          // Send the token to the server
          fetch("http://localhost:5000/api/protected-route", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${idToken}`,  // Pass the token in the Authorization header
              "Content-Type": "application/json"
            }
          })
            .then(response => response.json())
            .then(data => {
              console.log("Server response:", data);  // Handle the server response
            })
            .catch((error) => {
              console.error("Error during server request:", error);
            });
        });
      } else {
        // No user is signed in
        setUser(null);
        console.log("No user signed in");
      }
    });
    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h1>Welcome to Project 404</h1>
      {user ? (
        <p>Logged in as: {user.uid}</p>  // Show the user's UID (anonymous or OAuth)
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default App;
