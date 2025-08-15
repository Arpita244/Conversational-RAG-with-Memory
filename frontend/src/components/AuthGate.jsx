import React, { useState } from "react";
import { createProfile } from "../api";

export default function AuthGate({ onAuthed }) {
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e?.preventDefault();
    if (!displayName.trim()) {
      setErr("Please enter a name");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      const data = await createProfile(displayName.trim());
      localStorage.setItem("ns_token", data.token);
      localStorage.setItem("ns_user_id", data.userId);
      localStorage.setItem("ns_username", data.displayName);
      onAuthed({ userId: data.userId, displayName: data.displayName });
    } catch (e) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.message ||
        "Failed to create profile";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1 className="brand">NerveSpark</h1>
        <h2>Create your profile</h2>
        <form onSubmit={submit} className="auth-fields">
          <input
            placeholder="Display name (unique)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          {err && <div className="error">{err}</div>}
          <button className="primary" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Start"}
          </button>
        </form>
      </div>
    </div>
  );
}
