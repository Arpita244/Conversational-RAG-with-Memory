import React, { useState } from "react";
import ChatUI from "./components/ChatUI";
import Ingest from "./components/Ingest";
import Profile from "./components/Profile";

export default function App() {
  const [tab, setTab] = useState("chat");
  return (
    <div>
      <header className="site-header">
        <div className="container">
          <h1>RAG Memory Chat</h1>
          <nav>
            <button onClick={() => setTab("chat")} className={tab==="chat"?"active":""}>Chat</button>
            <button onClick={() => setTab("ingest")} className={tab==="ingest"?"active":""}>Ingest</button>
            <button onClick={() => setTab("profile")} className={tab==="profile"?"active":""}>Profile</button>
          </nav>
        </div>
      </header>

      <main className="container">
        {tab === "chat" && <ChatUI />}
        {tab === "ingest" && <Ingest />}
        {tab === "profile" && <Profile />}
      </main>

      <footer className="site-footer">
        <div className="container">
          <span>Conversational RAG • Memory • Personalized Responses</span>
        </div>
      </footer>
    </div>
  );
}
