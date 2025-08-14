import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import chatRoutes from "./routes/chatRoutes.js";
import ingestRoutes from "./routes/ingestRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import maintenanceRoutes from "./routes/maintenanceRoutes.js";

dotenv.config();
const app = express();
app.use(cors({ origin: ["http://localhost:3000"], credentials: true }));
app.use(express.json({ limit: "2mb" }));

app.use("/api/chat", chatRoutes);
app.use("/api/ingest", ingestRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/maintenance", maintenanceRoutes);

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));
