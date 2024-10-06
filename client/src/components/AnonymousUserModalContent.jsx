import { Box, Flex, Button, Text } from '@chakra-ui/react';
import { useAuth } from '../auth/AuthProvider';

const AnonymousUserModalContent = () => {
  const { linkGoogleAccount, logout } = useAuth();

  return (
    <Box textAlign="center">
      <Text mb={4}>
        Link your Google account to save your progress and access more features.
      </Text>
      <Flex direction="column">

        <Button colorScheme="teal" onClick={linkGoogleAccount} mb={4} alignSelf={"center"}>
          Link Google Account
        </Button>
        <Button colorScheme="red" onClick={logout} alignSelf={"center"}>
          Logout
        </Button>
      </Flex>
    </Box>
  );
};

export default AnonymousUserModalContent;
