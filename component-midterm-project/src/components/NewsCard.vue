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

        <span
          :class="{
            'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700': status === 'fake',
            'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700': status === 'non-fake',
            'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700': status === 'neutral'
          }"
        >
          {{ status === 'fake' ? 'Fake' : status === 'non-fake' ? 'Non-fake' : 'Neutral' }}
        </span>
      </div>

      <p class="text-sm text-gray-600 line-clamp-2">{{ item.short }}</p>

      <p class="text-xs text-gray-500">
        By {{ item.reporter }} · {{ new Date(item.reportedAt).toLocaleDateString() }}
      </p>

      <div class="flex items-center justify-between pt-2">
        <div class="flex items-center gap-3">
          <button @click.stop="vote(1)" class="text-sm hover:underline">
            👍 {{ votes.up }}
          </button>
          <button @click.stop="vote(-1)" class="text-sm hover:underline">
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

          <!-- 🔗 Share Button -->
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

      <!-- 💬 Comments Section -->
      <div class="mt-3 border-t pt-2">
        <button
          @click="toggleComments"
          class="text-xs text-blue-600 hover:underline mb-2"
        >
          {{ showComments ? 'Hide comments' : 'View comments (' + comments.length + ')' }}
        </button>

        <div v-if="showComments">
          <!-- ✅ Comment Form with Emoji Picker -->
          <form @submit.prevent="addNewComment" class="flex flex-col gap-2 mb-2 relative">
            <div class="relative">
              <textarea
                v-model="newComment"
                placeholder="Write a comment..."
                class="border p-2 w-full rounded text-sm resize-none pr-10"
                rows="2"
              ></textarea>

              <!-- 😊 Emoji Toggle Button -->
              <button
                type="button"
                @click="showEmoji = !showEmoji"
                class="absolute right-2 bottom-2 text-lg"
              >
                😊
              </button>

              <!-- 🎨 Emoji Picker Popup -->
              <emoji-picker
                v-if="showEmoji"
                class="absolute bottom-12 right-0 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-2"
                @emoji-click="addEmoji"
              ></emoji-picker>
            </div>

            <button type="submit" class="btn-primary text-sm self-end">Post</button>
          </form>

          <!-- ✅ Comments List -->
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
                <span class="comment-meta">· {{ new Date(c.createdAt).toLocaleString() }}</span>
                <p v-if="c.updatedAt" class="comment-meta">
                  (edited {{ new Date(c.updatedAt).toLocaleString() }})
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
import { RouterLink } from 'vue-router';
import { useNewsStore } from '@/stores/newsStore';
import { computed, ref } from 'vue';
import 'emoji-picker-element';

const props = defineProps<{ item: any }>();
const newsStore = useNewsStore();

const status = computed(() => newsStore.statusFor(props.item.id));
const votes = computed(() => newsStore.votesFor(props.item.id));

async function vote(dir: 1 | -1) {
  await newsStore.vote(props.item.id, dir);
}

const newComment = ref('');
const comments = computed(() => newsStore.commentsFor(props.item.id));
const showComments = ref(false);
const showEmoji = ref(false); // ✅ controls emoji picker

function toggleComments() {
  showComments.value = !showComments.value;
}

async function addNewComment() {
  if (newComment.value.trim()) {
    await newsStore.addComment(props.item.id, newComment.value.trim());
    newComment.value = '';
    showComments.value = true;
  }
}

function addEmoji(e: any) {
  newComment.value += e.detail.unicode;
  showEmoji.value = false;
}

const editingId = ref<number | null>(null);
const editText = ref('');

function startEdit(c: any) {
  editingId.value = c.id;
  editText.value = c.text;
}
function cancelEdit() {
  editingId.value = null;
  editText.value = '';
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

// ✅ Share logic
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
    alert('✅ Link copied to clipboard!');
  }
}
</script>

<style scoped>
emoji-picker {
  width: 250px;
  height: 300px;
}
</style>
