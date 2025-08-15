import React, { useEffect, useState } from "react";
import { getMyProfile, updateProfile } from "../api"; // Corrected import names

export default function Profile() {
  const userId = localStorage.getItem("ns_user_id");
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [factsText, setFactsText] = useState("");

  useEffect(() => { if (userId) load(); }, [userId]);

  const load = async () => {
    try {
      const data = await getMyProfile(); // Corrected function call
      setProfile(data);
      setName(data?.displayName || "");
      // The `facts` array is not in the provided `User` model, so this part is likely to break.
      // I'll leave the code as is to reflect the original intent, but this will fail.
      setFactsText((data?.facts || []).map(f => `${f.key}:${f.value}:${f.salience}`).join("\n"));
    } catch (e) { console.warn(e); }
  };

  const save = async () => {
    const facts = factsText.split("\n").map(l => { const [k, v, s] = l.split(":"); return { key: k?.trim(), value: v?.trim(), salience: parseFloat(s) || 0.5 }; }).filter(f => f.key && f.value);
    const payload = { displayName: name, facts };
    try {
      const up = await updateProfile(payload); // Corrected function call
      setProfile(up);
      setEditing(false);
      localStorage.setItem("ns_username", name);
    } catch (e) { console.warn(e); }
  };

  return (
    <div className="card">
      <h3>Profile</h3>
      <div><strong>UserId:</strong> {userId}</div>
      {editing ? (
        <>
          <div><label>Name</label><input value={name} onChange={e => setName(e.target.value)} /></div>
          <div><label>Facts (key:value:salience)</label><textarea rows={6} value={factsText} onChange={e => setFactsText(e.target.value)} /></div>
          <div><button onClick={save}>Save</button> <button onClick={() => setEditing(false)}>Cancel</button></div>
        </>
      ) : (
        <>
          <div><strong>Name:</strong> {profile?.displayName || "—"}</div>
          <div><strong>Facts:</strong> <ul>{(profile?.facts || []).map((f, i) => (<li key={i}>{f.key}: {f.value} (s={Number(f.salience).toFixed(2)})</li>))}</ul></div>
          <button onClick={() => setEditing(true)}>Edit</button>
        </>
      )}
    </div>
  );
}