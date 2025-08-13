import axios from "axios";
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
export const sendMessage = async (userId, message) => {
  const { data } = await axios.post(`${API_BASE}/api/chat`, { userId, message });
  return data; // { reply, sources, memories, metrics }
};
