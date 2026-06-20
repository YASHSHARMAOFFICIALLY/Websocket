// Frontend server: serves index.html (which loads frontend.tsx -> App).
// The chat WebSocket itself lives on the separate backend at :8080.
import index from "./index.html";

const server = Bun.serve({
  routes: { "/": index },
  development: { hmr: true, console: true },
});

console.log(`Frontend running on ${server.url}`);
