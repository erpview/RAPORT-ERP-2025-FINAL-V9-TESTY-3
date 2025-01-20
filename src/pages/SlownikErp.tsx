import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dictionaryService } from '../services/dictionary';
import { DictionaryTerm } from '../types/dictionary';
import { Card } from '../components/ui/Card';
import { MetaTags } from '../components/MetaTags';

const AlphabetBar = ({ letters, onLetterClick }: { letters: string[], onLetterClick: (letter: string) => void }) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center my-6">
      {letters.map((letter) => (
        <button
          key={letter}
          onClick={() => onLetterClick(letter)}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {letter}
        </button>
      ))}
    </div>
  );
};

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed right-8 bottom-8 p-3 rounded-full bg-[#2c3b67] text-white shadow-lg hover:bg-[#3d4d7d] transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
      aria-label="Przewiń do góry"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-6 w-6" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M5 10l7-7m0 0l7 7m-7-7v18" 
        />
      </svg>
    </button>
  );
};

const SlownikErp: React.FC = () => {
  const [terms, setTerms] = useState<DictionaryTerm[]>([]);
  const [uniqueLetters, setUniqueLetters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const data = await dictionaryService.getAllTerms();
        setTerms(data);
        // Get unique letters and sort them
        const letters = [...new Set(data.map(term => term.letter))].sort();
        setUniqueLetters(letters);
      } catch (error) {
        console.error('Error fetching terms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, []);

  const scrollToLetter = (letter: string) => {
    const element = document.getElementById(`letter-${letter}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const termsByLetter = alphabet.reduce((acc, letter) => {
    acc[letter] = terms.filter(term => term.letter === letter);
    return acc;
  }, {} as Record<string, DictionaryTerm[]>);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <MetaTags pageData={{ terms }} />
      <div className="min-h-screen bg-[#F5F5F7] py-12">
        <div className="container mx-auto px-8 sm:px-8 lg:px-12">
          <div className="text-center pt-12 mb-4">
            <h1 className="text-[#1d1d1f]">Słownik ERP</h1>
          </div>

          <p className="text-lg text-center text-gray-600 max-w-4xl mx-auto mb-12">
            Słownik ERP to zbiór najważniejszych pojęć, definicji i terminów związanych z systemami klasy Enterprise Resource Planning, umożliwiający szybkie zrozumienie kluczowych zagadnień i ułatwiający komunikację w obszarze zarządzania zasobami przedsiębiorstwa.
          </p>

          <AlphabetBar letters={uniqueLetters} onLetterClick={scrollToLetter} />

          {alphabet.map(letter => {
            const letterTerms = termsByLetter[letter];
            if (!letterTerms || letterTerms.length === 0) return null;

            return (
              <div key={letter} id={`letter-${letter}`} className="scroll-mt-20 mb-8">
                <h2 className="text-2xl font-bold text-[#2c3b67] mb-4">
                  {letter}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {letterTerms.map(term => (
                    <Link
                      key={term.id}
                      to={`/slownik-erp/${term.slug}`}
                      className="no-underline"
                    >
                      <Card className="hover:bg-gray-50 transition-colors">
                        <div className="p-4">
                          <span className="text-gray-800 hover:text-blue-600 text-lg font-medium">
                            {term.term}
                          </span>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
          <ScrollToTopButton />
        </div>
      </div>
    </>
  );
};

export default SlownikErp;
