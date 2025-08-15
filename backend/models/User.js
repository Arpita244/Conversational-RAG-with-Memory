// backend/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  displayName: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
