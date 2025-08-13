import axios from "axios";
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
export const ingestText = async (title, text) => {
  const { data } = await axios.post(`${API_BASE}/api/ingest`, { title, text });
  return data;
};
