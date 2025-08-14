import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  displayName: { type: String, default: "" },
  facts: [
    {
      key: String,
      value: String,
      salience: { type: Number, default: 0.5 },
      firstSeen: Date,
      lastSeen: Date
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
userProfileSchema.index({ userId: 1 });
export default mongoose.model("UserProfile", userProfileSchema);
