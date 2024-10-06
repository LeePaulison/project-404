import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store"; // Import the Redux store
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AuthProvider from "./auth/AuthProvider";  // Firebase Auth wrapper
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme"; // Chakra UI theme
// Pages
import App from "./App";  // Home component
import Dashboard from "./pages/Dashboard";  // Dashboard component
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
    <Provider store={store}>
      <AuthProvider>
        <ChakraProvider theme={theme}>
          <RouterProvider router={router} />
        </ChakraProvider>
      </AuthProvider>
    </Provider>
  </React.StrictMode>
);
