import { fetchCommentsApi, addCommentApi } from '@/services/commentApi'
import { ref } from 'vue'

export type CommentItem = {
  id: number | string
  newsId: number | string
  author: string
  text: string
  createdAt: string
}

const commentMap = ref<Record<string, CommentItem[]>>({})
const apiError = ref<string | null>(null)

// ✅ Fetch comments per newsId
export async function fetchComments(newsId: number | string) {
  try {
    const res = await fetchCommentsApi(newsId)
    const mapped = (res || []).map((c: any) => ({
      id: c.id,
      newsId,
      author: c.userId ? `User ${c.userId}` : 'Unknown',
      text: c.content,
      createdAt: c.dateTime
    }))
    commentMap.value[newsId] = mapped
  } catch (e: unknown) {
    apiError.value = (e as Error)?.message || String(e)
  }
}

// ✅ Add new comment
export async function addComment(newsId: number | string, text: string) {
  try {
    const c = await addCommentApi(newsId, text)
    if (!commentMap.value[newsId]) commentMap.value[newsId] = []
    const newComment: CommentItem = {
      id: c.id,
      newsId,
      author: c.userId ? `User ${c.userId}` : 'Unknown',
      text: c.content,
      createdAt: c.dateTime
    }
    commentMap.value[newsId].push(newComment)
    return newComment
  } catch (e: unknown) {
    apiError.value = (e as Error)?.message || String(e)
    throw e
  }
}

// ✅ Get comments for specific news
export function commentsFor(newsId: number | string) {
  return commentMap.value[newsId] || []
}

export { commentMap as comments, apiError }
