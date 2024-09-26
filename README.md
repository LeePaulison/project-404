
# **Project 404**

## 🚀 **Overview**

**Project 404** is a full-stack, developer-focused chatbot built with modern web technologies. It features real-time conversations powered by OpenAI, user authentication with OAuth and Firebase Anonymous Auth, and persistent storage using MongoDB with Mongoose. The project showcases a dynamic and responsive single-page application (SPA) designed to highlight my frontend and backend development skills.

### **Key Features:**
- 🌐 **Real-Time Conversations**: Powered by OpenAI's API for smart and dynamic responses.
- 👤 **OAuth & Firebase Anonymous Authentication**: Secure user sessions with GitHub OAuth and anonymous access options.
- 💬 **Persistent Conversation Storage**: Conversations are stored and retrieved from MongoDB to ensure users can revisit and continue their interactions.
- 🖥️ **Built for Developers**: A clean, developer-friendly interface using React, Vite, and Chakra UI.
- 🕸️ **WebSockets for Live Updates**: Communication between the client and server is handled with WebSockets for a smooth, real-time experience.

---

## 🛠️ **Technologies Used**

### **Frontend:**
- **React SWC**: Leveraging React for building interactive UIs.
- **Vite**: For fast bundling and development experience.
- **Chakra UI**: For accessible, responsive, and reusable UI components.
- **Socket.IO (Client)**: Enabling real-time data updates between the client and server.
- **Firebase SDK**: For handling authentication (OAuth and Anonymous).
- **React Router**: For client-side routing.

### **Backend:**
- **Node.js with Express**: Backend server to handle API requests and WebSocket communication.
- **Socket.IO (Server)**: Enabling real-time communication for chatbot responses.
- **MongoDB with Mongoose**: Persistent conversation storage using a NoSQL database with structured data modeling.
- **OpenAI API**: Powering chatbot responses with AI-generated content.
- **Passport.js with GitHub OAuth**: Secure user authentication using GitHub OAuth.
- **Firebase Admin SDK**: For managing Firebase Anonymous Authentication.

---

## 🔧 **Setup Instructions**

### **Prerequisites:**
- **Node.js** installed
- **Yarn** package manager
- **MongoDB Atlas** account or a local MongoDB instance

### **Getting Started:**

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/project-404.git
   ```

2. **Navigate to the project directory:**
   ```bash
   cd project-404
   ```

3. **Install server-side dependencies:**
   ```bash
   yarn install
   ```

4. **Install client-side dependencies:**
   Navigate to the `client` folder and run:
   ```bash
   yarn install
   ```

5. **Set up environment variables:**
   Create a `.env` file in the root directory and add your **OpenAI API key**, **MongoDB connection string**, and **OAuth client keys**:
   ```bash
   OPENAI_API_KEY=your-openai-key
   MONGODB_URI=your-mongodb-uri
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   ```

6. **Start the development server:**
   ```bash
   yarn dev
   ```

---

## 💡 **How It Works**

1. **Authentication**: Users can sign in via **GitHub OAuth** or continue anonymously using **Firebase Anonymous Authentication**. OAuth is handled through **Passport.js** on the backend and **Firebase SDK** on the frontend.
   
2. **Real-time Chat**: Users can interact with the chatbot through a dynamic message UI. Queries are sent to the server using **Socket.IO**, and AI responses are generated in real-time via the **OpenAI API**.

3. **Data Persistence**: Conversations are stored in **MongoDB** using **Mongoose** models, ensuring that users can return to their previous sessions and continue chatting from where they left off.

---

## 🔥 **Key Features & Screenshots**

### **Login Options:**
- GitHub OAuth integration for easy login.
- Firebase Anonymous Auth for guest access without a user account.

### **Real-Time Chat UI:**
- Clean, minimalist interface inspired by popular chatbot UIs.
- Real-time AI responses using OpenAI’s GPT models.

### **Persistent Conversations:**
- Conversations are saved to MongoDB, allowing users to revisit previous chats.

---

## 🌱 **Future Enhancements**
- **OpenAI Streaming**: Add real-time streaming of AI-generated responses for a more interactive experience.
- **User Profiles**: Enable user profiles where registered users can manage their past conversations and settings.
- **Improved UI**: Add dark mode and more UI customization options.
- **Mobile Support**: Ensure a fully responsive mobile experience.

---

## 📝 **Contributing**

If you'd like to contribute, feel free to create a pull request! You can also submit issues or feature requests to help improve the project.

---

## 👤 **About the Developer**

Hi, I'm Lee, a frontend developer with 3+ years of experience specializing in React, JavaScript, and building responsive, dynamic web applications. **Project 404** showcases my ability to integrate backend APIs, handle real-time data, and manage user authentication systems.

Check out my [portfolio](https://leepaulisonjr.com) for more projects!

---

## 📄 **License**

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

### **Contact Information:**
- **Email**: lee.paulison.jr@gmail.com
- **GitHub**: [LeePaulison](https://github.com/LeePaulison)
- **LinkedIn**: [Lee Paulison Jr](https://www.linkedin.com/in/lee-paulison-jr/)
