import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import chatRoutes from "./routes/chatRoutes.js";
import ingestRoutes from "./routes/ingestRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";

dotenv.config();
const app = express();

// ✅ List of allowed origins (no trailing slashes)
const allowedOrigins = [
  "http://localhost:3000", // local frontend
  "https://conversational-rag-with-memory-b-git-c42621-arpita244s-projects.vercel.app", // deployed frontend
];

// ✅ CORS middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow requests like Postman
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true, // needed if you use cookies
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // allow preflight
    allowedHeaders: ["Content-Type", "Authorization"], // allow headers in preflight
  })
);

// ✅ Parse JSON and cookies
app.use(express.json({ limit: "4mb" }));
app.use(cookieParser());

// ✅ Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ✅ Routes
app.use("/api/profile", profileRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ingest", ingestRoutes);
app.use("/api/sessions", sessionRoutes);

// ✅ Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
  .then(() => {
    console.log("✅ MongoDB connected");
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
