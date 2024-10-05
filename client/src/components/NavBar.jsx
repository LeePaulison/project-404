// src/components/NavBar.jsx
import { Flex, Heading, Spacer } from "@chakra-ui/react";
import AuthModal from "./AuthModal"; // Import the AuthModal component

const NavBar = () => {

  return (
    <Flex bg="gray.800" color="white" p={4} alignItems="center">
      <Heading size="lg">Project 404</Heading>
      <Spacer />
      {/* Include AuthModal in the NavBar */}
      <AuthModal />
    </Flex>
  );
};

export default NavBar;
