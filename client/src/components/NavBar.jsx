// src/components/NavBar.jsx
import React from "react";
import { Flex, Heading, Spacer, Button, useDisclosure } from "@chakra-ui/react";
import AuthModal from "./AuthModal"; // Import the AuthModal component
import LinkGitHubButton from "./LinkGitHubButton"; // Import the LinkGitHubButton component

const NavBar = ({ user, onLoginGitHub, onLoginFirebase, onLogout }) => {
  const [showModal, setShowModal] = React.useState(false);

  return (
    <Flex bg="gray.800" color="white" p={4} alignItems="center">
      <Heading size="lg">Project 404</Heading>
      <Spacer />
      {/* Include AuthModal in the NavBar */}
      <nav>
        {user && (
          <>
            {user.isAnonymous &&
              <LinkGitHubButton />
            }
            <Button onClick={() => setShowModal(true)} colorScheme="blue" variant="outline">
              {user && user.isAnonymous ? "Guest Account" : "Account"}
            </Button>
          </>
        )
        }
        <AuthModal user={user} onLoginGitHub={onLoginGitHub} onLoginFirebase={onLoginFirebase} onLogout={onLogout} showModal={showModal} setShowModal={setShowModal} />
      </nav>
    </Flex>
  );
};

export default NavBar;
