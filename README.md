```markdown
# 🚀 NerveSpark - A Personalized RAG Chatbot with Memory

**NerveSpark** is a full-stack MERN (MongoDB, Express, React, Node.js) application that empowers users with a personalized chatbot. It leverages **Retrieval-Augmented Generation (RAG)** and memory to provide context-aware, knowledge-driven responses.

---

## ✨ Features

- **User Authentication**: Secure user login and profile management.  
- **Conversational Memory**: Chatbot remembers past interactions within a session to provide cohesive, contextually relevant responses.  
- **Retrieval-Augmented Generation (RAG)**: Upload your own documents (text files) to serve as a private knowledge base. The chatbot retrieves relevant information to generate accurate answers.  
- **Dynamic Chat Interface**: Responsive and intuitive UI that displays messages and manages chat sessions in real-time.  
- **Session Management**: Create, rename, and delete chat sessions to organize conversations.  
- **Scalable Architecture**: Built on a robust MERN stack with modular frontend and backend for easy scalability.  

---

## 🛠️ Tech Stack

### Frontend
- **React**: JavaScript library for building user interfaces  
- **Vercel**: Cloud platform for deployment  

### Backend
- **Node.js & Express**: Fast and minimalist web framework for APIs  
- **MongoDB**: NoSQL database for storing sessions, messages, and uploaded documents  
- **Mongoose**: Elegant MongoDB object modeling for Node.js  
- **Google Gemini API**: AI responses and text embeddings for RAG and memory  
- **dotenv**: Loads environment variables from `.env`  
- **CORS**: Cross-Origin Resource Sharing middleware  
- **bcryptjs**: Password hashing library  
- **jsonwebtoken**: JSON Web Tokens for authentication  
- **cookie-parser**: Middleware to parse cookies  

---

## 📝 Project Structure

```

/NerveSpark
\|-- /backend
\|   |-- /controllers
\|   |-- /middleware
\|   |-- /models
\|   |-- /routes
\|   |-- /utils
\|   |-- .env
\|   |-- package.json
\|   |-- server.js
\|-- /frontend
\|   |-- /public
\|   |-- /src
\|   |   |-- /api
\|   |   |-- /components
\|   |   |-- App.js
\|   |   |-- index.js
\|   |   |-- styles.css
\|   |-- .env
\|   |-- package.json

````

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)  
- MongoDB Atlas account  
- Google Gemini API Key  

### Backend Setup
1. Navigate to the backend directory:
    ```bash
    cd backend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Create a `.env` file with the following:
    ```
    MONGO_URI="your-mongodb-connection-string"
    JWT_SECRET="your-jwt-secret-key"
    GEMINI_API_KEY="your-gemini-api-key"
    ```
4. Start the backend server:
    ```bash
    npm start
    ```

### Frontend Setup
1. Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Create a `.env` file with your backend API URL:
    ```
    REACT_APP_API_URL="your-backend-url"
    ```
    Example: `http://localhost:5000` for local development.  
4. Start the frontend application:
    ```bash
    npm start
    ```

The app will now be running at:  
````

[http://localhost:3000](http://localhost:3000)

```

---

## 💡 Usage
- Sign up or log in to access the chatbot.  
- Upload documents to build your personalized knowledge base.  
- Start chatting and the chatbot will remember your conversation context.  
- Manage multiple chat sessions for different topics.  

---

## 📂 Deployment
- **Backend**: Deploy using services like Render, Railway, or Vercel serverless functions.  
- **Frontend**: Deploy on Vercel for easy hosting and integration with backend API.  

---

## ⚖️ License
This project is licensed under the MIT License.  

---

Made with ❤️ by **Arpita Tiwari**
```

