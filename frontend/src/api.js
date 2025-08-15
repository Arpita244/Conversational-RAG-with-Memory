import axios from "axios";

// ✅ Base URL from environment variable
let API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
if (API_BASE.endsWith("/")) API_BASE = API_BASE.slice(0, -1);

// ✅ Axios instance
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // must match backend credentials
});

// ✅ Attach bearer token if present
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("ns_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ✅ Handle backend errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      "Network Error";
    console.error("API error:", msg);
    return Promise.reject(err);
  }
);

// ================= PROFILE =================
export const createProfile = async (displayName) => {
  const { data } = await api.post("/api/profile/signup", { displayName });
  return data;
};

// ================= SESSIONS =================
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

// ================= MESSAGES =================
export const getSessionMessages = async (sessionId) => {
  const { data } = await api.get(`/api/sessions/${sessionId}/messages`);
  return data;
};

export const sendMessage = async (sessionId, content) => {
  if (!content) throw new Error("content required");
  let sid = sessionId;
  if (!sid) {
    const created = await createSession("New Chat");
    sid = created?.sessionId;
    if (!sid) throw new Error("failed to create session");
  }
  const { data } = await api.post(`/api/sessions/${sid}/messages`, { content });
  return { ...data, sessionId: sid };
};

// ================= INGEST =================
export const ingestText = async (title, text) => {
  const { data } = await api.post("/api/ingest", { title, text });
  return data;
};

export default api;
