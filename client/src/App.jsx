import { useState, useEffect } from "react";
import { ChakraProvider, Flex } from "@chakra-ui/react";
import { useAuth } from "./auth/AuthProvider";
import ChatLayout from "./layouts/ChatLayout";
import NavBar from "./components/NavBar"; // Import the NavBar
import { fetchConversations, fetchMessages, createNewConversation } from "./api/conversations";


function App() {
  const { user, loginWithGitHub, handleAnonSignIn, logout, authLoading } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);

  // Fetch conversations when the component mounts
  // useEffect(() => {
  //   const loadConversations = async () => {
  //     try {
  //       const data = await fetchConversations();
  //       setConversations(data);
  //     } catch (error) {
  //       console.error("Failed to load conversations:", error);
  //     }
  //   };

  //   loadConversations();
  // }, []);

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

  // In the `AppLayout` component
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
      {/* Include NavBar in the Main App */}
      <Flex direction="column" h="100vh">
        <NavBar
          user={user}
          onLoginGitHub={loginWithGitHub}
          onLoginFirebase={handleAnonSignIn} // Placeholder for Firebase login
          onLogout={logout}
        />
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
    </ChakraProvider>
  );
}

export default App;
