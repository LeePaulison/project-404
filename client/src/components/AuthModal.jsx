// src/components/AuthModal.jsx
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
import LinkGitHubButton from "./LinkGitHubButton";

const AuthModal = ({ user, onLoginGitHub, onLoginFirebase, onLogout, showModal, setShowModal }) => {

  return (
    <>
      {/* Login Button in the Nav Bar */}
      {
        user ? (
          <Button onClick={onLogout} colorScheme="red" variant="outline" mr={4}>
            Logout
          </Button>
        ) : (
          <Button onClick={() => setShowModal(true)} colorScheme="blue" variant="outline" mr={4}>
            Sign In
          </Button>
        )
      }
      {/* Modal for Authentication Options */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{user ? "Account Information" : "Sign In"}</ModalHeader>
          <ModalBody>
            {user ? (
              <Box textAlign="center">
                <Avatar src={user.photos && user.photos[0].value || ""} size="xl" mb={4} />
                <Text fontSize="lg">{user.isAnonymous ? "Guest User" : user.displayName || "GitHub User"}</Text>
                <Center>
                  <Flex direction="column" justifyContent="center" my={4} >
                    {user.isAnonymous && <LinkGitHubButton />}
                    <Button mt={4} colorScheme="red" onClick={onLogout}>
                      Logout
                    </Button>
                  </Flex>
                </Center>
              </Box>
            ) : (
              <Box textAlign="center">
                <Button colorScheme="teal" mb={4} onClick={() => {
                  setShowModal(false);
                  onLoginGitHub();
                }}>
                  Sign In with GitHub
                </Button>
                <Text>or</Text>
                <Button colorScheme="blue" mt={4} onClick={() => {
                  setShowModal(false);
                  onLoginFirebase();
                }}>
                  Sign In as Guest
                </Button>
                {console.log(`showModal on button click: ${showModal}`)}
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
