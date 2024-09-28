// src/layouts/ChatLayout.jsx
import React from "react";
import { Box, Flex, Heading, VStack, Button, HStack } from "@chakra-ui/react";

const ChatLayout = ({ conversations, messages, onSelectConversation, onLogout }) => {
  return (
    <Flex h="100vh">
      {/* Sidebar for Conversations */}
      <Box bg="gray.900" color="white" w="300px" h="100vh" p={4}>
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
        <Button w="100%" mt={4} colorScheme="blue">
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

        {/* Logout Button */}
        <Button onClick={onLogout} colorScheme="red" alignSelf="center">
          Logout
        </Button>
      </VStack>
    </Flex>
  );
};

export default ChatLayout;
