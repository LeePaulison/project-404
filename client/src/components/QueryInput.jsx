import { useState, useEffect } from "react";
import { Box, Button, Textarea, VStack, HStack, Text, Heading } from "@chakra-ui/react";

// This component handles both the input and message display
export default function QueryInput({ conversationId, onQuerySent }) {
  const [query, setQuery] = useState(""); // State to handle query input
  const [messages, setMessages] = useState([]); // State to store conversation messages

  // Fetch existing conversation messages when component mounts
  useEffect(() => {
    async function fetchMessages() {
      try {
        const response = await fetch(`http://localhost:5000/api/conversations/${conversationId}`);
        const data = await response.json();
        setMessages(data.messages || []);
      } catch (error) {
        console.error("Failed to load messages", error);
      }
    }
    fetchMessages();
  }, [conversationId]);

  // Function to send the query to the server
  const handleSendQuery = async () => {
    if (!query.trim()) return; // Skip if input is empty
    const newMessage = { text: `User: ${query}` };
    setMessages([...messages, newMessage]); // Add user query to messages

    try {
      const response = await fetch(`http://localhost:5000/api/conversations/${conversationId}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("firebaseToken")}`, // Replace with correct token storage mechanism
        },
        body: JSON.stringify({ query }),
      });
      const updatedConversation = await response.json();
      setMessages(updatedConversation.conversation.messages); // Update state with latest messages
      setQuery(""); // Clear input after sending
      onQuerySent && onQuerySent(); // Optional callback if needed
    } catch (error) {
      console.error("Error sending query:", error);
    }
  };

  return (
    <VStack spacing={4} width="100%" maxW="700px" margin="auto" padding={5}>
      <Heading as="h3" size="lg" mb={4}>
        AI Chat Interface
      </Heading>

      {/* Conversation Messages Display */}
      <Box width="100%" height="300px" overflowY="auto" borderWidth="1px" borderRadius="lg" padding={4}>
        {messages.map((message, index) => (
          <Text key={index} mb={2} fontSize="md">
            {message.text}
          </Text>
        ))}
      </Box>

      {/* Query Input and Send Button */}
      <HStack width="100%">
        <Textarea
          placeholder="Type your query here..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          size="sm"
        />
        <Button onClick={handleSendQuery} colorScheme="teal" isDisabled={!query.trim()}>
          Send
        </Button>
      </HStack>
    </VStack>
  );
}
