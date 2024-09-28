// src/components/NavBar.jsx
import React from "react";
import { Flex, Heading, Spacer } from "@chakra-ui/react";
import AuthModal from "./AuthModal"; // Import the AuthModal component

const NavBar = ({ user, onLoginGitHub, onLoginFirebase, onLogout }) => {
  return (
    <Flex bg="gray.800" color="white" p={4} alignItems="center">
      <Heading size="lg">Project 404</Heading>
      <Spacer />
      {/* Include AuthModal in the NavBar */}
      <AuthModal user={user} onLoginGitHub={onLoginGitHub} onLoginFirebase={onLoginFirebase} onLogout={onLogout} />
    </Flex>
  );
};

export default NavBar;
