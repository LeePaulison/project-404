// src/components/AuthModal.jsx
import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  VStack,
  Text,
} from "@chakra-ui/react";
import GitHubAuthButton from "./GitHubAuthButton";

const AuthModal = ({ user, onLoginGitHub, onLoginFirebase, onLogout }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      {/* Login Button in the Nav Bar */}
      <Button onClick={onOpen} colorScheme="blue" variant="outline" mr={4}>
        {user ? "Account" : "Login"}
      </Button>

      {/* Modal for Authentication Options */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{user ? "Manage Account" : "Login Options"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              {user ? (
                <Text>Welcome, {user.displayName || "User"}!</Text>
              ) : (
                <>
                  {/* GitHub Login Button */}
                  <GitHubAuthButton
                    onLogin={onLoginGitHub}
                    onLogout={onLogout}
                    user={user}
                  />

                  {/* Firebase Login Button */}
                  <Button onClick={onLoginFirebase} colorScheme="orange" w="full">
                    Login with Firebase
                  </Button>
                </>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={onLogout}>
              Logout
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AuthModal;
