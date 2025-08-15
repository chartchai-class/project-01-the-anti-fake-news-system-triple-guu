//mock storage
export const seedNews = [
  { id: "n1", topic: "City introduces smart bins", short: "Pilot program launches downtown.", details: "The city has installed IoT‑enabled smart bins to optimize waste collection routes.", reporter: "Alex Chan", date: "2025-03-12T10:05:00Z", status: "fake", image: "https://images.unsplash.com/photo-1503596476-1c12a8ba09a0?q=80&w=1200" },
  { id: "n2", topic: "Mars water found in new craters", short: "Amateur telescope group claims discovery.", details: "A local stargazer club posted images asserting liquid water on Mars craters.", reporter: "Siti Rahman", date: "2025-02-28T18:32:00Z", status: "real", image: "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?q=80&w=1200" },
  { id: "n3", topic: "New traffic rules this weekend", short: "Temporary diversions announced.", details: "Transport authority announced diversions for the marathon event.", reporter: "Luis Ortega", date: "2025-01-07T07:45:00Z", status: "real", image: "https://images.unsplash.com/photo-1501706362039-c06b2d715385?q=80&w=1200" }
];

// Keep it in-memory (no persistence) — matches the UI/UX-only deliverables
let commentsStore = new Map(); // id -> array
let votesStore = new Map(); // id -> { up, down }

export function getAllNews() { return seedNews; }
export function getById(id) { return seedNews.find((n) => n.id === id); }

export function getComments(id) { return commentsStore.get(id) || []; }
export function addComment(id, { text, url }) {
  const current = commentsStore.get(id) || [];
  const next = [{ id: crypto.randomUUID(), text, url, at: new Date().toISOString() }, ...current];
  commentsStore.set(id, next);
  return next;
}

export function getVotes(id) { return votesStore.get(id) || { up: 0, down: 0 }; }
export function vote(id, type) {
  const v = { ...getVotes(id) };
  if (type === "up") v.up += 1; else v.down += 1;
  votesStore.set(id, v);
  return v;
}