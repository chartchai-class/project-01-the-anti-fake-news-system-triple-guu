import { defineStore } from "pinia";

// ---- user id per browser ----
function getUserId() {
  let id = localStorage.getItem("userId");
  if (!id) {
    id = "user-" + Math.random().toString(36).substring(2, 9);
    localStorage.setItem("userId", id);
  }
  return id;
}
const userId = getUserId();

// ---- API base (Railway or local). Set VITE_API_BASE to e.g. https://your-api.up.railway.app
const API_BASE = (import.meta as any)?.env?.VITE_API_BASE
  ? String((import.meta as any).env.VITE_API_BASE).replace(/\/+$/, "")
  : "";

// ---- localStorage helpers for read-only mode ----
const ls = {
  get<T>(key: string, fallback: T): T {
    try {
      const v = localStorage.getItem(key);
      return v ? (JSON.parse(v) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, val: T) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  },
};

export const useNewsStore = defineStore("news", {
  state: () => ({
    news: [] as any[],
    commentsSeed: [] as any[],
    votes: [] as any[],        // from API or localStorage (readOnly)
    userComments: [] as any[], // from API or localStorage (readOnly)

    filter: "all" as "all" | "fake" | "non-fake" | "neutral",
    perPage: 6,
    currentPage: 1,

    // true when using /db.json (no live API writes)
    readOnly: false,
  }),

  getters: {
    commentsFor: (state) => {
      return (newsId: number | string) => {
        const id = String(newsId);
        const seed = state.commentsSeed.filter((c) => String(c.newsId) === id);
        const user = state.userComments.filter((c) => String(c.newsId) === id);
        // newest first
        return [...seed, ...user].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      };
    },

    votesFor: (state) => {
      return (newsId: number | string) => {
        const id = String(newsId);
        const votes = state.votes.filter((v) => String(v.newsId) === id);
        return {
          up: votes.filter((v) => v.dir === 1).length,
          down: votes.filter((v) => v.dir === -1).length,
          myVote: votes.find((v) => String(v.newsId) === id && v.userId === userId)?.dir || 0,
        };
      };
    },

    statusFor: (state) => {
      return (newsId: number | string) => {
        const id = String(newsId);
        const votes = state.votes.filter((v) => String(v.newsId) === id);
        const up = votes.filter((v) => v.dir === 1).length;
        const down = votes.filter((v) => v.dir === -1).length;

        if (up > down) return "non-fake";
        if (down > up) return "fake";
        return "neutral";
      };
    },

    filteredNews: (state): any[] => {
      if (state.filter === "all") return state.news;
      // @ts-ignore access getter
      return state.news.filter((n) => (state as any).statusFor(n.id) === state.filter);
    },

    pagedNews: (state): any[] => {
      const start = (state.currentPage - 1) * state.perPage;
      // @ts-ignore access getter
      return (state as any).filteredNews.slice(start, start + state.perPage);
    },

    totalPages: (state): number => {
      // @ts-ignore access getter
      const len = (state as any).filteredNews.length || 1;
      return Math.ceil(len / state.perPage);
    },
  },

  actions: {
    async fetchNews() {
      // Prefer API when configured
      if (API_BASE) {
        try {
          const [news, comments, votes, userComments] = await Promise.all([
            fetch(`${API_BASE}/news`).then((r) => r.json()),
            fetch(`${API_BASE}/comments`).then((r) => r.json()),
            fetch(`${API_BASE}/votes`).then((r) => r.json()),
            fetch(`${API_BASE}/userComments`).then((r) => r.json()),
          ]);
          this.news = news;
          this.commentsSeed = comments;
          this.votes = votes;
          this.userComments = userComments;
          this.readOnly = false;
          return;
        } catch (e) {
          console.warn("API not reachable, falling back to /db.json (read-only).", e);
        }
      }

      // Fallback: static file served by Vercel (/public/db.json)
      const db = await fetch("/db.json", { cache: "no-store" }).then((r) => r.json());
      this.news = db.news || [];
      this.commentsSeed = db.comments || [];
      // Keep votes/comments in localStorage so demo still works
      this.votes = ls.get("votes", db.votes || []);
      this.userComments = ls.get("userComments", db.userComments || []);
      this.readOnly = true;
    },

    async vote(newsId: number, dir: 1 | -1) {
      const id = String(newsId);

      if (!this.readOnly && API_BASE) {
        try {
          let existing = this.votes.find((v) => String(v.newsId) === id && v.userId === userId);

          if (!existing) {
            const res = await fetch(`${API_BASE}/votes`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ newsId: id, dir, userId }),
            });
            const saved = await res.json();
            this.votes.push(saved);
          } else {
            await fetch(`${API_BASE}/votes/${existing.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ dir }),
            });
            existing.dir = dir;
          }

          // refresh from server
          this.votes = await (await fetch(`${API_BASE}/votes`)).json();
        } catch (err) {
          console.error("Voting failed:", err);
        }
        return;
      }

      // Read-only: store locally
      let existing = this.votes.find((v) => String(v.newsId) === id && v.userId === userId);
      if (!existing) {
        existing = { id: Math.random().toString(36).slice(2, 6), newsId: id, dir, userId };
        this.votes.push(existing);
      } else {
        existing.dir = dir;
      }
      ls.set("votes", this.votes);
    },

    async addComment(newsId: number, text: string, imageUrl = "") {
      const id = String(newsId);
      const payload = {
        newsId: id,
        text,
        imageUrl,
        createdAt: new Date().toISOString(),
        author: "You",
      };

      if (!this.readOnly && API_BASE) {
        const res = await fetch(`${API_BASE}/userComments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const saved = await res.json();
        this.userComments.push(saved);
        return;
      }

      // read-only: local only
      const saved = { ...payload, id: Date.now() };
      this.userComments.push(saved);
      ls.set("userComments", this.userComments);
    },

    async editComment(newsId: number, commentId: number, newText: string) {
      if (!this.readOnly && API_BASE) {
        await fetch(`${API_BASE}/userComments/${commentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: newText, updatedAt: new Date().toISOString() }),
        });
        const c = this.userComments.find((c) => c.id === commentId);
        if (c) c.text = newText;
        return;
      }

      const c = this.userComments.find((c) => c.id === commentId);
      if (c) {
        (c as any).text = newText;
        (c as any).updatedAt = new Date().toISOString();
        ls.set("userComments", this.userComments);
      }
    },

    async deleteComment(newsId: number, commentId: number) {
      if (!this.readOnly && API_BASE) {
        await fetch(`${API_BASE}/userComments/${commentId}`, { method: "DELETE" });
        this.userComments = this.userComments.filter((c) => c.id !== commentId);
        return;
      }

      this.userComments = this.userComments.filter((c) => c.id !== commentId);
      ls.set("userComments", this.userComments);
    },

    setFilter(filter: "all" | "fake" | "non-fake" | "neutral") {
      this.filter = filter;
      this.currentPage = 1;
    },

    setPage(page: number) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
  },
});
