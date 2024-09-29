import axios from "axios";

const API_URL = "http://localhost:5000/api"; // Update the base URL if needed

// Fetch all conversations
export const fetchConversations = async () => {
  try {
    const response = await axios.get(`${API_URL}/conversations`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
};

// Fetch messages for a specific conversation
export const fetchMessages = async (conversationId) => {
  try {
    const response = await axios.get(`${API_URL}/conversations/${conversationId}/messages`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error(`Error fetching messages for conversation ${conversationId}:`, error);
    throw error;
  }
};

// Create a new conversation
export const createNewConversation = async (title = "Untitled Conversation", userId) => {
  try {
    const response = await axios.post(`${API_URL}/conversations`, { title, userId }, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("Error creating a new conversation:", error);
    throw error;
  }
};
