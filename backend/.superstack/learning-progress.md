# Learning Progress

## WebSocket Chat (Bun backend + React frontend)

### Understood (fixed correctly during review)
- ws server broadcast: `wss.clients` (collection) vs `client` (loop item)
- bracket/paren matching in nested callbacks
- TS type vs runtime variable: `Status` (type) vs `status` (state)
- state naming mismatch: `message` vs `messages`
- TS primitive vs wrapper: `string[]` not `String[]`
- React component must be `export default` to be mounted

### Shaky (needed multiple hints / redirected)
- First broadcast fix: renamed the loop ITEM instead of the COLLECTION — misread which side of `.forEach` was wrong
- @types/ws vs ws: understood that runtime code and TS types are separate packages, but needed prompting on the `@types/` convention and dev-dependency flag
- package.json: no `scripts` section → `bun run dev` fails; direct-run via `bun <file>` not yet internalized

### Open decisions
- Chose Path A (keep `ws` package) over Path B (Bun built-in WebSocket), despite project CLAUDE.md preferring Bun. Deliberate — wants Node-ecosystem familiarity.

### Not yet covered
- Why useEffect cleanup matters for WebSocket (closing on unmount)
- readyState guard reasoning (CONNECTING/CLOSED throws on send)
- Running the backend + frontend together end-to-end

### Cosmetic debt left in code
- frontend setter typo `setstaus` (consistent, so works)
- backend line 5: missing space in date log string concat

### Phase 1 design (reasoned out himself, no code given)
- Message envelope `{ type, username, text }` — type discriminates join vs chat
- `Map<ws, username>` for server-side identity memory
- Online list = `map.values()`
- Two broadcast moments: join and disconnect
- Disconnect ordering: remove from Map BEFORE broadcasting list
- Chat sender name: look up by `ws` in Map, NOT from client-claimed field
- Security insight (got it himself): trusting client username = impersonation risk; server is source of truth for identity

### Errors reviewed
- 2026-06-20 | backend/index.ts | ws broadcast property, paren mismatch, log concat | Understood: yes
- 2026-06-20 | frontend/src/index.tsx | String wrapper, name mismatch, type-vs-var, missing export | Understood: yes
