```markdown
# 🚀 NerveSpark - A Personalized RAG Chatbot with Memory

NerveSpark is a full-stack MERN (MongoDB, Express, React, Node.js) application that empowers users with a personalized chatbot. It leverages **Retrieval-Augmented Generation (RAG)** and memory to provide context-aware, knowledge-driven responses.

---

## ✨ Features

- **User Authentication**: Secure user login and profile management.  
- **Conversational Memory**: The chatbot remembers past interactions within a session to provide cohesive and contextually relevant responses.  
- **Retrieval-Augmented Generation (RAG)**: Users can upload their own documents (text files) to serve as a private knowledge base. The chatbot retrieves relevant information from these documents to generate accurate answers.  
- **Dynamic Chat Interface**: A responsive and intuitive UI that displays messages and manages chat sessions in real-time.  
- **Session Management**: Create, rename, and delete chat sessions to organize conversations.  
- **Scalable Architecture**: Built on a robust MERN stack, with a scalable backend and a modular React frontend.  

---

## 🛠️ Tech Stack

### Frontend

- **React**: A JavaScript library for building user interfaces.  
- **Vercel**: A cloud platform for deployment.  

### Backend

- **Node.js & Express**: A fast, unopinionated, minimalist web framework for building APIs.  
- **MongoDB**: A NoSQL database for storing sessions, messages, and user-uploaded documents.  
- **Mongoose**: An elegant MongoDB object modeling tool for Node.js.  
- **Google Gemini API**: Used for generating AI responses and creating text embeddings for RAG and memory.  
- **dotenv**: Loads environment variables from a `.env` file into `process.env`.  
- **CORS**: Middleware for handling Cross-Origin Resource Sharing.  
- **bcryptjs**: A library to hash passwords.  
- **jsonwebtoken**: An implementation of JSON Web Tokens.  
- **cookie-parser**: Middleware to parse cookies.  

---

## 📝 Project Structure

```

/Nervespark
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

1. Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Create a `.env` file with the following variables:
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

1. Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Create a `.env` file in the frontend directory with your backend API URL:
    ```
    REACT_APP_API_URL="your-backend-url"
    ```
    (e.g., `http://localhost:5000` for local development or your Vercel deployment URL).  
4. Start the frontend application:
    ```bash
    npm start
    ```

The application will now be running at [http://localhost:3000](http://localhost:3000).
````


