// src/stores/newsStore.ts
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

// ---- API base (Railway or local). Set VITE_API_BASE in .env
const API_BASE = (import.meta as any)?.env?.VITE_API_BASE
  ? String((import.meta as any).env.VITE_API_BASE).replace(/\/+$/, "")
  : "";

// centralize endpoints (edit here if your API uses a prefix like /api)
const EP = {
  news: `${API_BASE}/news`,
  comments: `${API_BASE}/comments`,
  votes: `${API_BASE}/votes`,
  userComments: `${API_BASE}/userComments`,
};

// ---- localStorage helpers ----
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

type NewsItem = {
  id: number | string;
  topic: string;
  short: string;
  detail?: string;
  link?: string;
  image?: string;
  reporter?: string;
  reportedAt: string;
};

// helpers
function sortByReportedAtDesc(a: Partial<NewsItem>, b: Partial<NewsItem>) {
  const da = a.reportedAt ? +new Date(a.reportedAt) : 0;
  const db = b.reportedAt ? +new Date(b.reportedAt) : 0;
  return db - da;
}
function mergeUniqueById<T extends { id: any }>(arr: T[], item: T) {
  const id = String(item.id);
  const without = arr.filter((x) => String(x.id) !== id);
  return [item, ...without];
}

export const useNewsStore = defineStore("news", {
  state: () => ({
    news: [] as NewsItem[],
    commentsSeed: [] as any[],
    votes: [] as any[],
    userComments: [] as any[],

    // ⚠️ only the filters you want
    filter: "all" as "all" | "fake" | "non-fake",
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
        // no need to expose "neutral" as a filter; All will include it
        return "neutral";
      };
    },

    filteredNews: (state): NewsItem[] => {
      if (state.filter === "all") return state.news;
      // @ts-ignore access getter
      return state.news.filter((n) => (state as any).statusFor(n.id) === state.filter);
    },

    pagedNews: (state): NewsItem[] => {
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
      if (API_BASE) {
        try {
          const [news, comments, votes, userComments] = await Promise.all([
            fetch(EP.news, { cache: "no-store" }).then((r) => r.json()),
            fetch(EP.comments, { cache: "no-store" }).then((r) => r.json()),
            fetch(EP.votes, { cache: "no-store" }).then((r) => r.json()),
            fetch(EP.userComments, { cache: "no-store" }).then((r) => r.json()),
          ]);
          const list = Array.isArray(news) ? news : [];
          this.news = list.sort(sortByReportedAtDesc);
          this.commentsSeed = Array.isArray(comments) ? comments : [];
          this.votes = Array.isArray(votes) ? votes : [];
          this.userComments = Array.isArray(userComments) ? userComments : [];
          this.readOnly = false;
          return;
        } catch (e) {
          console.warn("API not reachable, falling back to /db.json (read-only).", e);
        }
      }

      // Fallback: /db.json + locally created news (userNews)
      const db = await fetch("/db.json", { cache: "no-store" }).then((r) => r.json());
      const seedNews: NewsItem[] = db.news || [];
      const localUserNews: NewsItem[] = ls.get("userNews", [] as NewsItem[]);
      this.news = [...localUserNews, ...seedNews].sort(sortByReportedAtDesc);
      this.commentsSeed = db.comments || [];
      this.votes = ls.get("votes", db.votes || []);
      this.userComments = ls.get("userComments", db.userComments || []);
      this.readOnly = true;
    },

    // Create a news item. Writes to your API when available; otherwise to localStorage.
    async addNews(payload: Omit<NewsItem, "id"> | Partial<NewsItem>) {
      let created: NewsItem;

      if (API_BASE && !this.readOnly) {
        const res = await fetch(EP.news, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`Failed to create news (status ${res.status})`);
        const raw = await res.json();
        created = (raw && (raw.data || raw)) as NewsItem;
      } else {
        const userNews = ls.get<NewsItem[]>("userNews", []);
        const id = Date.now(); // local id
        created = {
          id,
          topic: payload.topic || "",
          short: payload.short || "",
          detail: payload.detail || "",
          link: payload.link || "",
          image: payload.image || "",
          reporter: payload.reporter || "You",
          reportedAt: payload.reportedAt || new Date().toISOString(),
        };
        userNews.unshift(created);
        ls.set("userNews", userNews);
      }

      // ✅ make it appear immediately at the top (no duplicates)
      this.news = mergeUniqueById(this.news, created).sort(sortByReportedAtDesc);
      this.currentPage = 1; // ensure visible on Home first page

      // ✅ If API mode, refresh from server to reflect canonical data
      if (API_BASE && !this.readOnly) {
        try {
          await this.fetchNews();
        } catch {
          /* ignore */
        }
      }

      return created;
    },

    async vote(newsId: number, dir: 1 | -1) {
      const id = String(newsId);

      if (!this.readOnly && API_BASE) {
        try {
          let existing = this.votes.find((v) => String(v.newsId) === id && v.userId === userId);

          if (!existing) {
            const res = await fetch(EP.votes, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ newsId: id, dir, userId }),
            });
            const saved = await res.json();
            this.votes.push(saved);
          } else {
            await fetch(`${EP.votes}/${existing.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ dir }),
            });
            existing.dir = dir;
          }

          // refresh from server
          this.votes = await (await fetch(EP.votes, { cache: "no-store" })).json();
        } catch (err) {
          console.error("Voting failed:", err);
        }
        return;
      }

      // Read-only: local
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
        const res = await fetch(EP.userComments, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const saved = await res.json();
        this.userComments.push(saved);
        return;
      }

      const saved = { ...payload, id: Date.now() };
      this.userComments.push(saved);
      ls.set("userComments", this.userComments);
    },

    async editComment(newsId: number, commentId: number, newText: string) {
      if (!this.readOnly && API_BASE) {
        await fetch(`${EP.userComments}/${commentId}`, {
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
        await fetch(`${EP.userComments}/${commentId}`, { method: "DELETE" });
        this.userComments = this.userComments.filter((c) => c.id !== commentId);
        return;
      }

      this.userComments = this.userComments.filter((c) => c.id !== commentId);
      ls.set("userComments", this.userComments);
    },

    setFilter(filter: "all" | "fake" | "non-fake") {
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
