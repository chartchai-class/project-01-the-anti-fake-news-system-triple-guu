import { defineStore } from "pinia";

export const useUiStore = defineStore("ui", {
  state: () => ({
    filter: "all" as "all" | "fake" | "non-fake",
    page: 1,
    pageSize: 6,
    loading: false,
  }),

  getters: {
    // first index of current page
    startIndex: (state) => (state.page - 1) * state.pageSize,
    // last index of current page
    endIndex: (state) => state.page * state.pageSize,
    // compute total pages from an array length
    totalPages: (state) => {
      return (listLength: number) =>
        Math.max(1, Math.ceil(listLength / state.pageSize));
    },
  },

  actions: {
    setFilter(f: "all" | "fake" | "non-fake") {
      this.filter = f;
      this.page = 1; // reset page when filter changes
    },
    setPage(p: number) {
      this.page = Math.max(1, p);
    },
    setPageSize(size: number) {
      this.pageSize = size > 0 ? size : 1;
      this.page = 1; // reset when page size changes
    },
    setLoading(value: boolean) {
      this.loading = value;
    },
  },
});
