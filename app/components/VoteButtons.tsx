'use client';

import { useState } from 'react';
import { submitVote } from '@/app/actions/votes';

interface VoteButtonsProps {
  captionId: string;
  userId: string;
}

export default function VoteButtons({ captionId, userId }: VoteButtonsProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [message, setMessage] = useState('');

  const handleVote = async (voteValue: number) => {
    setIsVoting(true);
    setMessage('');
    
    const result = await submitVote(captionId, voteValue);
    
    if (result.error) {
      setMessage(result.error);
    } else {
      setMessage(voteValue === 1 ? '👍 Upvoted!' : '👎 Downvoted!');
    }
    
    setIsVoting(false);
    
    // Clear message after 2 seconds
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-2">
        <button
          onClick={() => handleVote(1)}
          disabled={isVoting}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Upvote"
        >
          👍
        </button>
        <button
          onClick={() => handleVote(-1)}
          disabled={isVoting}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Downvote"
        >
          👎
        </button>
      </div>
      {message && (
        <span className="text-xs text-zinc-600 font-medium">{message}</span>
      )}
    </div>
  );
}
