import React, { useState, useEffect } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { useAuth } from "./auth/AuthProvider";
import ChatLayout from "./layouts/ChatLayout";
import NavBar from "./components/NavBar"; // Import the NavBar

function App() {
  const { user, loginWithGitHub, logout, authLoading } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeMessages, setActiveMessages] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState("");

  useEffect(() => {
    if (user) {
      setConversations([
        { _id: "1", title: "Conversation 1" },
        { _id: "2", title: "Conversation 2" },
      ]);
      setActiveMessages([
        { text: "Hi there!", isUser: true },
        { text: "Hello, how can I assist you today?", isUser: false },
      ]);
    }
  }, [user]);

  const handleSelectConversation = (conversationId) => {
    setActiveConversationId(conversationId);
  };

  if (authLoading) {
    return <div>Loading...</div>; // Prevent UI from rendering until auth state is established
  }

  return (
    <ChakraProvider>
      {/* Include NavBar in the Main App */}
      <NavBar
        user={user}
        onLoginGitHub={loginWithGitHub}
        onLoginFirebase={() => console.log("Firebase login clicked")} // Placeholder for Firebase login
        onLogout={logout}
      />
      {user ? (
        <ChatLayout
          conversations={conversations}
          messages={activeMessages}
          onSelectConversation={handleSelectConversation}
          onLogout={logout}
        />
      ) : (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <h1>Please login to start chatting</h1>
        </div>
      )}
    </ChakraProvider>
  );
}

export default App;
