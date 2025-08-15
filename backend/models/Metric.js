import mongoose from "mongoose";
const metricSchema = new mongoose.Schema({
  userId: String,
  sessionId: String,
  action: String,
  latencyMs: Number,
  personalizedUsed: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});
export default mongoose.model("Metric", metricSchema);
