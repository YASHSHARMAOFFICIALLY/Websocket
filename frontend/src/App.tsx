import { useEffect, useRef, useState } from "react";
import "./index.css";

type Status = "connecting" | "Open" | "closed";

export function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<Status>("connecting");
  const [input, setInput] = useState("");

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    socketRef.current = ws;
    ws.onopen = () => setStatus("Open");
    ws.onmessage = (event) => setMessages((prev) => [...prev, event.data]);
    ws.onclose = () => setStatus("closed");
    ws.onerror = () => setStatus("closed");
    return () => ws.close();
  }, []);

  function sendMessage() {
    const ws = socketRef.current;
    const text = input.trim();
    if (!text) return; // ignore empty sends

    // GUARD: only send when the socket is actually OPEN. Sending while
    // CONNECTING or CLOSED throws. Same readyState lesson as the backend.
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(text);
      setInput("");
    }
  }

  if (status !== "Open") {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        {status === "connecting"
          ? "Connecting…"
          : "Disconnected — is the backend running on :8080?"}
      </div>
    );
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 480 }}>
      <h2>Chat (connected)</h2>

      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: 8,
          height: 280,
          overflowY: "auto",
          padding: 12,
          marginBottom: 12,
        }}
      >
        {messages.length === 0 ? (
          <em style={{ color: "#888" }}>No messages yet…</em>
        ) : (
          messages.map((msg, i) => <div key={i}>{msg}</div>)
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault(); // stop the page reloading on submit
          sendMessage();
        }}
        style={{ display: "flex", gap: 8 }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit" style={{ padding: "8px 16px" }}>
          Send
        </button>
      </form>
    </div>
  );
}

export default App;
