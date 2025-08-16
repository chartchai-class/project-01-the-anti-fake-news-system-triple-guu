<template>
  <section class="mt-8">
    <h2 class="text-xl font-semibold mb-4">Comments</h2>

    <!-- Comment Form -->
    <div class="card p-4 mb-6">
      <form @submit.prevent="onSubmit" class="space-y-3">
        <textarea
          v-model.trim="text"
          required
          rows="3"
          class="w-full rounded-lg border-gray-300 focus:ring-brand-500"
          placeholder="Share your thoughts..."
        ></textarea>

        <input
          v-model.trim="url"
          type="url"
          class="w-full rounded-lg border-gray-300 focus:ring-brand-500"
          placeholder="Optional: Evidence link (https://example.com)"
        />

        <div class="flex justify-end gap-2">
          <button type="reset" class="btn-ghost" @click="resetForm">Cancel</button>
          <button type="submit" class="btn-primary">Post Comment</button>
        </div>
      </form>
    </div>

    <!-- No comments -->
    <div v-if="comments.length === 0" class="text-center text-gray-500 py-6">
      No comments yet. Be the first to share your opinion!
    </div>

    <!-- Toggle button -->
    <div v-else class="text-center mb-4">
      <button
        @click="showComments = !showComments"
        class="text-sm text-blue-600 hover:underline"
      >
        {{ showComments ? "Hide comments" : "View comments (" + comments.length + ")" }}
      </button>
    </div>

    <!-- Comment List -->
    <ul v-if="showComments" class="space-y-4">
      <li v-for="c in comments" :key="c.id" class="card p-4">
        <div class="flex items-start gap-3">
          <!-- Avatar -->
          <div
            class="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center font-bold text-brand-700"
          >
            {{ c.author?.[0] || "U" }}
          </div>

          <!-- Comment Content -->
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <span class="font-semibold text-sm">{{ c.author || "Anonymous" }}</span>
              <time class="text-xs text-gray-500" :datetime="c.createdAt">
                {{ new Date(c.createdAt).toLocaleString() }}
              </time>
            </div>

            <!-- Edit mode -->
            <div v-if="editingId === c.id">
              <textarea
                v-model="editText"
                rows="2"
                class="w-full border rounded p-1 mt-2"
              ></textarea>
              <div class="flex gap-2 mt-2">
                <button class="btn-primary text-xs" @click="saveEdit(c.id)">Save</button>
                <button class="btn-ghost text-xs" @click="cancelEdit">Cancel</button>
              </div>
            </div>

            <!-- Normal text -->
            <div v-else>
              <p class="mt-1 text-sm text-gray-700">{{ c.text }}</p>
              <p v-if="c.updatedAt" class="text-xs text-gray-400">
                Edited at {{ new Date(c.updatedAt).toLocaleString() }}
              </p>
            </div>

            <!-- Evidence link -->
            <a
              v-if="c.imageUrl"
              :href="c.imageUrl"
              target="_blank"
              rel="noopener"
              class="mt-2 inline-block text-xs text-blue-600 hover:underline"
            >
              🔗 Evidence
            </a>

            <!-- Actions (only for user comments) -->
            <div v-if="!c.fromSeed" class="flex gap-2 mt-2 text-xs text-gray-500">
              <button class="hover:underline" @click="startEdit(c)">Edit</button>
              <button class="hover:underline text-red-500" @click="deleteComment(c.id)">
                Delete
              </button>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useNewsStore } from "@/stores/newsStore";

const route = useRoute();
const newsStore = useNewsStore();
const id = Number(route.params.id);

const text = ref("");
const url = ref("");
const editingId = ref<number | null>(null);
const editText = ref("");
const showComments = ref(false); // 👈 toggle visibility

// All comments (seed + user)
const comments = computed(() => newsStore.commentsFor(id));

// Reset form
function resetForm() {
  text.value = "";
  url.value = "";
}

// Add new comment
function onSubmit() {
  newsStore.addComment(id, text.value, url.value);
  resetForm();
  showComments.value = true; // 👈 auto-open after posting
}

// Edit helpers
function startEdit(c: any) {
  editingId.value = c.id;
  editText.value = c.text;
}
function cancelEdit() {
  editingId.value = null;
  editText.value = "";
}
function saveEdit(commentId: number) {
  if (editText.value.trim()) {
    newsStore.editComment(id, commentId, editText.value.trim());
    cancelEdit();
  }
}

// Delete comment
function deleteComment(commentId: number) {
  newsStore.deleteComment(id, commentId);
}
</script>
