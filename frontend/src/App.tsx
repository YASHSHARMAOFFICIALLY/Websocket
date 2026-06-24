import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import "./index.css";

type ChatMessage = { username: string; text: string };

export function App() {
  const [joined, setJoined] = useState(false);
  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [online, setOnline] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const socketRef = useRef<WebSocket | null>(null);

  // Close the socket if the component unmounts.
  useEffect(() => {
    return () => socketRef.current?.close();
  }, []);

  function join() {
    const name = username.trim();
    if (!name) return;

    const ws = new WebSocket("ws://localhost:8080");
    socketRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join", username: name }));
      setJoined(true);
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "userlist") setOnline(msg.users);
      else if (msg.type === "chat") {
        setMessages((prev) => [...prev, { username: msg.username, text: msg.text }]);
      }
    };
  }

  function sendMessage() {
    const ws = socketRef.current;
    const text = input.trim();
    if (!text || !ws || ws.readyState !== WebSocket.OPEN) return;
    // No username here — the server stamps it from its own record.

  }

  // --- Screen 1: pick a username ---
  if (!joined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            join();
          }}
          className="flex w-full max-w-sm flex-col gap-3 rounded-xl border bg-card p-6 text-card-foreground shadow-sm"
        >
          <h1 className="text-lg font-semibold">Join the chat</h1>
          <label htmlFor="username" className="text-sm text-muted-foreground">
            Pick a username
          </label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. Yash"
            autoComplete="off"
            autoFocus
          />
          <Button type="submit" disabled={!username.trim()}>
            Join
          </Button>
        </form>
      </div>
    );
  }

  // --- Screen 2: the chat ---
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="grid w-full max-w-3xl grid-cols-[1fr_180px] overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
        {/* Messages column */}
        <div className="flex min-w-0 flex-col">
          <header className="flex items-center gap-2 border-b px-4 py-3">
            <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden />
            <h2 className="text-sm font-semibold">Global chat</h2>
          </header>

          <div className="h-80 space-y-2 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No messages yet…</p>
            ) : (
              messages.map((m, i) => (
                <div key={i} className="text-sm">
                  <span className="font-semibold">{m.username}</span>
                  <span className="text-muted-foreground">: </span>
                  <span>{m.text}</span>
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
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

        {/* Online users sidebar */}
        <aside className="border-l bg-muted/30 p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Online — {online.length}
          </h3>
          <ul className="space-y-1">
            {online.map((u) => (
              <li key={u} className="flex items-center gap-2 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" aria-hidden />
                {u}
                {u === username.trim() && (
                  <span className="text-muted-foreground">(you)</span>
                )}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

export default App;
