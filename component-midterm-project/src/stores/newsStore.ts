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

    filter: "all" as "all" | "fake" | "non-fake",
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

    filteredNews: (state) => {
      if (state.filter === "all") return state.news;
      return state.news.filter(n => n.status === state.filter);
    },

    pagedNews: (state) => {
      return (page: number = state.currentPage) => {
        const start = (page - 1) * state.perPage;
        return (state as any).filteredNews.slice(start, start + state.perPage);
      };
    },

    totalPages: (state) => {
      return Math.ceil((state as any).filteredNews.length / state.perPage);
    },
  },

  actions: {
    async fetchNews() {
      const res = await fetch("http://localhost:3001/news");
      this.news = await res.json();

      const cRes = await fetch("http://localhost:3001/comments");
      this.commentsSeed = await cRes.json();

      const vRes = await fetch("http://localhost:3001/votes");
      this.votes = await vRes.json();

      const uRes = await fetch("http://localhost:3001/userComments");
      this.userComments = await uRes.json();
    },

    async vote(newsId: number, dir: 1 | -1) {
  let existing = this.votes.find(v => v.newsId === newsId && v.userId === userId);

  if (!existing) {
    // first time voting → save
    const res = await fetch("http://localhost:3001/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newsId, dir, userId })
    });
    const saved = await res.json();
    this.votes.push(saved);
  } else {
    // already voted → just update to new direction (no unvote)
    await fetch(`http://localhost:3001/votes/${existing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dir })
    });
    existing.dir = dir;
  }

  // refresh state from server to keep all browsers in sync
  const vRes = await fetch("http://localhost:3001/votes");
  this.votes = await vRes.json();
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

    setFilter(filter: "all" | "fake" | "non-fake") {
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
