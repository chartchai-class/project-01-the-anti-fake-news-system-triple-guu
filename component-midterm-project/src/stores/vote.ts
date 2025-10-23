
import { voteApi } from '@/services/voteApi'

export type VoteItem = {
  id?: number | string;
  newsId: number | string;
  dir?: number;
  userId?: string;
}


export async function vote(newsId: number | string, dir: 1 | -1) {
  try {
    await voteApi(newsId, dir)
  } catch (e: unknown) {
    throw e
  }
}

// For now, votes are counted from news item fields, so this is a placeholder
export function votesFor(newsItem: any) {
  return {
    up: newsItem?.notFakeCount || 0,
    down: newsItem?.fakeCount || 0
  }
}
