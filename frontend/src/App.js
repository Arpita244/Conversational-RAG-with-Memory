import React, { useCallback, useEffect, useState } from "react";
import AuthGate from "./components/AuthGate";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import Ingest from "./components/Ingest";
import {
  createSession,
  listSessions,
  getSessionMessages,
  renameSession as apiRename,
  deleteSession as apiDelete
} from "./api";
import clsx from "clsx";
import "./styles.css";

export default function App() {
  const [user, setUser] = useState(() => {
    const userId = localStorage.getItem("ns_user_id");
    const displayName = localStorage.getItem("ns_username");
    return userId && displayName ? { userId, displayName } : null;
  });

  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [tab, setTab] = useState("chat");

  const selectSession = useCallback(async (s) => {
    if (!s) return;
    setActiveSession(s);
    try {
      const data = await getSessionMessages(s.sessionId);
      setMessages(data.messages.map(m => ({ role: m.role, content: m.content })));
    } catch (e) {
      console.error("getSessionMessages error", e);
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const s = await listSessions();
        setSessions(s);
        if (s.length) {
          selectSession(s[0]);
        } else {
          const created = await createSession("New Chat");
          setSessions([created]);
          selectSession(created);
        }
      } catch (err) {
        console.error("load sessions failed", err);
      }
    })();
  }, [user, selectSession]);

  const addMessage = (m) => setMessages(prev => [...prev, m]);

  const onNewChat = async () => {
    try {
      const created = await createSession("New Chat");
      setSessions(prev => [created, ...prev]);
      await selectSession(created);
    } catch (err) {
      console.error("create session failed", err);
    }
  };

  const renameSession = async (sessionId, title) => {
    try {
      const updated = await apiRename(sessionId, title);
      setSessions(prev => prev.map(s => s.sessionId === sessionId ? updated : s));
      if (activeSession?.sessionId === sessionId) setActiveSession(updated);
    } catch (e) { console.error(e); }
  };

  const deleteSession = async (sessionId) => {
    try {
      await apiDelete(sessionId);
      const rest = sessions.filter(s => s.sessionId !== sessionId);
      setSessions(rest);
      
      if (activeSession?.sessionId === sessionId) {
        if (rest.length) {
          selectSession(rest[0]);
        } else {
          const created = await createSession("New Chat");
          setSessions([created]);
          await selectSession(created);
        }
      }
    } catch (e) { console.error(e); }
  };

  // new handler: when ChatArea creates a session implicitly, update App state and select it
  const handleSessionCreated = async (s) => {
    if (!s?.sessionId) return;
    // avoid duplicates
    setSessions(prev => {
      if (prev.some(p => p.sessionId === s.sessionId)) return prev;
      return [s, ...prev];
    });
    // select the newly created session
    await selectSession(s);
  };

  if (!user) return <AuthGate onAuthed={setUser} />;

  return (
    <div className="app-shell">
      <Sidebar
        user={user}
        sessions={sessions}
        activeSessionId={activeSession?.sessionId}
        onSelect={selectSession}
        onNewChat={onNewChat}
        onRename={renameSession}
        onDelete={deleteSession}
        onSetTab={setTab}
        tab={tab}
      />
      <main className={clsx("main-pane", tab === "ingest" && "ingest-pane")}>
        {tab === "ingest" ? (
          <Ingest />
        ) : (
          <ChatArea
            user={user}
            session={activeSession}
            messages={messages}
            addMessage={addMessage}
            onSessionCreated={handleSessionCreated}
          />
        )}
      </main>
    </div>
  );
}
