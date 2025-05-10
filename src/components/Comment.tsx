import { Comment as CommentType } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface CommentProps {
  comment: CommentType;
  onReply: (parentId: string) => void;
}

export function Comment({ comment, onReply }: CommentProps) {
  return (
    <div className="border-l-2 border-gray-200 pl-4 py-2">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Anonymous {comment.anonymousId.slice(0, 4)}</span>
        <span>•</span>
        <span>{formatDistanceToNow(comment.timestamp)} ago</span>
      </div>
      <p className="mt-1 text-gray-900">{comment.content}</p>
      <button
        onClick={() => onReply(comment.id)}
        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
      >
        Reply
      </button>
    </div>
  );
} 