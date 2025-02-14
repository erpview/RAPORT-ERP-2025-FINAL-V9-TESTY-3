import React from 'react';
import { Users } from 'lucide-react';

interface CategoryRating {
  name: string;
  value: number;
}

interface CategoryRatingsProps {
  ratings: CategoryRating[];
}

const CategoryRatings: React.FC<CategoryRatingsProps> = ({ ratings }) => {
  return (
    <div className="sf-card p-6 bg-white">
      <div className="flex items-center gap-3">
        <Users className="w-8 h-8 text-[#2c3b67]" />
        <h2 className="text-[#2c3b67] text-2xl font-bold">Doświadczenia klientów</h2>
      </div>
      <div className="pt-[82px] space-y-6">
        {ratings.map((rating, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="flex-1">
              <span className="text-[#2c3b67] text-[15px] font-medium">{rating.name}</span>
            </div>
            <div className="w-16 text-right">
              <span className="text-[#2c3b67] text-[15px] font-semibold">
                {rating.value.toFixed(1)}
              </span>
            </div>
            <div className="w-48 h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2c3b67] rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${(rating.value / 5) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryRatings;
