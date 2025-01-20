import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { supabase } from '../config/supabase';
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  order_index: number;
}

const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFaqItems();
  }, []);

  const fetchFaqItems = async () => {
    try {
      const { data, error } = await supabase
        .from('faq')
        .select('*')
        .order('order_index');

      if (error) throw error;

      const processedData = data?.map(item => ({
        ...item,
        answer: DOMPurify.sanitize(item.answer)
      })) || [];

      setFaqItems(processedData);
    } catch (error) {
      console.error('Error fetching FAQ items:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (id: number) => {
    setOpenItems(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-16 mb-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-16 mb-12">
      <div className="flex items-center justify-center gap-3 mb-8">
        <HelpCircle className="w-8 h-8 text-[#0066CC]" />
        <h2 className="text-[32px] font-semibold text-[#1d1d1f]">
          Często zadawane pytania - FAQ
        </h2>
      </div>
      <div className="space-y-4">
        {faqItems.map((item) => (
          <div
            key={item.id}
            className="sf-card overflow-hidden transition-shadow hover:shadow-md"
          >
            <button
              className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
              onClick={() => toggleItem(item.id)}
            >
              <span className="text-[17px] font-medium text-[#1d1d1f]">{item.question}</span>
              {openItems.includes(item.id) ? (
                <ChevronUp className="w-5 h-5 text-[#86868b]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#86868b]" />
              )}
            </button>
            {openItems.includes(item.id) && (
              <div className="px-6 py-4 bg-[#F5F5F7]/50">
                <div 
                  className="text-[15px] leading-relaxed text-[#1d1d1f] faq-answer"
                  dangerouslySetInnerHTML={{ __html: item.answer }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;