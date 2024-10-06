import { Box, Avatar, Text, Button } from '@chakra-ui/react';
import { useAuth } from '../auth/AuthProvider';

const GoogleUserModalContent = ({ user }) => {
  const { logout } = useAuth();

  return (
    <Box textAlign="center">
      <Avatar src={user.photoURL} size="xl" mb={4} />
      <Text fontSize="xl" fontWeight="bold">
        {user.displayName}
      </Text>
      <Text mb={4}>{user.email}</Text>
      <Button colorScheme="red" onClick={logout}>
        Logout
      </Button>
    </Box>
  );
};

export default GoogleUserModalContent;
