// backend/models/Document.js
import mongoose from "mongoose";

const chunkSchema = new mongoose.Schema({
  text: String,
  vector: { type: [Number], default: undefined },
  chunkIndex: Number
}, { _id: false });

const documentSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: String,
  chunks: [chunkSchema]
}, { timestamps: true });

export default mongoose.model("Document", documentSchema);
