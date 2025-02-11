import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { useAuth } from '../context/AuthContext';
import { adminSupabase as supabase } from '../config/supabase';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async () => {
    if (!user) {
      setError('Musisz być zalogowany, aby wysłać opinię');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('user_feedback')
        .insert({
          user_id: user.id,
          feedback: feedback
        });

      if (error) throw error;

      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Wystąpił błąd podczas zapisywania opinii');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Twoja opinia"
      maxWidth="max-w-2xl"
      persistent={true}
    >
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-semibold">
          Podziel się swoją opinią
        </h2>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2c3b67]"></div>
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : success ? (
          <div className="text-green-500">Dziękujemy za Twoją opinię!</div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
            <div>
              <label className="block mb-2">
                <span className="text-[15px] font-medium">
                  Twoja opinia
                </span>
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="sf-input w-full h-32"
                placeholder="Napisz swoją opinię..."
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="sf-button bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED]"
              >
                Anuluj
              </button>
              <button
                type="submit"
                className="sf-button bg-[#2c3b67] text-white hover:bg-[#2c3b67]/90"
              >
                Wyślij
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
