import { ref, computed, watch, onMounted } from 'vue'
import { defineStore } from 'pinia'
import { fetchNewsApi, createNewsApi } from '@/services/newsApi'
import { fetchCommentsApi, addCommentApi } from '@/services/commentApi'
import { vote, votesFor } from './vote'

// ------------------
// Types
// ------------------
type NewsItem = {
  id: number | string;
  topic: string;
  shortDetail?: string;
  fullDetail?: string;
  status?: string;
  reporterName?: string;
  dateTime?: string;
  imageUrl?: string;
  fakeCount?: number;
  notFakeCount?: number;
  reportedAt?: string;
  short?: string;
  full?: string;
  reporter?: string;
  date?: string;
}

export type CommentItem = {
  id: number | string;
  newsId: number | string;
  author: string;
  text: string;
  createdAt: string;
}

// ------------------
// Local storage helper
// ------------------
const ls = {
  get<T>(k: string, fallback: T): T {
    try {
      const v = localStorage.getItem(k)
      return v ? (JSON.parse(v) as T) : fallback
    } catch {
      return fallback
    }
  },
  set<T>(k: string, v: T) {
    try {
      localStorage.setItem(k, JSON.stringify(v))
    } catch {}
  }
}

function sortByReportedAtDesc(a: Partial<NewsItem>, b: Partial<NewsItem>) {
  const da = a.reportedAt ? +new Date(a.reportedAt) : 0
  const db = b.reportedAt ? +new Date(b.reportedAt) : 0
  return db - da
}

// ------------------
// Store Definition
// ------------------
export const useNewsStore = defineStore('news', () => {
  const news = ref<NewsItem[]>([])
  const comments = ref<CommentItem[]>([])
  const apiError = ref<string | null>(null)
  const readOnly = ref(false)

  // ------------------
  // NEWS
  // ------------------
  const filteredNews = computed(() => [...news.value].sort(sortByReportedAtDesc))

  const createNews = async (newsData: Partial<NewsItem>) => {
    try {
      const res = await createNewsApi(newsData)
      if (res && res.id) {
        news.value.unshift({
          ...res,
          topic: res.topic || '',
          short: res.shortDetail || '',
          full: res.fullDetail || '',
          status: res.status || '',
          reporter: res.reporterName || '',
          date: res.dateTime || '',
          imageUrl: res.imageUrl || '',
          reportedAt: res.dateTime || new Date().toISOString(),
          fakeCount: res.fakeCount,
          notFakeCount: res.notFakeCount
        })
      }
      return res
    } catch (e: unknown) {
      apiError.value = (e as Error)?.message || String(e)
      throw e
    }
  }

  async function fetchNews() {
    try {
      const res = await fetchNewsApi(100)
      const list = Array.isArray(res)
        ? res
        : (res && Array.isArray(res.content) ? res.content : [])
      news.value = list.map((x: NewsItem & { commentCount?: number }) => ({
        id: x.id,
        topic: x.topic || '',
        short: x.shortDetail || '',
        full: x.fullDetail || '',
        status: x.status ? x.status.toLowerCase() : '',
        reporter: x.reporterName || '',
        date: x.dateTime || '',
        imageUrl: x.imageUrl || '',
        reportedAt: x.dateTime || new Date().toISOString(),
        fakeCount: x.fakeCount,
        notFakeCount: x.notFakeCount,
        commentCount: x.commentCount // <-- map from backend
      }))
      apiError.value = null
      readOnly.value = false
    } catch (e: unknown) {
      apiError.value = (e as Error)?.message || String(e)
    }
  }

  function statusFor(newsId: number | string) {
  const item = news.value.find((n: NewsItem) => n.id === newsId);
  if (!item) return '';

  const s = (item.status || '').toString().toLowerCase().trim();

  // normalize backend variations
  if (['not_fake', 'not-fake', 'non-fake', 'true'].includes(s)) return 'non-fake';
  if (['fake', 'false'].includes(s)) return 'fake';
  return 'neutral';
}

  // ------------------
  // COMMENTS
  // ------------------
  async function fetchComments(newsId: number | string) {
    try {
      const res = await fetchCommentsApi(newsId)
      const mapped = (res || []).map((c: any) => ({
        id: c.id,
        newsId,
        author: c.userId ? `User ${c.userId}` : 'Unknown',
        text: c.content,
        createdAt: c.dateTime
      }))
      // remove old comments for this news
      comments.value = comments.value.filter(c => c.newsId !== newsId)
      comments.value.push(...mapped)
    } catch (e: unknown) {
      apiError.value = (e as Error)?.message || String(e)
    }
  }

  async function addComment(newsId: number | string, text: string) {
    try {
      const c = await addCommentApi(newsId, text)
      comments.value.push({
        id: c.id,
        newsId,
        author: c.userId ? `User ${c.userId}` : 'Unknown',
        text: c.content,
        createdAt: c.dateTime
      })
      // ❌ Don't re-fetch immediately — it may overwrite local data
    } catch (e: unknown) {
      apiError.value = (e as Error)?.message || String(e)
      throw e
    }
  }

  function commentsFor(newsId: number | string) {
    return comments.value.filter((c: CommentItem) => c.newsId === newsId)
  }

  // ------------------
  // Persist comments locally (optional)
  // ------------------
  onMounted(() => {
    const saved = ls.get<CommentItem[]>('comments', [])
    if (saved.length) comments.value = saved
  })
  watch(comments, v => ls.set('comments', v), { deep: true })

  // ------------------
  // RETURN
  // ------------------
  return {
    news, apiError, readOnly, filteredNews,
    fetchNews, createNews, statusFor,
    comments, fetchComments, addComment, commentsFor,
    vote, votesFor
  }
})
