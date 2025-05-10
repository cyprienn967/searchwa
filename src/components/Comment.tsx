import { Comment as CommentType } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface CommentProps {
  comment: CommentType;
  onReply: (parentId: string) => void;
}

export function Comment({ comment, onReply }: CommentProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4 w-full text-left">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Anonymous {comment.anonymousId.slice(0, 4)}</span>
        <span>•</span>
        <span>{formatDistanceToNow(comment.timestamp)} ago</span>
      </div>
      <p className="mt-1 text-gray-900 break-words whitespace-pre-line">{comment.content}</p>
      <button
        onClick={() => onReply(comment.id)}
        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
      >
        Reply
      </button>
    </div>
  );
} 