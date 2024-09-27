import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if the user is logged in by calling the server
    fetch("http://localhost:5000/api/current_user", {
      method: "GET",
      credentials: "include",  // Include cookies in the request
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);  // Set the authenticated user's data
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, []);

  const handleGitHubLogin = () => {
    window.location.href = "http://localhost:5000/auth/github";  // OAuth login
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div>
            <h1>Welcome to Project 404</h1>
            {user ? (
              <p>Logged in as: {user.username}</p>  // Show the user's username
            ) : (
              <div>
                <p>Not logged in.</p>
                <button onClick={handleGitHubLogin}>Login with GitHub</button>
              </div>
            )}
          </div>
        } />

        <Route path="/dashboard" element={<Dashboard user={user} />} />
      </Routes>
    </Router>
  );
}

// Basic Dashboard component
const Dashboard = ({ user }) => {
  if (!user) {
    return <p>Loading...</p>;  // Handle cases where the user isn't yet fetched
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user.username}!</p>  {/* Display GitHub user's username */}
    </div>
  );
};

export default App;
