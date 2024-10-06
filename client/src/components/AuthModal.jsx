import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, useDisclosure } from '@chakra-ui/react';
import { useAuth } from '../auth/AuthProvider'; // Use the AuthProvider for Google actions

const AuthModal = () => {
  const { linkGoogleAccount, logout } = useAuth(); // Destructure Google account link function
  const user = useSelector((state) => state.user.user); // Get user from Redux store
  const [authType, setAuthType] = useState('link'); // Set the type of authentication action
  const { isOpen, onOpen, onClose } = useDisclosure(); // Modal state

  // Determine the modal type based on the user's email presence
  useEffect(() => {
    if (user && user.email && user.email !== '') {
      setAuthType('login');
    } else {
      setAuthType('link');
    }
  }, [user]);

  // Handle the action for linking or logging in with Google
  const handleGoogleAction = () => {
    if (authType === 'link') {
      linkGoogleAccount(); // Call link function from AuthProvider
    } else {
      console.log('Google Login Triggered'); // Placeholder for Google login logic
    }
    onClose(); // Close modal after action
  };

  return (
    <>
      <Button colorScheme="teal" onClick={onOpen}>
        {authType === 'link' ? 'Link Google Account' : 'Account Settings'}
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {authType === 'link' ? 'Link Google Account' : 'Log In with Google'}
          </ModalHeader>
          <ModalBody>
            <Box textAlign="center">
              <Button colorScheme="teal" onClick={handleGoogleAction}>
                {authType === 'link' ? 'Link Google Account' : 'Log In with Google'}
              </Button>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>

  );
};

export default AuthModal;
