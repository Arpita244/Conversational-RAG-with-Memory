import mongoose from "mongoose";

const docChunkSchema = new mongoose.Schema({
  docId: { type: String, required: true },
  title: { type: String, required: true },
  chunkIndex: { type: Number, required: true },
  text: { type: String, required: true },
  embedding: { type: [Number], required: true }
});

docChunkSchema.index({ docId: 1, chunkIndex: 1 }, { unique: true });
export default mongoose.model("DocChunk", docChunkSchema);
