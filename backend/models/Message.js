import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  // store an embedding per message so we can semantically recall past turns
  embedding: { type: [Number], default: [] },
  timestamp: { type: Date, default: Date.now }
});

messageSchema.index({ userId: 1, timestamp: -1 });
export default mongoose.model("Message", messageSchema);
