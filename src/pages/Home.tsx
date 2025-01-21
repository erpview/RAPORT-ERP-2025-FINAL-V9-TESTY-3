import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { Helmet } from 'react-helmet-async';
import { Button } from '../components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEOHead } from '../components/seo/SEOHead';
import { HelpCircle } from 'lucide-react';

interface Slide {
  id: number;
  image_url: string;
  link_url: string;
  title: string;
  overlay_heading: string;
  overlay_description: string | null;
  button_text: string;
  button_url: string;
}

interface Partner {
  id: number;
  name: string;
  logo_url: string;
  website_url: string;
  is_main_partner: boolean;
  slug: string;
}

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export default function Home() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mainPartners, setMainPartners] = useState<Partner[]>([]);
  const [techPartners, setTechPartners] = useState<Partner[]>([]);
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [content, setContent] = useState('');
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch slides
    const { data: slidesData } = await supabase
      .from('slides')
      .select('*')
      .order('order_index');
    if (slidesData) setSlides(slidesData);

    // Fetch partners
    const { data: partnersData } = await supabase
      .from('partners')
      .select('*')
      .order('order_index');
    if (partnersData) {
      setMainPartners(partnersData.filter(p => p.is_main_partner));
      setTechPartners(partnersData.filter(p => !p.is_main_partner));
    }

    // Fetch FAQ
    const { data: faqData } = await supabase
      .from('faq')
      .select('*')
      .order('order_index');
    if (faqData) setFaqItems(faqData);

    // Fetch content
    const { data: contentData } = await supabase
      .from('homepage_content')
      .select('*')
      .single();
    if (contentData) setContent(contentData.content);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <>
      <SEOHead pageIdentifier="home" />
      <div className="min-h-screen bg-white">
        <Helmet>
          <title>Kalkulator ERP - Strona główna</title>
        </Helmet>

        {/* Slider Section */}
        <div className="relative h-[500px] bg-navy-700 overflow-hidden group">
          {slides.length > 0 && (
            <>
              <div 
                className="absolute inset-0 transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {slides.map((slide, index) => (
                  <div key={slide.id} className="absolute w-full h-full" style={{ left: `${index * 100}%` }}>
                    <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" />
                    
                    {/* Content overlay */}
                    <div className="absolute inset-0">
                      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
                        <div className="relative max-w-[90vw] sm:max-w-none ml-[5%] sm:ml-[10%] mr-[max(5%,_calc(100%-95vw))] sm:mr-0 w-min min-w-[80%] sm:min-w-[55%]">
                          {/* White overlay behind text */}
                          {(slide.overlay_heading || slide.overlay_description) && (
                            <div className="absolute inset-0 bg-white opacity-70 rounded-lg" />
                          )}
                          
                          {/* Content */}
                          <div className="relative text-navy-700">
                            <div className="p-4">
                              <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 md:mb-6 whitespace-normal break-words">
                                {slide.overlay_heading}
                              </h1>
                              {slide.overlay_description && (
                                <p className="text-sm xs:text-base sm:text-lg md:text-xl mb-3 sm:mb-4 md:mb-8 whitespace-normal break-words">
                                  {slide.overlay_description}
                                </p>
                              )}
                            </div>
                            {slide.button_text && slide.button_url && (
                              <div className="flex justify-end px-4 pb-4">
                                <a
                                  href={slide.button_url}
                                  className="inline-flex items-center gap-2 px-2 xs:px-3 py-1 xs:py-1.5 rounded-lg transition-colors bg-[#2c3b67] text-white hover:bg-[#1a2440] text-[12px] xs:text-[13px] sm:text-[15px] font-medium"
                                >
                                  {slide.button_text}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 sm:block hidden"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 sm:block hidden"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 -mt-8 relative z-10 px-4 mx-auto max-w-xl sm:max-w-none">
          <Link to="/porownaj-systemy-erp">
            <Button 
              variant="secondary" 
              className="bg-white text-navy-700 shadow-lg hover:shadow-xl hover:scale-105 hover:bg-gray-50 text-lg sm:text-2xl font-bold px-4 sm:px-8 py-4 sm:py-6 h-auto w-full sm:w-auto whitespace-nowrap transform transition-all duration-300 ease-in-out hover:-translate-y-1"
            >
              RAPORT ERP
            </Button>
          </Link>
          <Link to="/slownik-erp">
            <Button 
              variant="secondary" 
              className="bg-white text-navy-700 shadow-lg hover:shadow-xl hover:scale-105 hover:bg-gray-50 text-lg sm:text-2xl font-bold px-4 sm:px-8 py-4 sm:py-6 h-auto w-full sm:w-auto whitespace-nowrap transform transition-all duration-300 ease-in-out hover:-translate-y-1"
            >
              SŁOWNIK ERP
            </Button>
          </Link>
          <Link to="/partnerzy">
            <Button 
              variant="secondary" 
              className="bg-white text-navy-700 shadow-lg hover:shadow-xl hover:scale-105 hover:bg-gray-50 text-lg sm:text-2xl font-bold px-4 sm:px-8 py-4 sm:py-6 h-auto w-full sm:w-auto whitespace-nowrap transform transition-all duration-300 ease-in-out hover:-translate-y-1"
            >
              PARTNERZY
            </Button>
          </Link>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
        </div>

        {/* Main Partners */}
        <div className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">Główni partnerzy</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-8">
              {mainPartners.map(partner => (
                <Link 
                  to={`/partnerzy/${partner.slug}`} 
                  key={partner.id} 
                  onClick={() => window.scrollTo(0, 0)}
                  className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow aspect-video"
                >
                  <img src={partner.logo_url} alt={partner.name} className="max-h-12 md:max-h-16 w-auto object-contain" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Technology Partners */}
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">Partnerzy technologiczni</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-8">
              {techPartners.map(partner => (
                <Link 
                  to={`/partnerzy/${partner.slug}`} 
                  key={partner.id}
                  onClick={() => window.scrollTo(0, 0)}
                  className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow aspect-video"
                >
                  <img src={partner.logo_url} alt={partner.name} className="max-h-10 md:max-h-12 w-auto object-contain" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-50 py-12">
          <div className="max-w-3xl mx-auto px-4">
            <div className="flex items-center justify-center gap-3 mb-8">
              <HelpCircle className="w-8 h-8 text-[#0066CC]" />
              <h2 className="text-[32px] font-semibold text-[#1d1d1f]">
                Często zadawane pytania - FAQ
              </h2>
            </div>
            <div className="space-y-4">
              {faqItems.map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === item.id ? null : item.id)}
                    className="w-full px-6 py-4 text-left font-medium flex justify-between items-center"
                  >
                    <span>{item.question}</span>
                    <ChevronRight
                      className={`w-5 h-5 transition-transform ${
                        expandedFaq === item.id ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  {expandedFaq === item.id && (
                    <div className="px-6 py-4 prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: item.answer }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
