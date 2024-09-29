import React, { useState } from "react";
import { Box, Flex, Heading, VStack, Button, HStack } from "@chakra-ui/react";
import QueryInput from "../components/QueryInput";

const ChatLayout = ({ conversations, onSelectConversation, createNewConversation }) => {
  const [messages, setMessages] = useState([
    { text: "Hello, how can I assist you?", isUser: false },
  ]);

  // Handler to send a query and update the chat messages
  const handleSendQuery = (query) => {
    // Append the user's message
    const userMessage = { text: query, isUser: true };
    setMessages((prev) => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = { text: `You asked: "${query}"`, isUser: false };
      setMessages((prev) => [...prev, aiMessage]);
    }, 500); // Simulated delay
  };

  return (
    <Flex flex={1}>
      {/* Sidebar for Conversations */}
      <Box bg="gray.900" color="white" maxW="300px" flex={1} p={4}>
        <Heading size="md" mb={4}>
          Conversations
        </Heading>
        {conversations.map((conv, index) => (
          <Button
            key={index}
            w="100%"
            mb={2}
            bg="gray.700"
            _hover={{ bg: "gray.600" }}
            onClick={() => onSelectConversation(conv._id)}
          >
            {conv.title || `Conversation ${index + 1}`}
          </Button>
        ))}
        <Button onClick={createNewConversation} w="100%" mt={4} colorScheme="blue">
          + New Conversation
        </Button>
      </Box>

      {/* Main Chat Area */}
      <VStack spacing={4} bg="gray.50" flex={1} p={4} overflowY="auto">
        <Heading size="lg" mb={4}>
          Chat
        </Heading>
        {messages.map((msg, index) => (
          <Box key={index} w="100%" bg={msg.isUser ? "teal.100" : "blue.100"} p={3} borderRadius="md">
            <HStack align="start">
              <Box>{msg.isUser ? "User:" : "AI:"}</Box>
              <Box>{msg.text}</Box>
            </HStack>
          </Box>
        ))}
        {/* Include the QueryInput component */}
        <Box w="100%" position="sticky" bottom={0}>
          <QueryInput onSend={handleSendQuery} />
        </Box>
      </VStack>
    </Flex>
  );
};

export default ChatLayout;
