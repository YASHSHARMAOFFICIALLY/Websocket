import WebSocket, { WebSocketServer } from "ws";
import http from "http";

const server = http.createServer(function (request: any, response: any) {
  console.log(new Date() + "Received request for " + request.url);
  response.end("hi there");
});

const wss = new WebSocketServer({ server });

// Server's memory: which connection belongs to which username.
const users = new Map<WebSocket, string>();

// Send one envelope (any object) to every open client.
function broadcast(payload: object) {
  const text = JSON.stringify(payload);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(text);
  });
}

// Tell everyone the current list of online usernames.
function broadcastUserList() {
  broadcast({ type: "userlist", users: [...users.values()] });
}

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", function message(data) {
    const msg = JSON.parse(data.toString());

    if (msg.type === "join") {
      users.set(ws, msg.username); // remember this connection's name
      broadcastUserList(); // online list changed -> tell everyone
      return;
    }

    if (msg.type === "chat") {
      // Trust the SERVER's record of who this connection is,
      // never the username the client claims (anti-impersonation).
      const username = users.get(ws);
      if (!username) return; // ignore chats from someone who never joined
      broadcast({ type: "chat", username, text: msg.text });
      return;
    }
  });

  ws.on("close", function close() {
    users.delete(ws); // remove first...
    broadcastUserList(); // ...then broadcast the updated list
  });
});
server.listen(8080, function () {
  console.log(new Date() + " Server is listening on port 8080");
});
