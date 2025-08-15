<template>
  <main id="main" class="mx-auto max-w-6xl px-4 py-6">
    <h1 class="text-2xl font-bold mb-4">Latest News</h1>
    <FilterBar v-model="controls" />

    <div v-if="loading" class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <SkeletonCard v-for="i in controls.pageSize" :key="i" />
    </div>

    <div v-else>
      <EmptyState v-if="items.length===0" class="mt-4">No news match the selected filter.</EmptyState>
      <template v-else>
        <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <NewsCard v-for="n in items" :key="n.id" :item="n" />
        </div>
        <Pagination class="mt-2" :page="page" :total-pages="totalPages" @update:page="(v)=>page=v" />
      </template>
    </div>
  </main>
</template>
<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import FilterBar from "../components/FilterBar.vue";
import NewsCard from "../components/NewsCard.vue";
import Pagination from "../components/Pagination.vue";
import EmptyState from "../components/EmptyState.vue";
import SkeletonCard from "../components/SkeletonCard.vue";
import { getAllNews } from "../data/news";

const controls = reactive({ status: "all", pageSize: 6 });
const page = ref(1);
const loading = ref(true);
const news = ref([]);

onMounted(() => {
  setTimeout(() => { news.value = getAllNews(); loading.value = false; }, 600);
});

const filtered = computed(() => {
  if (controls.status === "all") return news.value;
  return news.value.filter(n => n.status === (controls.status === "fake" ? "fake" : "real"));
});

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / controls.pageSize)));
const items = computed(() => filtered.value.slice((page.value-1)*controls.pageSize, (page.value)*controls.pageSize));
watch([() => controls.status, () => controls.pageSize], () => { page.value = 1; });
</script>
