
# 🚀 NerveSpark

**NerveSpark** is a personalized AI chatbot with memory and Retrieval-Augmented Generation (RAG). Users can upload their own documents to create a private knowledge base, and the chatbot provides context-aware responses while remembering past interactions within a session.

---

## Tech Stack

- **Frontend:** 
  - **React**: A JavaScript library for building interactive user interfaces.
  - **CSS**: Custom styling for a responsive and modern design.
  - **Vercel**: Platform for frontend deployment.

- **Backend:**
  - **Node.js**: JavaScript runtime for building server-side applications.
  - **Express.js**: Web framework for handling APIs and routing.

- **Database:**
  - **MongoDB**: NoSQL database for storing users, messages, sessions, and uploaded documents.

- **AI & APIs:**
  - **Google Gemini API**: For AI response generation and creating embeddings for RAG and memory.

- **Authentication & Security:**
  - **JWT (JSON Web Tokens)**: For secure user authentication.
  - **bcryptjs**: Password hashing for security.
  - **cookie-parser & CORS**: Middleware for cookie handling and cross-origin requests.

---

## Features

- **User Authentication:** Secure signup, login, and profile management.  
- **Conversational Memory:** Chatbot remembers previous interactions in a session.  
- **RAG (Retrieval-Augmented Generation):** Upload documents to build a private knowledge base.  
- **Dynamic Chat Interface:** Responsive and intuitive UI for real-time messaging.  
- **Session Management:** Create, rename, and delete chat sessions.  
- **Scalable Architecture:** Modular backend and frontend for easy maintenance and expansion.

---

## Deployment

- **Frontend:** Deployed on Vercel.  
- **Backend:** Can be deployed on Render, Railway, or Vercel serverless functions.  

> For local setup, follow the installation instructions in the project.

---

## Installation & Setup

### Backend
```bash
cd backend
npm install
````

Create `.env` file:

```
MONGO_URI="your-mongodb-connection-string"
JWT_SECRET="your-jwt-secret-key"
GEMINI_API_KEY="your-gemini-api-key"
```

Start the server:

```bash
npm start
```

### Frontend

```bash
cd frontend
npm install
```

Create `.env` file:

```
REACT_APP_API_URL="your-backend-url"
```

Start the frontend:

```bash
npm start
```

App will run at `http://localhost:3000`.

---

## Screenshots

![Chat Interface](C:\MERN\PROJECTS\Nervespark\frontend\public\image.png)

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for improvements or suggestions.

---

## Contact

For questions or support, contact **[arpitatiwari8756@gmail.com](mailto:arpitatiwari8756@gmail.com)**.

---

Enjoy using **NerveSpark**! 🚀

```

✅ This version matches the **style of your LPU Express README** with:  
- Bold headings and emojis  
- Tech stack clearly separated  
- Features listed neatly  
- Screenshots section ready for images  
- Installation instructions for both backend and frontend  

---

