// src/components/NavBar.jsx
import { Button, Flex, Heading, Spacer } from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import AccountModal from "./AccountModal"; // Import the AccountModal component

const NavBar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure(); // Chakra UI modal state
  const user = useSelector((state) => state.user.user); // Get user state from Redux
  return (
    <Flex bg="gray.800" color="white" p={4} alignItems="center">
      <Heading size="lg">Project 404</Heading>
      <Spacer />
      {/* Include AuthModal in the NavBar */}
      <Button colorScheme="teal" onClick={onOpen}>
        {user?.email === "" ? 'Link Google Account' : 'Account Settings'}
      </Button>

      {/* Account Modal with isOpen and onClose state */}
      <AccountModal isOpen={isOpen} onClose={onClose} />    </Flex>
  );
};

export default NavBar;
