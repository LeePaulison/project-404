import { Button, Flex, Heading, Spacer } from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import AccountModal from "./AccountModal"; // Import the AccountModal component
import LoginModal from "./LoginModal"; // Import the LoginModal component

const NavBar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure(); // Chakra UI modal state
  const user = useSelector((state) => state.user.user); // Get user state from Redux

  console.log("NavBar", user);

  return (
    <Flex bg="gray.800" color="white" p={4} alignItems="center">
      <Heading size="lg">Project 404</Heading>
      <Spacer />
      {/* Include LoginModal in the NavBar */}
      {user._id === null && <>
        <Button colorScheme="teal" onClick={onOpen}>
          Login
        </Button>
        <LoginModal isOpen={isOpen} onClose={onClose} />

      </>
      }
      {/* Include AuthModal in the NavBar */}
      {user._id !== null && <>
        <Button colorScheme="teal" onClick={onOpen}>
          {user?.email === "" ? 'Link Google Account' : 'Account Settings'}
        </Button>
        <AccountModal isOpen={isOpen} onClose={onClose} />
      </>
      }
    </Flex>
  );
};

export default NavBar;
