// src/components/GitHubAuthButton.jsx
import { Button } from "@chakra-ui/react";

const GitHubAuthButton = ({ onLogin, onLogout, user }) => {
  return (
    <Button onClick={user ? onLogout : onLogin} colorScheme={user ? "red" : "teal"} w="full">
      {user ? "Logout from GitHub" : "Login with GitHub"}
    </Button>
  );
};

export default GitHubAuthButton;
