<template>
  <main class="mx-auto max-w-3xl p-4" v-if="item">
    <!-- News details -->
    <h1 class="text-2xl font-bold mb-2">{{ item.topic }}</h1>
    <p class="text-gray-700 mb-4">{{ item.detail }}</p>

    <!-- Voting -->
    <div class="flex gap-4 mb-6">
      <button @click="cast(1)" class="btn-primary">👍 {{ votes.up }}</button>
      <button @click="cast(-1)" class="btn-ghost">👎 {{ votes.down }}</button>
    </div>

    <!-- Comments -->
    <section>
      <h2 class="text-xl font-semibold mb-2">Comments</h2>

      <!-- Comment form -->
      <form @submit.prevent="addNewComment" class="flex gap-2 mb-4">
        <input
          v-model="newComment"
          placeholder="Write a comment..."
          class="border p-2 flex-1 rounded"
        />
        <button type="submit" class="btn-primary">Post</button>
      </form>

      <!-- Comments list -->
      <ul v-if="comments.length" class="space-y-3">
        <li
          v-for="c in comments"
          :key="c.id"
          class="p-3 border rounded bg-gray-50"
        >
          <p>{{ c.text }}</p>
          <span class="text-xs text-gray-500">
            {{ new Date(c.createdAt).toLocaleString() }}
          </span>
        </li>
      </ul>
      <p v-else class="text-gray-500">No comments yet. Be the first!</p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useNewsStore } from "@/stores/newsStore";

const route = useRoute();
const newsStore = useNewsStore();

const item = computed(() =>
  newsStore.news.find((n) => String(n.id) === route.params.id)
);

const votes = computed(() =>
  item.value ? newsStore.votesFor(item.value.id) : { up: 0, down: 0 }
);

function cast(dir: 1 | -1) {
  if (item.value) newsStore.vote(item.value.id, dir);
}

// comments
const newComment = ref("");
const comments = computed(() =>
  item.value ? newsStore.commentsFor(item.value.id) : []
);

function addNewComment() {
  if (item.value && newComment.value.trim()) {
    newsStore.addComment(item.value.id, newComment.value.trim());
    newComment.value = "";
  }
}
</script>
