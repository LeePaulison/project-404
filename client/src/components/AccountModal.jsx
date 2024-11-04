import PropTypes from 'prop-types';

import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import AnonymousUserModalContent from './AnonymousUserModalContent';
import GoogleUserModalContent from './GoogleUserModalContent';

const AccountModal = ({ isOpen, onClose }) => {
  const user = useSelector((state) => state.user.user);

  console.log("AccountModal", user);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{user?.isAnonymous ? 'Link Your Google Account' : 'Account Settings'}</ModalHeader>
        <ModalBody>
          {user?.email === null ? (
            <AnonymousUserModalContent />
          ) : (
            <GoogleUserModalContent user={user} />
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AccountModal;

AccountModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};