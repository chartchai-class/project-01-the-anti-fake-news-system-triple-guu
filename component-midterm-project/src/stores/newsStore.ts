import { defineStore } from "pinia";

// generate per-browser ID (saved in localStorage)
function getUserId() {
  let id = localStorage.getItem("userId");
  if (!id) {
    id = "user-" + Math.random().toString(36).substring(2, 9);
    localStorage.setItem("userId", id);
  }
  return id;
}
const userId = getUserId();

export const useNewsStore = defineStore("news", {
  state: () => ({
    news: [] as any[],
    commentsSeed: [] as any[],
    votes: [] as any[],        // from server
    userComments: [] as any[], // from server

    // ✅ include "neutral" here
    filter: "all" as "all" | "fake" | "non-fake" | "neutral",
    perPage: 6,
    currentPage: 1,
  }),

  getters: {
    commentsFor: (state) => {
      return (newsId: number) => {
        const seed = state.commentsSeed.filter(c => c.newsId === newsId);
        const user = state.userComments.filter(c => c.newsId === newsId);
        return [...seed, ...user];
      };
    },

    votesFor: (state) => {
      return (newsId: number) => {
        const votes = state.votes.filter(v => v.newsId === newsId);
        return {
          up: votes.filter(v => v.dir === 1).length,
          down: votes.filter(v => v.dir === -1).length,
          myVote: votes.find(v => v.newsId === newsId && v.userId === userId)?.dir || 0
        };
      };
    },

    statusFor: (state) => {
      return (newsId: number) => {
        const votes = state.votes.filter(v => v.newsId === newsId);
        const up = votes.filter(v => v.dir === 1).length;
        const down = votes.filter(v => v.dir === -1).length;

        if (up > down) return "non-fake";
        if (down > up) return "fake";
        return "neutral"; // ✅ neutral is now supported
      };
    },

    filteredNews: (state): any[] => {
      if (state.filter === "all") {
        return state.news;
      }
      return state.news.filter(n => (state as any).statusFor(n.id) === state.filter);
    },

    pagedNews: (state): any[] => {
      const start = (state.currentPage - 1) * state.perPage;
      return (state as any).filteredNews.slice(start, start + state.perPage);
    },

    totalPages: (state): number => {
      return Math.ceil((state as any).filteredNews.length / state.perPage);
    },
  },

  actions: {
    async fetchNews() {
      this.news = await (await fetch("http://localhost:3001/news")).json();
      this.commentsSeed = await (await fetch("http://localhost:3001/comments")).json();
      this.votes = await (await fetch("http://localhost:3001/votes")).json();
      this.userComments = await (await fetch("http://localhost:3001/userComments")).json();
    },

    async vote(newsId: number, dir: 1 | -1) {
      try {
        let existing = this.votes.find(v => v.newsId === newsId && v.userId === userId);

        if (!existing) {
          // new vote
          const res = await fetch("http://localhost:3001/votes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newsId, dir, userId })
          });
          const saved = await res.json();
          this.votes.push(saved);
        } else {
          // update vote
          await fetch(`http://localhost:3001/votes/${existing.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dir })
          });
          existing.dir = dir;
        }

        // 🔄 force refresh from server
        this.votes = await (await fetch("http://localhost:3001/votes")).json();
      } catch (err) {
        console.error("Voting failed:", err);
      }
    },

    async addComment(newsId: number, text: string, imageUrl = "") {
      const newComment = {
        newsId,
        text,
        imageUrl,
        createdAt: new Date().toISOString(),
        author: "You"
      };
      const res = await fetch("http://localhost:3001/userComments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComment)
      });
      const saved = await res.json();
      this.userComments.push(saved);
    },

    async editComment(newsId: number, commentId: number, newText: string) {
      await fetch(`http://localhost:3001/userComments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newText, updatedAt: new Date().toISOString() })
      });
      const c = this.userComments.find(c => c.id === commentId);
      if (c) c.text = newText;
    },

    async deleteComment(newsId: number, commentId: number) {
      await fetch(`http://localhost:3001/userComments/${commentId}`, {
        method: "DELETE"
      });
      this.userComments = this.userComments.filter(c => c.id !== commentId);
    },

    // ✅ now accepts "neutral"
    setFilter(filter: "all" | "fake" | "non-fake" | "neutral") {
      this.filter = filter;
      this.currentPage = 1;
    },

    setPage(page: number) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    }
  }
});
