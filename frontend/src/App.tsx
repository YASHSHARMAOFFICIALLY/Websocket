import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      <div className="flex min-h-screen items-center justify-center bg-background p-6 text-muted-foreground">
        {status === "connecting"
          ? "Connecting…"
          : "Disconnected — is the backend running on :8080?"}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="flex w-full max-w-md flex-col rounded-xl border bg-card text-card-foreground shadow-sm">
        <header className="flex items-center gap-2 border-b px-4 py-3">
          <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden />
          <h2 className="text-sm font-semibold">Chat — connected</h2>
        </header>

        <div className="h-72 space-y-2 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">No messages yet…</p>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className="w-fit max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm text-foreground"
              >
                {msg}
              </div>
            ))
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault(); // stop the page reloading on submit
            sendMessage();
          }}
          className="flex gap-2 border-t p-3"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            aria-label="Message"
            autoComplete="off"
          />
          <Button type="submit">Send</Button>
        </form>
      </div>
    </div>
  );
}

export default App;
