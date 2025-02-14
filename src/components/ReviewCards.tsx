import React, { useState } from 'react';
import { Star, Loader2, Plus } from 'lucide-react';
import { Button } from './ui/Button';
import ReviewPopupModal from './ReviewPopupModal';

interface Review {
  id: string;
  rating: number;
  title: string;
  content: string;
  created_at: string;
  responses?: Record<string, any>;
  profile?: {
    position?: string;
    company_size?: string;
    industry?: string;
  };
}

interface ReviewCardsProps {
  reviews: Review[];
  onLoadMore: () => void;
  hasMore: boolean;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('pl-PL', { month: 'long' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`w-8 h-8 inline-flex items-center justify-center text-2xl ${
            star <= fullStars || (star === Math.ceil(rating) && hasHalfStar)
              ? 'text-[#2c3b67]'
              : 'text-gray-200'
          }`}
        >
          <Star className="w-6 h-6" fill={star <= fullStars ? 'currentColor' : 'none'} />
        </span>
      ))}
    </div>
  );
};

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="bg-white rounded-lg p-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowModal(true)}>
        <div className="flex justify-between items-start mb-4">
          <StarRating rating={review.rating} />
          <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
        </div>
        
        <h3 className="text-lg font-semibold text-[#2c3b67] mb-3">{review.title}</h3>
        
        <p className="text-gray-600 mb-4">
          {review.content.length > 300
            ? `${review.content.substring(0, 300)}...`
            : review.content}
        </p>


        {review.content.length > 300 && (
          <Button
            variant="secondary"
            onClick={() => setShowModal(true)}
            className="w-full mb-3"
          >
            Zobacz pełną opinię
          </Button>
        )}

        {(review.profile?.position || review.profile?.company_size || review.profile?.industry) && (
          <div className="text-sm text-gray-500 grid grid-cols-3 gap-4 border-t pt-3">
            {review.profile?.position && (
              <div className="flex flex-col">
                <span className="font-medium mb-1">Oceniający:</span>
                <span className="text-gray-600">{review.profile.position}</span>
              </div>
            )}
            {review.profile?.company_size && (
              <div className="flex flex-col">
                <span className="font-medium mb-1">Wielkość firmy:</span>
                <span className="text-gray-600">{review.profile.company_size}</span>
              </div>
            )}
            {review.profile?.industry && (
              <div className="flex flex-col">
                <span className="font-medium mb-1">Branża:</span>
                <span className="text-gray-600">{review.profile.industry}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <ReviewPopupModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        review={review}
      />
    </>
  );
};

const ReviewCards: React.FC<ReviewCardsProps> = ({ reviews, onLoadMore, hasMore }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadMore = () => {
    setIsLoading(true);
    onLoadMore();
    setTimeout(() => {
      setIsLoading(false);
    }, 4000);
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold text-[#2c3b67] mb-6">Opinie użytkowników</h2>
      
      <div className="grid grid-cols-2 gap-6">
        {reviews.map((review) => (
          <ReviewCard 
            key={review.id} 
            review={review} 
          />
        ))}
      </div>

      <div className="flex justify-center mt-8">
        {hasMore ? (
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
                Załaduj więcej recenzji
              </>
            )}
          </Button>
        ) : reviews.length > 0 && (
          <p className="text-gray-500 text-sm">
            To wszystkie recenzje dla tego systemu
          </p>
        )}
      </div>
    </div>
  );
};

export default ReviewCards;
