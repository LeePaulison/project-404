import { useState } from "react";
import { ChakraProvider, Flex } from "@chakra-ui/react";
import AuthProvider, { useAuth } from "./auth/AuthProvider"; // Import the AuthProvider
import ChatLayout from "./layouts/ChatLayout";
import NavBar from "./components/NavBar";

import { fetchConversations, fetchMessages, createNewConversation } from "./api/conversations";

function App() {
  const { user, handleAnonSignIn, logout, authLoading } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);

  // Handle conversation selection and load messages
  const handleSelectConversation = async (conversationId) => {
    setSelectedConversationId(conversationId);
    try {
      const data = await fetchMessages(conversationId);
      setMessages(data);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  // Handle creating a new conversation
  const handleNewConversation = async () => {
    try {
      console.log("User ID:", user);
      const newConv = await createNewConversation("default title", user.id || user.uid);
      setConversations((prev) => [...prev, newConv]);
    } catch (error) {
      console.error("Failed to create a new conversation:", error);
    }
  };

  if (authLoading) {
    return <div>Loading...</div>; // Prevent UI from rendering until auth state is established
  }

  return (
    <ChakraProvider>
      <AuthProvider> {/* Wrap your entire app with AuthProvider */}
        <Flex direction="column" h="100vh">
          <NavBar />
          {user ? (
            <ChatLayout
              conversations={conversations}
              messages={messages}
              onSelectConversation={handleSelectConversation}
              createNewConversation={handleNewConversation}
            />
          ) : (
            <div style={{ textAlign: "center", marginTop: "50px" }}>
              <h1>Please login to start chatting</h1>
            </div>
          )}
        </Flex>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
