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

// ✅ CORS updated so frontend link is not hardcoded
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl)
      if (!origin) return callback(null, true);
      return callback(null, true); // allow all origins
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "4mb" }));
app.use(cookieParser());

// health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// routes
app.use("/api/profile", profileRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ingest", ingestRoutes);
app.use("/api/sessions", sessionRoutes);

// db + start
mongoose
  .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
  .then(() => {
    console.log("✅ MongoDB connected");
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
