import mongoose from "mongoose";

const ChatHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Session/User ID
  question: { type: String, required: true },
  answer: { type: String, required: true },
  personalizedContext: { type: Object }, // Store user-specific preferences
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("ChatHistory", ChatHistorySchema);
