'use client';

import { useEffect, useState } from 'react';
import { Comment } from '@/components/Comment';
import { CommentForm } from '@/components/CommentForm';
import { Comment as CommentType } from '@/lib/types';
import { nanoid } from 'nanoid';

interface ApiError {
  error: string;
  details?: string;
  envCheck?: {
    hasUrl: boolean;
    hasToken: boolean;
    urlFormat: boolean;
    tokenLength: number;
  };
}

export default function CommunityPage() {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [anonymousId, setAnonymousId] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    // Get or create anonymous ID
    const storedId = localStorage.getItem('anonymousId');
    if (storedId) {
      setAnonymousId(storedId);
    } else {
      const newId = nanoid();
      localStorage.setItem('anonymousId', newId);
      setAnonymousId(newId);
    }

    // Fetch comments
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/community/comments');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(JSON.stringify(data));
      }
      
      setComments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      let errorData: ApiError;
      try {
        errorData = error instanceof Error ? JSON.parse(error.message) : { error: 'Unknown error' };
      } catch {
        errorData = { error: error instanceof Error ? error.message : 'Unknown error' };
      }
      setError(errorData);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (content: string) => {
    try {
      setError(null);
      const response = await fetch('/api/community/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          anonymousId,
          parentId: replyingTo,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(JSON.stringify(data));
      }

      await fetchComments();
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to post comment:', error);
      let errorData: ApiError;
      try {
        errorData = error instanceof Error ? JSON.parse(error.message) : { error: 'Unknown error' };
      } catch {
        errorData = { error: error instanceof Error ? error.message : 'Unknown error' };
      }
      setError(errorData);
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Debug log
  console.log('Comments from API:', comments);

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-700 mt-1">{error.error}</p>
          {error.details && (
            <p className="text-red-600 text-sm mt-2">{error.details}</p>
          )}
          {error.envCheck && (
            <div className="mt-4 p-3 bg-red-100 rounded-md">
              <h4 className="text-red-800 font-medium mb-2">Environment Check:</h4>
              <ul className="text-red-700 text-sm space-y-1">
                <li>Redis URL configured: {error.envCheck.hasUrl ? '✅' : '❌'}</li>
                <li>Redis Token configured: {error.envCheck.hasToken ? '✅' : '❌'}</li>
                <li>URL format correct: {error.envCheck.urlFormat ? '✅' : '❌'}</li>
                <li>Token length: {error.envCheck.tokenLength || 0}</li>
              </ul>
            </div>
          )}
          <button
            onClick={() => {
              setError(null);
              fetchComments();
            }}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-6">Community</h1>
      
      <div className="mb-8">
        <CommentForm
          onSubmit={handleSubmit}
          parentId={replyingTo || undefined}
          onCancel={replyingTo ? () => setReplyingTo(null) : undefined}
        />
      </div>

      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center">No comments yet. Be the first to comment!</p>
        ) : (
          comments
            .filter(comment => !comment.parentId || comment.parentId === null || comment.parentId === '')
            .map(comment => (
              <div key={comment.id}>
                <Comment
                  comment={comment}
                  onReply={setReplyingTo}
                />
                {comments
                  .filter(reply => reply.parentId === comment.id)
                  .map(reply => (
                    <div key={reply.id} className="ml-12">
                      <Comment
                        comment={reply}
                        onReply={setReplyingTo}
                      />
                    </div>
                  ))}
              </div>
            ))
        )}
      </div>
    </div>
  );
} 