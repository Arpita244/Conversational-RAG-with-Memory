import React, { useState } from "react";
import ChatUI from "./components/ChatUI";
import Ingest from "./components/Ingest";

export default function App() {
  const [tab, setTab] = useState("chat");
  return (
    <div>
      <div style={{ display: "flex", gap: 12, padding: 12, borderBottom: "1px solid #eee" }}>
        <button onClick={() => setTab("chat")}>Chat</button>
        <button onClick={() => setTab("ingest")}>Ingest</button>
      </div>
      {tab === "chat" ? <ChatUI /> : <Ingest />}
    </div>
  );
}
