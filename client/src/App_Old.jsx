import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Link,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Text,
} from "@chakra-ui/react";
import useFirebaseAuth from "./hooks/useFirebaseAuth";  // Import the custom hook

function App() {
  const { user, isLoggedIn, logout } = useFirebaseAuth();  // Use the custom hook for Firebase Auth
  const { isOpen, onOpen, onClose } = useDisclosure();  // Chakra UI modal state
  const navigate = useNavigate();

  // Testing conversation ID

  // Handle GitHub OAuth login
  const handleGitHubLogin = () => {
    window.location.href = "http://localhost:5000/auth/github";  // Redirect to GitHub OAuth
  };

  return (
    <Box bg={'black'}>
      {/* Header and Navigation */}
      <Flex as="nav" bg="teal.500" p={4} justifyContent="space-between" alignItems="center">
        <Heading as="h1" size="lg" color="white">
          Project 404
        </Heading>
        <HStack spacing={4}>
          <Link href="/" color="white">Home</Link>
          {isLoggedIn ? (
            <>
              <Button colorScheme="red" onClick={logout}>Logout</Button>  {/* Logout Button */}
            </>
          ) : (
            <Link href="#" color="white" onClick={onOpen}>Login</Link>
          )}
        </HStack>
      </Flex>

      {/* Main Content */}
      <Box p={6}>
        <Heading>Welcome to Project 404</Heading>
        {isLoggedIn ? (
          <Box mt={4}>
            <Text>Logged in as: {user.email || user.uid}</Text>
            <Button mt={2} onClick={() => navigate("/dashboard")} colorScheme="teal">
              Go to Dashboard
            </Button>
          </Box>
        ) : (
          <Text mt={4}>Please log in using the options above.</Text>
        )}
      </Box>

      {/* Chakra UI Modal Dialog for GitHub OAuth */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Login</ModalHeader>
          <ModalBody>
            <Text>Choose your login method:</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={handleGitHubLogin}>
              Login with GitHub
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default App;
