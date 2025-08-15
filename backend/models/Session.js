// backend/models/Session.js
import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true }, // store token userId as string
  sessionId: { type: String, required: true, unique: true, index: true },
  title: { type: String, default: "New Chat" }
}, { timestamps: true });

export default mongoose.model("Session", sessionSchema);
