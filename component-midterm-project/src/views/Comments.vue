<template>
  <section class="mt-6">
    <h2 class="text-xl font-semibold mb-3">Comments</h2>
    <form class="card p-4 space-y-3" @submit.prevent="onSubmit">
      <div>
        <label for="text" class="block text-sm font-medium">Why do you think this is {{ parentItem.status==='fake' ? 'fake' : 'non‑fake' }}?</label>
        <textarea id="text" v-model.trim="text" required rows="3" class="mt-1 w-full rounded-xl border-gray-300 focus:ring-brand-500" placeholder="Write your reasoning..."></textarea>
      </div>
      <div>
        <label for="url" class="block text-sm font-medium">Evidence URL (optional)</label>
        <input id="url" v-model.trim="url" type="url" class="mt-1 w-full rounded-xl border-gray-300 focus:ring-brand-500" placeholder="https://example.com/article" />
      </div>
      <div class="flex justify-end gap-2">
        <button type="reset" class="btn-ghost" @click="resetForm">Clear</button>
        <button type="submit" class="btn-primary">Add Comment</button>
      </div>
    </form>

    <div class="mt-4 space-y-3">
      <div v-if="list.length===0" class="card p-6 text-center text-gray-600">No comments yet. Be the first!</div>
      <article v-else v-for="c in list" :key="c.id" class="card p-4">
        <p class="text-sm">{{ c.text }}</p>
        <div class="mt-2 flex items-center justify-between text-xs text-gray-500">
          <a v-if="c.url" class="underline break-all" :href="c.url" target="_blank" rel="noopener">Evidence</a>
          <time :datetime="c.at">{{ new Date(c.at).toLocaleString() }}</time>
        </div>
      </article>
    </div>
  </section>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { addComment, getById, getComments } from "../data/news";

const route = useRoute();
const id = route.params.id;
const parentItem = getById(id);
const text = ref("");
const url = ref("");
const list = ref([]);

onMounted(() => { list.value = getComments(id); });
function resetForm(){ text.value = ""; url.value = ""; }
function onSubmit(){ list.value = addComment(id, { text: text.value, url: url.value }); resetForm(); }
</script>
