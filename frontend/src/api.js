import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true
});

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem("ns_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// profile
// NOTE: backend exposes signup as POST /api/profile/signup
// Fix: call the correct endpoint so signup returns a token
export const createProfile = async (displayName) => {
  const { data } = await api.post("/api/profile/signup", { displayName });
  return data;
};

// sessions
export const listSessions = async () => {
  const { data } = await api.get("/api/sessions");
  return data;
};
export const createSession = async (title = "New Chat") => {
  const { data } = await api.post("/api/sessions", { title });
  return data;
};
export const renameSession = async (sessionId, title) => {
  const { data } = await api.patch(`/api/sessions/${sessionId}`, { title });
  return data;
};
export const deleteSession = async (sessionId) => {
  const { data } = await api.delete(`/api/sessions/${sessionId}`);
  return data;
};

// messages
export const getSessionMessages = async (sessionId) => {
  const { data } = await api.get(`/api/sessions/${sessionId}/messages`);
  return data;
};

// sendMessage: create session automatically if none provided, then post
export const sendMessage = async (sessionId, content) => {
  if (!content) throw new Error("content required");

  let sid = sessionId;

  if (!sid) {
    const created = await createSession("New Chat");
    sid = created?.sessionId;
    if (!sid) {
      throw new Error("failed to create session");
    }
  }

  const { data } = await api.post(`/api/sessions/${sid}/messages`, { content });

  // include sessionId so UI can update if a new session was auto-created
  return { ...data, sessionId: sid };
};

// ingest (if used)
export const ingestText = async (title, text) => {
  const { data } = await api.post("/api/ingest", { title, text });
  return data;
};

export default api;
