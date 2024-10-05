// src/components/NavBar.jsx
import React from "react";
import { Flex, Heading, Spacer, Button, useDisclosure } from "@chakra-ui/react";
import AuthModal from "./AuthModal"; // Import the AuthModal component

const NavBar = () => {
  const [showModal, setShowModal] = React.useState(false);

  return (
    <Flex bg="gray.800" color="white" p={4} alignItems="center">
      <Heading size="lg">Project 404</Heading>
      <Spacer />
      {/* Include AuthModal in the NavBar */}
      <AuthModal showModal={showModal} setShowModal={setShowModal} />
    </Flex>
  );
};

export default NavBar;
