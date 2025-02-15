import React from 'react';
import { X, Star } from 'lucide-react';
import { Modal } from './ui/Modal';
import { StarRating } from './ReviewCards';
import { cn } from '../utils/cn';
import { LinkedInAuthButton } from './LinkedInAuthButton';

interface ReviewPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: {
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
  };
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('pl-PL', { month: 'long' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

const ReviewPopupModal: React.FC<ReviewPopupModalProps> = ({ isOpen, onClose, review }) => {
  const renderResponseSection = (sectionData: Record<string, any>, sectionTitle: string) => {
    if (!sectionData) return null;

    const isRatingValue = (value: any): boolean => {
      const num = Number(value);
      return !isNaN(num) && num >= 1 && num <= 5;
    };

    const isNPSValue = (value: any): boolean => {
      const num = Number(value);
      return !isNaN(num) && num >= 0 && num <= 10;
    };

    const getNPSColor = (value: number): string => {
      return 'bg-[#2c3b67]';
    };

    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-8 bg-[#2c3b67] rounded"></div>
          <h3 className="text-xl font-semibold text-[#2c3b67]">{sectionTitle}</h3>
        </div>
        <div className="space-y-6">
          {Object.entries(sectionData).map(([key, value], index) => {
            if (!value || value === '') return null;
            
            const showStars = isRatingValue(value);
            const showNPS = isNPSValue(value);
            const rating = showStars ? Number(value) : 0;
            const npsValue = showNPS ? Number(value) : -1;

            return (
              <div key={`${sectionTitle}-${key}-${index}`} className="bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
                <div className="text-[15px] font-semibold text-[#2c3b67] mb-2">{key}</div>
                {showStars ? (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            'w-5 h-5',
                            star <= rating ? 'text-[#2c3b67] fill-[#2c3b67]' : 'text-gray-200'
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-[#2c3b67]">{rating}/5</span>
                  </div>
                ) : showNPS ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-11 gap-1 w-full">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <div
                          key={num}
                          className={cn(
                            'aspect-square flex items-center justify-center rounded text-sm font-medium transition-colors border',
                            num === npsValue
                              ? 'bg-[#2c3b67] text-white border-[#2c3b67]'
                              : 'bg-white text-[#2c3b67] border-[#2c3b67] border-opacity-20'
                          )}
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-sm text-[#2c3b67] font-medium">
                      <span>Nie polecam</span>
                      <span>Polecam</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[15px] text-gray-700 whitespace-pre-wrap">
                    {Array.isArray(value) ? (
                      <div className="space-y-1">
                        {value.map((item, idx) => (
                          <div key={`${key}-${idx}`} className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded border border-[#2c3b67] bg-[#2c3b67] flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      value
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="min-w-[800px] max-w-6xl"
    >
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'w-8 h-8',
                    star <= review.rating ? 'text-[#2c3b67] fill-[#2c3b67]' : 'text-gray-200'
                  )}
                />
              ))}
            </div>
            <span className="text-lg font-medium text-[#2c3b67]">{review.rating}/5</span>
          </div>
          <div className="space-y-4">
            <div className="text-sm text-gray-500">
              <div>Data dodania: {formatDate(review.created_at)}</div>
            </div>
            {(review.profile?.position || review.profile?.company_size || review.profile?.industry) && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {review.profile?.position && (
                  <div className="text-sm">
                    <span className="font-bold text-gray-700">Oceniający:</span>
                    <span className="ml-2 text-gray-600">{review.profile.position}</span>
                  </div>
                )}
                {review.profile?.company_size && (
                  <div className="text-sm">
                    <span className="font-bold text-gray-700">Wielkość firmy:</span>
                    <span className="ml-2 text-gray-600">{review.profile.company_size}</span>
                  </div>
                )}
                {review.profile?.industry && (
                  <div className="text-sm">
                    <span className="font-bold text-gray-700">Branża:</span>
                    <span className="ml-2 text-gray-600">{review.profile.industry}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-8">
          <div className="w-2 h-8 bg-[#2c3b67] rounded"></div>
          <h2 className="text-2xl font-semibold text-[#2c3b67]">{review.title}</h2>
        </div>
        
        {review.responses && Object.entries(review.responses)
          .sort(([, a], [, b]) => {
            // Get order_index values
            const orderA = (a as any).orderIndex;
            const orderB = (b as any).orderIndex;
            
            // Convert to numbers, only accept non-negative integers
            let numA = 999;
            let numB = 999;
            
            if (orderA !== null && orderA !== undefined) {
              const tempA = Number(orderA);
              if (!isNaN(tempA) && Number.isInteger(tempA) && tempA >= 0) {
                numA = tempA;
              }
            }
            
            if (orderB !== null && orderB !== undefined) {
              const tempB = Number(orderB);
              if (!isNaN(tempB) && Number.isInteger(tempB) && tempB >= 0) {
                numB = tempB;
              }
            }
            
            console.log(`Modal sorting: ${(a as any).name} (${numA}) vs ${(b as any).name} (${numB})`);
            console.log('Raw values:', { orderA, orderB, numA, numB });
            
            return numA - numB;
          })
          .map(([sectionId, sectionData]) => {
            const orderIndex = (sectionData as any).orderIndex;
            let numericOrder = 999;
            
            if (orderIndex !== null && orderIndex !== undefined) {
              const tempOrder = Number(orderIndex);
              if (!isNaN(tempOrder) && Number.isInteger(tempOrder) && tempOrder >= 0) {
                numericOrder = tempOrder;
              }
            }
            
            console.log(`Rendering section: ${(sectionData as any).name} with order ${numericOrder} (raw: ${orderIndex})`);
            let sectionTitle = (sectionData as any).name || "Dodatkowe informacje";
            return renderResponseSection((sectionData as any).fields, sectionTitle);
          })}
      </div>
    </Modal>
  );
};

export default ReviewPopupModal;
