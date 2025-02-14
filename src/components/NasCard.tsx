import React from 'react';
import { Scale } from 'lucide-react';

interface NasCardProps {
  nasScore: number;
  totalReviews: number;
  isLoading?: boolean;
  error?: string | null;
}

const NasCard: React.FC<NasCardProps> = ({ nasScore, totalReviews, isLoading, error }) => {
  const numbers = Array.from({ length: 11 }, (_, i) => i);
  const selectedNumber = Math.round(nasScore);

  return (
    <div className="sf-card p-6 bg-white mt-6">
      <div className="flex items-center gap-2 mb-6">
        <Scale className="w-6 h-6 text-[#2c3b67]" />
        <h2 className="text-[#2c3b67] text-xl font-semibold">
          Net Promoter Score
          <span className="text-[#86868b] text-sm font-normal ml-2">
            (na podstawie {totalReviews} {totalReviews === 1 ? 'oceny' : 
              totalReviews % 10 >= 2 && totalReviews % 10 <= 4 && (totalReviews % 100 < 10 || totalReviews % 100 >= 20) ? 'ocen' : 'oceny'})
          </span>
        </h2>
      </div>

      {error ? (
        <p className="text-[#FF3B30] text-center">{error}</p>
      ) : isLoading ? (
        <div className="flex items-center justify-center gap-3 text-[#86868b]">
          <div className="spinner" />
          <p className="text-[17px]">Ładowanie wyniku...</p>
        </div>
      ) : (
        <div className="space-y-8">

          <div className="space-y-3">
            <div className="flex justify-between">
              {numbers.map((number) => (
                <div
                  key={number}
                  className={`w-[72px] h-[72px] flex items-center justify-center rounded-lg border text-lg ${
                    number === selectedNumber
                      ? 'bg-[#2c3b67] text-white border-[#2c3b67] font-medium'
                      : 'bg-white border-[#E5E7EB] text-[#2c3b67] hover:border-[#2c3b67] transition-colors'
                  }`}
                >
                  {number}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[15px] text-[#2c3b67] font-medium">
              <span>Nie polecam</span>
              <span>Polecam</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NasCard;
