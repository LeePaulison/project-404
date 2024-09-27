import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";  // Home component
import Dashboard from "./pages/Dashboard";  // Dashboard component
import AuthProvider from "./auth/AuthProvider";  // Firebase Auth wrapper

// Define the routes and loaders
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
    loader: async () => {
      // You can add logic here to fetch user data or verify auth status
      return null;
    },
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
