'use client';

import { useState, useEffect } from 'react';
import { submitVote, getUserVote } from '@/app/actions/votes';
import Image from 'next/image';

interface Caption {
  id: string;
  content: string;
  created_datetime_utc: string;
  image_id: string;
  images?: {
    id: string;
    url: string;
  };
}

interface CaptionCardProps {
  captions: Caption[];
  userId: string;
}

export default function CaptionCard({ captions, userId }: CaptionCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [userVote, setUserVote] = useState<number | null>(null);

  const currentCaption = captions[currentIndex];

  // Fetch user's existing vote when caption changes
  useEffect(() => {
    if (currentCaption?.id) {
      getUserVote(currentCaption.id).then(({ vote }) => setUserVote(vote));
    }
  }, [currentCaption?.id]);

  const moveToNext = () => {
    setCurrentIndex((prev) => (prev < captions.length - 1 ? prev + 1 : 0));
  };

  const handleVote = async (voteValue: -1 | 1) => {
    if (isProcessing || !currentCaption) return;

    setIsProcessing(true);
    setMessage('');

    const result = await submitVote(currentCaption.id, voteValue);

    if (result.error) {
      setMessage(result.error);
      setIsProcessing(false);
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    setUserVote(voteValue); // Update local state
    setMessage(voteValue === 1 ? '👍 Upvoted!' : '👎 Downvoted!');
    setTimeout(() => {
      moveToNext();
      setMessage('');
      setIsProcessing(false);
    }, 500);
  };

  const handleSkip = () => {
    setMessage('⏭️ Skipped');
    setTimeout(() => {
      moveToNext();
      setMessage('');
    }, 300);
  };

  if (!captions || captions.length === 0) {
    return (
      <div className="bg-white/90 rounded-3xl shadow-2xl p-12 text-center backdrop-blur">
        <p className="text-xl text-zinc-600">No captions available yet! 🎭</p>
        <p className="text-sm text-zinc-500 mt-2">Check back later for new captions to rate.</p>
      </div>
    );
  }

  if (!currentCaption) {
    return (
      <div className="bg-white/90 rounded-3xl shadow-2xl p-12 text-center backdrop-blur">
        <p className="text-xl text-zinc-600">Loading caption...</p>
      </div>
    );
  }

  return (
    <div className="relative pb-6">
      {/* Progress indicator */}
      <div className="mb-3 text-center">
        <span className="text-white text-sm font-semibold bg-black/30 px-4 py-2 rounded-full backdrop-blur">
          {currentIndex + 1} / {captions.length}
        </span>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Image section */}
        {currentCaption.images?.url && (
          <div className="relative w-full h-64 md:h-96 bg-gray-200">
            <Image
              src={currentCaption.images.url}
              alt="Caption image"
              fill
              className="object-contain"
              priority
            />
          </div>
        )}

        {/* Caption text */}
        <div className="p-6">
          <p className="text-xl text-zinc-800 font-medium mb-4 text-center leading-relaxed">
            "{currentCaption.content}"
          </p>

          {message && (
            <div className="text-center mb-4">
              <span className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">
                {message}
              </span>
            </div>
          )}

          <div className="flex justify-center items-center gap-3 mt-4">
            <button
              onClick={() => handleVote(-1)}
              disabled={isProcessing}
              className={`${
                userVote === -1 ? 'ring-4 ring-red-300' : ''
              } bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg text-xl`}
              title="Downvote"
            >
              👎
            </button>

            <button
              onClick={handleSkip}
              disabled={isProcessing}
              className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-xl transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              title="Skip"
            >
              ⏭️
            </button>

            <button
              onClick={() => handleVote(1)}
              disabled={isProcessing}
              className={`${
                userVote === 1 ? 'ring-4 ring-green-300' : ''
              } bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg text-xl`}
              title="Upvote"
            >
              👍
            </button>
          </div>

          <p className="text-xs text-zinc-400 text-center mt-4">
            Posted {new Date(currentCaption.created_datetime_utc).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
