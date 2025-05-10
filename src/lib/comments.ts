import { redis } from './redis';
import { Comment, CommentWithReplies } from './types';
import { nanoid } from 'nanoid';

const COMMENTS_KEY = 'community:comments';

export async function addComment(content: string, anonymousId: string, parentId?: string): Promise<Comment> {
  try {
    const comment: Comment = {
      id: nanoid(),
      content,
      timestamp: Date.now(),
      parentId,
      anonymousId,
    };

    await redis.hset(COMMENTS_KEY, { [comment.id]: JSON.stringify(comment) });
    return comment;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw new Error('Failed to add comment to Redis');
  }
}

export async function getComments(): Promise<Comment[]> {
  try {
    const comments = await redis.hgetall(COMMENTS_KEY);
    console.log('Raw comments from Redis:', comments);
    if (!comments) {
      return [];
    }
    return Object.values(comments).map(comment => {
      if (typeof comment === 'string') {
        try {
          return JSON.parse(comment);
        } catch (error) {
          console.error('Error parsing comment:', error);
          return null;
        }
      } else if (typeof comment === 'object' && comment !== null) {
        return comment as Comment;
      } else {
        return null;
      }
    }).filter((comment): comment is Comment => comment !== null);
  } catch (error) {
    console.error('Error getting comments:', error);
    throw new Error('Failed to fetch comments from Redis');
  }
}

export async function getCommentThreads(): Promise<CommentWithReplies[]> {
  const comments = await getComments();
  const commentMap = new Map<string, CommentWithReplies>();
  const threads: CommentWithReplies[] = [];

  // First pass: create map of all comments
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Second pass: organize into threads
  comments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment.id)!;
    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId);
      if (parent) {
        parent.replies.push(commentWithReplies);
      }
    } else {
      threads.push(commentWithReplies);
    }
  });

  return threads;
} 