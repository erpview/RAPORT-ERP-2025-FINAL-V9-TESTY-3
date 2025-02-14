import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Plus, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';

interface Feedback {
  content: string;
  created_at: string;
}

interface LikesAndDislikesProps {
  likes: Feedback[];
  dislikes: Feedback[];
  onLoadMore: () => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('pl-PL', { month: 'long' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

const FeedbackCard: React.FC<{ content: string; date: string }> = ({ content, date }) => (
  <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
    <p className="text-[#2c3b67] text-sm mb-2 font-semibold">{content}</p>
    <p className="text-gray-500 text-xs">{formatDate(date)}</p>
  </div>
);

const LikesAndDislikes: React.FC<LikesAndDislikesProps> = ({ likes, dislikes, onLoadMore }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadMore = () => {
    setIsLoading(true);
    onLoadMore();
    setTimeout(() => {
      setIsLoading(false);
    }, 4000); // 4 seconds
  };
  return (
    <div className="sf-card p-6 bg-white mt-6">
      <div className="grid grid-cols-2 gap-8">
        {/* Likes Column */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <ThumbsUp className="w-6 h-6 text-[#2c3b67]" />
            <h2 className="text-[#2c3b67] text-xl font-semibold">W systemie lubię</h2>
          </div>
          <div className="space-y-4">
            {likes.map((like, index) => (
              <FeedbackCard 
                key={index} 
                content={like.content} 
                date={like.created_at} 
              />
            ))}
          </div>
        </div>

        {/* Dislikes Column */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <ThumbsDown className="w-6 h-6 text-[#2c3b67]" />
            <h2 className="text-[#2c3b67] text-xl font-semibold">W systemie nie lubię</h2>
          </div>
          <div className="space-y-4">
            {dislikes.map((dislike, index) => (
              <FeedbackCard 
                key={index} 
                content={dislike.content} 
                date={dislike.created_at} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Load More Button */}
      <div className="flex justify-center mt-8">
        <Button
          onClick={handleLoadMore}
          disabled={isLoading}
          variant="secondary"
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Ładowanie...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Załaduj więcej zalet i wad
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default LikesAndDislikes;
