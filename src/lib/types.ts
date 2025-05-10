export interface SearchResult {
  title: string;
  url: string;
  displayUrl: string;
  snippet: string;
  summary: string;
}

export interface Comment {
  id: string;
  content: string;
  timestamp: number;
  parentId?: string;
  anonymousId: string;
}

export interface CommentWithReplies extends Comment {
  replies: CommentWithReplies[];
} 