<template>
  <article class="card overflow-hidden" :aria-labelledby="`title-${item.id}`">
    <img
      :src="item.image || '/default.jpg'"
      :alt="item.topic"
      loading="lazy"
      class="h-44 w-full object-cover"
    />
    <div class="p-4 flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <h3 :id="`title-${item.id}`" class="text-lg font-semibold line-clamp-1">
          {{ item.topic }}
        </h3>
        <span :class="item.status === 'fake' ? 'badge-fake' : 'badge-real'">
          {{ item.status === 'fake' ? 'Fake' : 'Non-fake' }}
        </span>
      </div>

      <p class="text-sm text-gray-600 line-clamp-2">{{ item.short }}</p>

      <p class="text-xs text-gray-500">
        By {{ item.reporter }} · {{ new Date(item.reportedAt).toLocaleDateString() }}
      </p>

      <!-- ✅ Votes with buttons -->
      <div class="flex items-center justify-between pt-2">
        <div class="flex items-center gap-3">
          <button @click="vote(1)" class="text-sm hover:underline">👍 {{ votes.up }}</button>
          <button @click="vote(-1)" class="text-sm hover:underline">👎 {{ votes.down }}</button>
        </div>
        <RouterLink
          :to="`/news/${item.id}`"
          class="btn-primary text-sm"
          :aria-label="`View details for ${item.topic}`"
        >
          Details
        </RouterLink>
      </div>

      <!-- ✅ Comments Section -->
      <div class="mt-3 border-t pt-2">
        <!-- Toggle button -->
        <button
          @click="toggleComments"
          class="text-xs text-blue-600 hover:underline mb-2"
        >
          {{ showComments ? "Hide comments" : "View comments (" + comments.length + ")" }}
        </button>

        <!-- Only show when toggled -->
        <div v-if="showComments">
          <!-- Form -->
          <form @submit.prevent="addNewComment" class="flex gap-2 mb-2">
            <input
              v-model="newComment"
              placeholder="Write a comment..."
              class="border p-1 flex-1 rounded text-sm"
            />
            <button type="submit" class="btn-primary text-sm">Post</button>
          </form>

          <!-- List -->
          <ul v-if="comments.length" class="space-y-2 max-h-40 overflow-y-auto">
            <li
              v-for="c in comments"
              :key="c.id"
              class="text-sm bg-gray-100 p-2 rounded"
            >
              <!-- If editing -->
              <div v-if="editingId === c.id">
                <textarea
                  v-model="editText"
                  rows="2"
                  class="w-full border rounded p-1"
                ></textarea>
                <div class="flex gap-2 mt-1 text-xs">
                  <button class="btn-primary px-2" @click="saveEdit(c.id)">Save</button>
                  <button class="btn-ghost px-2" @click="cancelEdit">Cancel</button>
                </div>
              </div>

              <!-- Normal display -->
              <div v-else>
                <p>{{ c.text }}</p>
                <span class="text-xs text-gray-500">
                  · {{ new Date(c.createdAt).toLocaleString() }}
                </span>
                <p v-if="c.updatedAt" class="text-xs text-gray-400">
                  (edited {{ new Date(c.updatedAt).toLocaleString() }})
                </p>

                <!-- Actions only for user-added comments -->
                <div v-if="!c.fromSeed" class="flex gap-3 mt-1 text-xs text-gray-500">
                  <button @click="startEdit(c)" class="hover:underline">Edit</button>
                  <button @click="deleteComment(c.id)" class="hover:underline text-red-500">
                    Delete
                  </button>
                </div>
              </div>
            </li>
          </ul>

          <p v-else class="text-xs text-gray-500">No comments yet.</p>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useNewsStore } from "@/stores/newsStore";
import { computed, ref } from "vue";

const props = defineProps<{ item: any }>();
const newsStore = useNewsStore();

// votes
const votes = computed(() => newsStore.votesFor(props.item.id));
function vote(dir: 1 | -1) {
  newsStore.vote(props.item.id, dir);
}

// ✅ comments
const newComment = ref("");
const comments = computed(() => newsStore.commentsFor(props.item.id));
const showComments = ref(false);

function toggleComments() {
  showComments.value = !showComments.value;
}

function addNewComment() {
  if (newComment.value.trim()) {
    newsStore.addComment(props.item.id, newComment.value.trim());
    newComment.value = "";
    showComments.value = true; // auto-open after posting
  }
}

// ✅ edit/delete states
const editingId = ref<number | null>(null);
const editText = ref("");

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
    newsStore.editComment(props.item.id, commentId, editText.value.trim());
    cancelEdit();
  }
}
function deleteComment(commentId: number) {
  newsStore.deleteComment(props.item.id, commentId);
}
</script>
