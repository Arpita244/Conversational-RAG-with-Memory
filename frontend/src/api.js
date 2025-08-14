import axios from "axios";
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
const api = axios.create({ baseURL: API_BASE, headers: { "Content-Type": "application/json" }, timeout: 15000 });

export const sendMessage = async (userId, message) => {
  try {
    const { data } = await api.post("/api/chat", { userId, message });
    return data;
  } catch (err) {
    console.error("sendMessage error:", err.response?.data || err.message);
    throw err;
  }
};

export const fetchHistory = async (userId) => {
  try {
    const { data } = await api.get(`/api/chat/history/${userId}`);
    return data;
  } catch (err) {
    console.error("fetchHistory error:", err.response?.data || err.message);
    throw err;
  }
};

export const ingestText = async (title, text) => {
  try {
    const { data } = await api.post("/api/ingest", { title, text });
    return data;
  } catch (err) {
    console.error("ingestText error:", err.response?.data || err.message);
    throw err;
  }
};

export const getProfile = async (userId) => {
  const { data } = await api.get(`/api/profile/${userId}`);
  return data;
};

export const updateProfile = async (userId, payload) => {
  const { data } = await api.post(`/api/profile/${userId}`, payload);
  return data;
};
