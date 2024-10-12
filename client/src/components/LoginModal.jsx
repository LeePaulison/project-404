import PropTypes from "prop-types";

import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Flex } from "@chakra-ui/react";
import { useAuth } from "../auth/AuthProvider";

const AccountModal = ({ isOpen, onClose }) => {
  const { anonymousLogin, googleLogin } = useAuth();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Login</ModalHeader>
        <ModalBody>
          <Flex direction="column">
            <Button colorScheme="teal" onClick={anonymousLogin} mb={4} alignSelf={"center"}>
              Login Anonymously
            </Button>
            <Button colorScheme="green" onClick={googleLogin} alignSelf={"center"}>
              Login with Google
            </Button>
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default AccountModal;

AccountModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};