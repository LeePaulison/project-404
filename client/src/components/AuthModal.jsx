import { useState } from "react";
import {
  Box,
  Center,
  Avatar,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  Text,
  Flex,
} from "@chakra-ui/react";
import { useAuth } from "../auth/AuthProvider"; // Import the useAuth hook

const AuthModal = () => {
  const { user, linkGoogleAccount, logout } = useAuth(); // Use the Google-specific function
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* Initial Button: "Sign In" if no user, otherwise show "Account" */}
      {user ? (
        <Button onClick={() => setShowModal(true)} colorScheme="blue" variant="outline" mr={4}>
          Account
        </Button>
      ) : (
        <Button onClick={linkGoogleAccount} colorScheme="green" variant="outline" mr={4}>
          Sign In
        </Button>
      )}

      {/* Modal for Authentication Options */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{user ? "Account Information" : "Sign In"}</ModalHeader>
          <ModalBody>
            {user ? (
              <Box textAlign="center">
                <Avatar src={user.photoURL || ""} size="xl" mb={4} />
                <Text fontSize="lg">
                  {user.isAnonymous ? "Guest User" : user.displayName || "Google User"}
                </Text>
                <Text fontSize="md">{user.email || ""}</Text>
                <Center>
                  <Flex direction="column" justifyContent="center" my={4}>
                    <Button mt={4} colorScheme="red" onClick={logout}>
                      Logout
                    </Button>
                  </Flex>
                </Center>
              </Box>
            ) : (
              <Box textAlign="center">
                <Text mb={4}>You are currently logged out. Please sign in to access your account.</Text>
                <Button colorScheme="blue" mt={4} onClick={linkGoogleAccount}>
                  Sign In with Google
                </Button>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AuthModal;
