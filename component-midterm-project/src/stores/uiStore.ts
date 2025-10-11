import { defineStore } from "pinia";

export const useUiStore = defineStore("ui", {
  state: () => ({
    filter: "all" as "all" | "fake" | "non-fake" | "neutral",
    page: 1,
    pageSize: 6,
    loading: false,
    search: "",
  }),

  getters: {
    startIndex: (state) => (state.page - 1) * state.pageSize,
    endIndex: (state) => state.page * state.pageSize,
    totalPages: (state) => {
      return (listLength: number) =>
        Math.max(1, Math.ceil(listLength / state.pageSize));
    },
  },

  actions: {
    setFilter(f: "all" | "fake" | "non-fake" | "neutral") {
      this.filter = f;
      this.page = 1;
    },
    setPage(p: number) {
      this.page = Math.max(1, p);
    },
    setPageSize(size: number) {
      this.pageSize = size > 0 ? size : 1;
      this.page = 1;
    },
    setLoading(value: boolean) {
      this.loading = value;
    },
    setSearch(value: string) {
      this.search = value.trim();
      this.page = 1;
    },
  },
});
