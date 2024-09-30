import { Button, useColorModeValue } from '@chakra-ui/react';
import { useAuth } from '../auth/AuthProvider';

// Standalone Chakra UI button for linking GitHub account
const LinkGitHubButton = ({ variant = 'solid' }) => {
  const { linkGitHubAccount } = useAuth();

  // Define a prominent color scheme for the button
  const bgColor = useColorModeValue('blue.500', 'blue.300'); // Button background color for light and dark mode
  const hoverColor = useColorModeValue('blue.600', 'blue.400'); // Button hover color

  return (
    <Button
      onClick={linkGitHubAccount}
      colorScheme="blue"
      bg={bgColor}
      _hover={{ bg: hoverColor }}
      size="md"
      variant={variant}
      boxShadow="lg"
    >
      Link GitHub Account
    </Button>
  );
};

export default LinkGitHubButton;
