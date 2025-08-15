// backend/models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true, index: true },
  role: { type: String, enum: ["user","assistant","system"], required: true },
  content: { type: String, required: true },
  vector: { type: [Number], default: undefined }
}, { timestamps: { createdAt: "timestamp" } });

export default mongoose.model("Message", messageSchema);
