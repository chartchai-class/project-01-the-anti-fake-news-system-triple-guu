<template>
  <article class="card overflow-hidden" :aria-labelledby="`title-${item.id}`">
    <!-- 🖼️ News Image -->
    <img
      :src="item.imageUrl || item.image || '/default.jpg'"
      :alt="item.topic"
      loading="lazy"
      class="h-44 w-full object-cover"
    />

    <div class="p-4 flex flex-col gap-3">
      <!-- 📰 Title & Status -->
      <div class="flex items-center justify-between">
        <h3 :id="`title-${item.id}`" class="text-lg font-semibold line-clamp-1">
          {{ item.topic }}
        </h3>

        <span
          :class="{
            'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700': status === 'fake',
            'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700': status === 'non-fake',
            'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700': status === 'neutral'
          }"
        >
          {{ statusLabel }}
        </span>
      </div>

      <!-- 🧾 Short Description -->
      <p class="text-sm text-gray-600 line-clamp-2">{{ item.short }}</p>

      <!-- 👤 Reporter + Date -->
      <p class="text-xs text-gray-500">
        By {{ item.reporter || "Unknown" }} · {{ formatDate(item.date || item.reportedAt) }}
      </p>

      <!-- 👍 Voting + Buttons -->
      <div class="flex items-center justify-between pt-2">
        <div class="flex items-center gap-3">
          <button @click.stop="vote(1)" class="text-sm hover:text-blue-600 transition">
            👍 {{ votes.up }}
          </button>
          <button @click.stop="vote(-1)" class="text-sm hover:text-blue-600 transition">
            👎 {{ votes.down }}
          </button>
        </div>

        <div class="flex items-center gap-2">
          <RouterLink
            :to="`/news/${item.id}`"
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg
                   bg-blue-600 text-white text-sm font-medium shadow-sm
                   hover:bg-blue-700 active:bg-blue-800 transition"
            :aria-label="`View details for ${item.topic}`"
          >
            Details →
          </RouterLink>

          <!-- 🔗 Share -->
          <button
            @click.stop="shareNews"
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg
                   bg-slate-200 text-slate-700 text-sm font-medium shadow-sm
                   hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition"
          >
            🔗 Share
          </button>
        </div>
      </div>

      <!-- 💬 Comments -->
      <div class="mt-3 border-t pt-2">
        <button
          @click="toggleComments"
          class="text-xs text-blue-600 hover:underline mb-2"
        >
          {{ showComments ? 'Hide comments' : 'View comments (' + ((typeof item.commentCount === 'number' ? item.commentCount : comments.length)) + ')' }}
        </button>

        <div v-if="showComments">
          <!-- ✏️ Add Comment -->
          <form @submit.prevent="addNewComment" class="flex flex-col gap-2 mb-2 relative">
            <div class="relative">
              <textarea
                v-model="newComment"
                placeholder="Write a comment..."
                class="border p-2 w-full rounded text-sm resize-none pr-10"
                rows="2"
              ></textarea>

              <button
                type="button"
                @click="showEmoji = !showEmoji"
                class="absolute right-2 bottom-2 text-lg"
              >
                😊
              </button>

              <emoji-picker
                v-if="showEmoji"
                class="absolute bottom-12 right-0 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-2"
                @emoji-click="addEmoji"
              ></emoji-picker>
            </div>

            <button type="submit" class="btn-primary text-sm self-end">Post</button>
          </form>

          <!-- 💭 Comment List -->
          <ul v-if="comments.length" class="space-y-2 max-h-40 overflow-y-auto">
            <li v-for="c in comments" :key="c.id" class="comment-card">
              <div v-if="editingId === c.id">
                <textarea v-model="editText" rows="2" class="w-full border rounded p-1"></textarea>
                <div class="flex gap-2 mt-1 text-xs">
                  <button class="comment-save" @click="saveEdit(c.id)">Save</button>
                  <button class="comment-cancel" @click="cancelEdit">Cancel</button>
                </div>
              </div>

              <div v-else>
                <p class="comment-text">{{ c.text }}</p>
                <span class="comment-meta">· {{ formatDateTime(c.createdAt) }}</span>
                <p v-if="c.updatedAt" class="comment-meta">
                  (edited {{ formatDateTime(c.updatedAt) }})
                </p>

                <div v-if="!c.fromSeed" class="flex gap-3 mt-1 text-xs">
                  <button @click="startEdit(c)" class="comment-edit">Edit</button>
                  <button @click="deleteComment(c.id)" class="hover:underline comment-delete">
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
import "emoji-picker-element";

const props = defineProps<{ item: any }>();
const newsStore = useNewsStore();

const status = computed(() => newsStore.statusFor(props.item.id));
const votes = computed(() => newsStore.votesFor(props.item));

const statusLabel = computed(() =>
  status.value === "fake"
    ? "Fake"
    : status.value === "non-fake"
    ? "Non-fake"
    : "Neutral"
);

// ✅ Date formatter (fix Invalid Date)
function formatDate(value: any) {
  if (!value) return "Unknown Date";
  const date = new Date(value);
  if (isNaN(date)) return "Unknown Date";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ✅ Time formatter for comments
function formatDateTime(value: any) {
  const date = new Date(value);
  if (isNaN(date)) return "Unknown time";
  return date.toLocaleString();
}

// 🗳️ Voting
async function vote(dir: 1 | -1) {
  await newsStore.vote(props.item.id, dir);
  await newsStore.fetchNews();
}

// 💬 Comments
const newComment = ref("");
const comments = computed(() => newsStore.commentsFor(props.item.id));
const showComments = ref(false);
const showEmoji = ref(false);

async function toggleComments() {
  showComments.value = !showComments.value;
  if (showComments.value) {
    await newsStore.fetchComments(props.item.id);
  }
}

async function addNewComment() {
  if (newComment.value.trim()) {
    await newsStore.addComment(props.item.id, newComment.value.trim());
    await newsStore.fetchComments(props.item.id); // Refresh comments after adding
    newComment.value = "";
    showComments.value = true;
  }
}

function addEmoji(e: any) {
  newComment.value += e.detail.unicode;
  showEmoji.value = false;
}

// ✏️ Edit / Delete
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
async function saveEdit(commentId: number) {
  if (editText.value.trim()) {
    await newsStore.editComment(props.item.id, commentId, editText.value.trim());
    cancelEdit();
  }
}
async function deleteComment(commentId: number) {
  await newsStore.deleteComment(props.item.id, commentId);
}

// 🔗 Share
function shareNews() {
  const shareData = {
    title: props.item.topic,
    text: `Check out this article: ${props.item.topic}`,
    url: window.location.origin + `/news/${props.item.id}`,
  };

  if (navigator.share) {
    navigator.share(shareData).catch(() => {});
  } else {
    navigator.clipboard.writeText(shareData.url);
    alert("✅ Link copied to clipboard!");
  }
}
</script>

<style scoped>
emoji-picker {
  width: 250px;
  height: 300px;
}
</style>
