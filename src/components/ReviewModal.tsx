import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { System } from '../types/system';
import { reviewSystem } from '../services/systemsService';
import toast from 'react-hot-toast';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  system: System;
  onReviewComplete: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  system,
  onReviewComplete
}) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReview = async (status: 'published' | 'rejected') => {
    if (!notes && status === 'rejected') {
      toast.error('Proszę podać powód odrzucenia zmian');
      return;
    }

    setIsSubmitting(true);
    try {
      await reviewSystem(system.id, status, notes);
      toast.success(status === 'published' ? 'Zmiany zostały zatwierdzone' : 'Zmiany zostały odrzucone');
      onReviewComplete();
      onClose();
    } catch (error) {
      console.error('Error reviewing system:', error);
      toast.error('Wystąpił błąd podczas przetwarzania zmian');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[24px] font-semibold text-[#1d1d1f]">
              Przegląd zmian w systemie
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F5F5F7] rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-[17px] font-medium text-[#1d1d1f] mb-2">
                {system.name}
              </h3>
              <p className="text-[15px] text-[#86868b]">
                {system.vendor}
              </p>
            </div>

            {system.change_notes && (
              <div className="p-4 bg-[#F5F5F7] rounded-xl">
                <h4 className="text-[15px] font-medium text-[#1d1d1f] mb-2">
                  Uwagi od edytora:
                </h4>
                <p className="text-[15px] text-[#1d1d1f]">
                  {system.change_notes}
                </p>
              </div>
            )}

            <div>
              <label className="block text-[15px] font-medium text-[#1d1d1f] mb-2">
                Uwagi do przeglądu {!system.change_notes && '*'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="sf-input w-full min-h-[120px] resize-y"
                placeholder="Wprowadź uwagi do przeglądu..."
                required={!system.change_notes}
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => handleReview('rejected')}
                disabled={isSubmitting}
                className="sf-button bg-[#FF3B30] text-white hover:bg-[#FF3B30]/90 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <XCircle className="w-5 h-5 mr-2" />
                )}
                Odrzuć zmiany
              </button>
              <button
                onClick={() => handleReview('published')}
                disabled={isSubmitting}
                className="sf-button bg-[#34C759] text-white hover:bg-[#34C759]/90 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                )}
                Zatwierdź zmiany
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};