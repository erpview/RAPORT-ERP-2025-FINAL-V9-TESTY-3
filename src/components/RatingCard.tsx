import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface RatingDistribution {
  '5': number;
  '4': number;
  '3': number;
  '2': number;
  '1': number;
}

interface RatingCardProps {
  averageRating: number;
  totalReviews: number;
  distribution: RatingDistribution;
}

const getReviewsText = (count: number): string => {
  if (count === 0) return 'ocen';
  if (count === 1) return 'ocena';

  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  // Special case for numbers ending in 12-14
  if (lastTwoDigits >= 12 && lastTwoDigits <= 14) {
    return 'ocen';
  }

  // For numbers ending in 2-4
  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'oceny';
  }

  // For all other cases (5-21, 25-31, etc)
  return 'ocen';
};

const RatingCard: React.FC<RatingCardProps> = ({ averageRating = 0, totalReviews = 0, distribution }) => {
  // Show full card even with no reviews
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i}
          className={`w-8 h-8 inline-flex items-center justify-center text-2xl ${i <= fullStars || (i === Math.ceil(rating) && hasHalfStar) ? 'text-[#2c3b67]' : 'text-gray-200'}`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const calculatePercentage = (count: number) => {
    if (totalReviews === 0) return '0';
    return ((count / totalReviews) * 100).toFixed(0);
  };

  return (
    <div className="sf-card p-6" data-testid="rating-card">
      <div className="flex items-start mb-6 gap-4">
        <div className="text-5xl font-bold text-[#1d1d1f]">{averageRating.toFixed(1)}</div>
        <div>
          <div className="flex mb-1">
            {renderStars(averageRating)}
          </div>
          <div className="text-[#86868b] text-[15px]">
            {totalReviews} {getReviewsText(totalReviews)}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-[17px] font-semibold mb-3 text-[#1d1d1f]">Rozkład ocen</h3>
        {[5, 4, 3, 2, 1].map((stars) => (
          <div key={stars} className="flex items-center">
            <div className="w-16 text-[15px] font-medium text-[#86868b] flex items-center gap-1">
              <span>{stars}</span>
              <span className="inline-flex items-center text-xl text-[#2c3b67]">★</span>
            </div>
            <div className="flex-1 h-2 mx-4 bg-[#E8E8ED] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2c3b67] rounded-full transition-all duration-300"
                style={{ width: `${calculatePercentage(distribution[stars as keyof RatingDistribution])}%` }}
              />
            </div>
            <div className="w-16 text-[15px] text-right text-[#86868b] font-medium">
              {calculatePercentage(distribution[stars as keyof RatingDistribution])}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingCard;
