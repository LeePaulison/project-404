import React, { useState } from "react";
import { Input, Button, HStack } from "@chakra-ui/react";

const QueryInput = ({ onSend }) => {
  const [query, setQuery] = useState("");

  const handleSend = () => {
    if (query.trim() !== "") {
      onSend(query);
      setQuery(""); // Clear the input after sending
    }
  };

  return (
    <HStack spacing={4} w="100%">
      <Input
        placeholder="Type your message..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            handleSend();
          }
        }}
      />
      <Button colorScheme="blue" onClick={handleSend}>
        Send
      </Button>
    </HStack>
  );
};

export default QueryInput;
