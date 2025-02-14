import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSystems } from '../hooks/useSystems';
import { Loader2, ChevronLeft, Scale, FileText } from 'lucide-react';
import ReviewAddCard from '../components/ReviewAddCard';
import NasCard from '../components/NasCard';
import LikesAndDislikes from '../components/LikesAndDislikes';
import ReviewCards from '../components/ReviewCards';
import { Button } from '../components/ui/Button';
import CategoryRatings from '../components/CategoryRatings';
import { useComparison } from '../context/ComparisonContext';
import { useAuth } from '../context/AuthContext';
import { MultiSelectValue } from '../components/ui/MultiSelectValue';
import { normalizeMultiselectValue } from '../utils/fieldUtils';
import { Helmet } from 'react-helmet-async';
import { seoService } from '../services/seo';
import { ProcessedSEOData } from '../types/seo';
import { SurveyModal } from '../components/SurveyModal';
import { adminSupabase as supabase } from '../config/supabase';
import RatingCard from '../components/RatingCard';

interface CategoryRating {
  name: string;
  value: number;
}

interface SystemRating {
  averageRating: number;
  totalReviews: number;
  distribution: {
    '5': number;
    '4': number;
    '3': number;
    '2': number;
    '1': number;
  };
}

const SystemDetail: React.FC = () => {
  const { systemName } = useParams<{ systemName: string }>();
  const { systems, loading, error } = useSystems();
  const { selectedSystems, addSystem, removeSystem } = useComparison();
  const { user, isAdmin, isEditor } = useAuth();
  const canSubmitSurvey = user && (isAdmin || (!isAdmin && !isEditor));
  const isRegularUser = user && !isAdmin && !isEditor; // eslint-disable-line @typescript-eslint/no-unused-vars
  const [seoData, setSeoData] = useState<ProcessedSEOData | null>(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [systemSurveys, setSystemSurveys] = useState<Record<string, any>>({});
  const [surveyAssignments, setSurveyAssignments] = useState<Record<string, string>>({});
  const [likes, setLikes] = useState<Array<{ content: string; created_at: string }>>([]);
  const [dislikes, setDislikes] = useState<Array<{ content: string; created_at: string }>>([]);
  const REVIEWS_PER_PAGE = 6;
  const [reviews, setReviews] = useState<Array<any>>([]);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [nasScore, setNasScore] = useState<number>(0);
  const [nasError, setNasError] = useState<string | null>(null);
  const [isLoadingNas, setIsLoadingNas] = useState(false);
  const [nasReviewCount, setNasReviewCount] = useState(0);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [visibleCount, setVisibleCount] = useState(2);

  const [categoryRatings, setCategoryRatings] = useState<CategoryRating[]>([
    { name: 'Ocena i negocjowanie umów', value: 0 },
    { name: 'Integracja i wdrożenie', value: 0 },
    { name: 'Serwis i wsparcie', value: 0 },
    { name: 'Możliwości systemu', value: 0 }
  ]);
  const [systemRating, setSystemRating] = useState<SystemRating>({
    averageRating: 0,
    totalReviews: 0,
    distribution: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 }
  });
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [loadingRatings, setLoadingRatings] = useState(false);

  const system = systems.find(s => {
    const urlName = encodeURIComponent(s.name.toLowerCase().replace(/ /g, '-'));
    return urlName === systemName;
  });
  
  console.log('Found system:', system);
  console.log('System name param:', systemName);
  console.log('Available systems:', systems);

  const isSelected = system ? selectedSystems.some(s => s.id === system.id) : false;

  // Load survey assignments when system changes
  useEffect(() => {
    if (system) {
      loadSurveyAssignments();
    }
  }, [system]);

  // Load system ratings when system or assignments change
  useEffect(() => {
    if (system?.id && surveyAssignments[system.id]) {
      loadSystemRatings();
    }
  }, [system?.id, surveyAssignments[system?.id ?? '']]);

  // Load feedback (likes/dislikes) separately
  useEffect(() => {
    if (system?.id && surveyAssignments[system.id]) {
      loadFeedback();
      loadNasScore();
    }
  }, [system?.id, surveyAssignments[system?.id ?? '']]);

  // Load initial reviews when system or assignments change
  useEffect(() => {
    if (system?.id && surveyAssignments[system.id]) {
      setReviews([]); // Reset reviews when system changes
      loadReviews();
    }
  }, [system?.id, surveyAssignments[system?.id ?? '']]);

  useEffect(() => {
    if (system) {
      const features = normalizeMultiselectValue(system.size).join(', ');
      seoService.processSEOData('system-detail', {
        systemName: system.name,
        systemDescription: system.description || '',
        vendor: system.vendor,
        keywords: features
      }).then(setSeoData);
    }
  }, [system]);

  const loadSystemRatings = async () => {
    if (!system) {
      console.log('No system available for loading ratings');
      return;
    }
    
    setLoadingRatings(true);
    setRatingError(null);
    
    console.log('Loading ratings for system:', system.id);

    try {
      console.log('Fetching survey responses...');
      // Check if there's an assignment for this system
      const assignmentId = surveyAssignments[system.id];
      if (!assignmentId) {
        setSystemRating({
          averageRating: 0,
          totalReviews: 0,
          distribution: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 }
        });
        setLoadingRatings(false);
        return;
      }

      // Get all published survey responses for this system
      const { data: surveyResponses, error } = await supabase
        .from('survey_responses')
        .select('responses')
        .eq('assignment_id', assignmentId)
        .eq('form_id', '65220036-b679-427b-8d75-4300b8634452')
        .eq('status', 'published');

      console.log('Found survey responses:', surveyResponses);

      if (error) throw error;
      if (!surveyResponses || surveyResponses.length === 0) {
        setSystemRating({
          averageRating: 0,
          totalReviews: 0,
          distribution: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 }
        });
        setLoadingRatings(false);
        return;
      }

      let totalRating = 0;
      let totalReviews = 0;
      const distribution = {
        '5': 0,
        '4': 0,
        '3': 0,
        '2': 0,
        '1': 0
      };

      const OVERALL_RATING_FIELD_ID = 'fae811f6-fdc0-49ed-9979-7958051bade9';
      const OVERALL_RATING_MODULE_ID = 'bccaf7e8-5f79-41f9-b338-6e861d94577b';
      
      // Category ratings configuration
      const CATEGORY_MODULE_ID = '405f80d2-eb9b-44f6-a4bb-c82d1f8589a2';
      const categoryFields = [
        { id: 'd609b881-286b-4032-8dd9-0cbe84c0cddd', name: 'Ocena i negocjowanie umów' },
        { id: '85757b3a-62ee-4fc0-9d0b-847f7ef8ff0f', name: 'Integracja i wdrożenie' },
        { id: 'fe5f50f7-1c54-449a-9104-6e72d72bff99', name: 'Serwis i wsparcie' },
        { id: '95f06f38-034f-40d1-a98f-5df24546b44f', name: 'Możliwości systemu' },
      ];
      
      // Initialize category totals with defaults
      const categoryTotals: { [key: string]: { sum: number; count: number } } = {};
      categoryFields.forEach(field => {
        categoryTotals[field.id] = { sum: 0, count: 0 };
      });

      // Create default category ratings (all zeros)
      const defaultCategoryRatings = categoryFields.map(field => ({
        name: field.name,
        value: 0
      }));
      setCategoryRatings(defaultCategoryRatings);
      
      console.log('Processing survey responses:', surveyResponses);
      
      console.log('Processing survey responses for ratings:', surveyResponses);
      surveyResponses?.forEach(response => {
        console.log('Processing response:', response);
        // Process overall rating first
        const moduleData = response.responses?.[OVERALL_RATING_MODULE_ID];
        if (moduleData) {
          const overallRating = Number(moduleData[OVERALL_RATING_FIELD_ID]);
          if (!isNaN(overallRating) && overallRating >= 1 && overallRating <= 5) {
            totalRating += overallRating;
            totalReviews++;
            const roundedRating = String(Math.round(overallRating)) as keyof typeof distribution;
            distribution[roundedRating] = (distribution[roundedRating] || 0) + 1;
          }
        }

        // Process category ratings
        const categoryModuleData = response.responses?.[CATEGORY_MODULE_ID];
        if (categoryModuleData) {
          categoryFields.forEach(field => {
            const value = Number(categoryModuleData[field.id]);
            if (!isNaN(value) && value >= 1 && value <= 5) {
              categoryTotals[field.id].sum += value;
              categoryTotals[field.id].count++;
            }
          });
        }

      });

      // Calculate category averages
      const newCategoryRatings = categoryFields.map(field => ({
        name: field.name,
        value: categoryTotals[field.id].count > 0
          ? categoryTotals[field.id].sum / categoryTotals[field.id].count
          : 0
      }));
      
      setCategoryRatings(newCategoryRatings);

      console.log('Final totals before setting rating:', { totalRating, totalReviews, distribution });
      const rating = {
        averageRating: totalReviews > 0 ? totalRating / totalReviews : 0,
        totalReviews,
        distribution
      };
      
      console.log('Setting system rating:', rating);
      setSystemRating(rating);
    } catch (error) {
      console.error('Error loading system ratings:', error);
      setRatingError('Wystąpił błąd podczas ładowania ocen');
    } finally {
      setLoadingRatings(false);
    }
  };

  const getFieldInfo = (moduleId: string, fieldId: string) => {
    if (!system?.id || !systemSurveys[system.id]) {
      return { name: fieldId, orderIndex: 999 };
    }
    const module = systemSurveys[system.id].modules.find((m: any) => m.id === moduleId);
    if (!module) return { name: fieldId, orderIndex: 999 };
    const field = module.fields.find((f: any) => f.id === fieldId);
    return {
      name: field?.name || fieldId,
      orderIndex: field?.order_index ?? 999
    };
  };

  const getModuleInfo = (moduleId: string) => {
    if (!system?.id || !systemSurveys[system.id]) {
      return { name: moduleId, orderIndex: 999 };
    }
    const module = systemSurveys[system.id].modules.find((m: any) => m.id === moduleId);
    if (!module) return { name: moduleId, orderIndex: 999 }; // Put unknown modules at the end
    
    // Handle order_index more robustly
    let orderIndex = 999;
    if (module.order_index !== null && module.order_index !== undefined) {
      // Convert to number using Number() which handles both string and number inputs
      orderIndex = Number(module.order_index);
      // Only accept non-negative integers
      if (!isNaN(orderIndex) && Number.isInteger(orderIndex) && orderIndex >= 0) {
        console.log(`Module ${module.name} has valid order_index:`, orderIndex);
      } else {
        console.log(`Module ${module.name} has invalid order_index:`, module.order_index, 'using default 999');
        orderIndex = 999;
      }
    } else {
      console.log(`Module ${module.name} has no order_index, using default 999`);
    }
    
    return {
      name: module.name,
      orderIndex
    };
  };

  const loadReviews = async () => {
    if (!system) {
      console.log('Cannot load reviews - missing system');
      return;
    }

    const assignmentId = surveyAssignments[system.id];
    if (!assignmentId) {
      console.log('Cannot load reviews - missing assignment');
      return;
    }

    if (!system?.id || !assignmentId) return;
    
    if (isLoadingReviews) {
      console.log('Cannot load reviews - already loading');
      return;
    }

    console.log('Loading reviews with assignment ID:', assignmentId);
    setIsLoadingReviews(true);
    console.log('Loading reviews for system:', system.id, 'with assignment:', assignmentId);

    try {
      // First, get total count of published reviews
      const { count } = await supabase
        .from('survey_responses')
        .select('id', { count: 'exact', head: true })
        .eq('assignment_id', assignmentId)
        .eq('form_id', '65220036-b679-427b-8d75-4300b8634452')
        .eq('status', 'published');

      // Get published reviews with pagination
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('survey_responses')
        .select('*, user_id')
        .eq('assignment_id', assignmentId)
        .eq('form_id', '65220036-b679-427b-8d75-4300b8634452')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(reviews.length, reviews.length + REVIEWS_PER_PAGE - 1);

      // If we have reviews, fetch the corresponding profiles
      if (reviewsData && reviewsData.length > 0) {
        const userIds = reviewsData.map(item => item.user_id).filter(Boolean);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, position, company_size, industry')
          .in('id', userIds);

        interface Profile {
          id: string;
          position?: string;
          company_size?: string;
          industry?: string;
        }

        // Create a map of user_id to profile data
        const profileMap = (profilesData || []).reduce<Record<string, Profile>>((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {});

        // Attach profiles to the review data
        reviewsData.forEach(item => {
          if (item.user_id && profileMap[item.user_id]) {
            item.profile = profileMap[item.user_id];
          }
        });
      }

      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError);
        throw new Error(`Failed to fetch reviews: ${reviewsError.message}`);
      }

      if (!reviewsData) {
        console.error('No reviews data returned');
        throw new Error('No reviews data returned from the database');
      }

      console.log('Reviews data:', reviewsData);

      if (reviewsData.length === 0) {
        setHasMoreReviews(false);
        return;
      }

      // Process only valid reviews
      const processedReviews = reviewsData
        .filter(item => {
          const feedbackSection = item.responses?.["79913215-7d75-4853-8f70-35ee5f7ecc17"];
          const title = feedbackSection?.["47a65f5a-e71c-4734-891b-d1584feced00"];
          return title && title.trim().length > 0;
        })
        .map(item => {
          const feedbackSection = item.responses?.["79913215-7d75-4853-8f70-35ee5f7ecc17"];
          const ratingSection = item.responses?.["bccaf7e8-5f79-41f9-b338-6e861d94577b"];
          const profileSection = item.responses?.["7c897a42-a3fe-466b-9ac4-647a47cf5514"];
          
          const content = ratingSection?.["9def1889-880a-4620-8783-17e6356202b7"] || '';
          
          // Extract profile information from responses
          const profile = {
            position: profileSection?.["a4d7d52d-6c5b-4c0f-8aad-a7f4b9bc60da"],
            company_size: profileSection?.["d1f1b5cc-3ae3-4453-94e8-9c7d450e7a7e"],
            industry: profileSection?.["0e15d7b0-0ea5-4001-b93b-f8651458c98e"]
          };
          
          // Transform responses to use field names and maintain order
          const transformedResponses: Record<string, any> = {};
          
          // Get all modules with their order
          const moduleEntries = Object.entries(item.responses || {}).map(([moduleId, fields]) => {
            const info = getModuleInfo(moduleId);
            console.log(`Module ${moduleId} has order_index:`, info.orderIndex);
            return {
              moduleId,
              fields,
              ...info
            };
          });

          // Sort modules by order_index only (0 first, then 1,2,3...)
          moduleEntries.sort((a, b) => {
            const orderA = a.orderIndex ?? 999;
            const orderB = b.orderIndex ?? 999;
            return orderA - orderB;
          });

          // Process each module in sorted order
          moduleEntries.forEach(({ moduleId, fields, name: moduleName, orderIndex }) => {
            // Get all fields with their order
            const fieldEntries = Object.entries(fields as Record<string, any>).map(([fieldId, value]) => ({
              fieldId,
              value,
              ...getFieldInfo(moduleId, fieldId)
            }));

            // Sort fields by order_index
            fieldEntries.sort((a, b) => a.orderIndex - b.orderIndex);

            // Create ordered fields object
            const orderedFields: Record<string, any> = {};
            fieldEntries.forEach(({ name, value }) => {
              orderedFields[name] = value;
            });

            transformedResponses[moduleId] = {
              name: moduleName,
              orderIndex: orderIndex, // Use the orderIndex directly from the sorted entry
              fields: orderedFields
            };
          });

          // Get all modules with their order_index
          console.log('All survey modules:', systemSurveys[system?.id]?.modules);
          
          // Create a map of module ID to order_index
          const moduleOrder = systemSurveys[system?.id]?.modules.reduce((acc: Record<string, number>, module: any) => {
            console.log(`Module ${module.name}: order_index = ${module.order_index}`);
            acc[module.id] = module.order_index;
            return acc;
          }, {}) || {};

          // Sort responses by module order_index
          const sortedEntries = Object.entries(transformedResponses)
            .map(([id, data]) => {
              const module = systemSurveys[system?.id]?.modules.find((m: any) => m.id === id);
              const orderIndex = module ? parseInt(module.order_index) : 999;
              console.log(`Module ${data.name} has order_index:`, orderIndex);
              return [id, { ...data, orderIndex: !isNaN(orderIndex) ? orderIndex : 999 }];
            })
            .sort((a, b) => {
              const orderA = a[1].orderIndex;
              const orderB = b[1].orderIndex;
              console.log(`Comparing ${a[1].name}(${orderA}) vs ${b[1].name}(${orderB})`);
              return (orderA ?? 999) - (orderB ?? 999);
            });

          console.log('Final sorted order:', sortedEntries.map(([, data]) => `${data.name}(${data.orderIndex})`));
          const sortedResponses = Object.fromEntries(sortedEntries);

          return {
            id: item.id,
            rating: Number(ratingSection?.["fae811f6-fdc0-49ed-9979-7958051bade9"]) || 0,
            title: feedbackSection?.["47a65f5a-e71c-4734-891b-d1584feced00"] || '',
            content: content,
            created_at: item.created_at,
            responses: sortedResponses,
            profile: {
              position: item.profile?.position || profileSection?.["a4d7d52d-6c5b-4c0f-8aad-a7f4b9bc60da"] || '',
              company_size: item.profile?.company_size || profileSection?.["d1f1b5cc-3ae3-4453-94e8-9c7d450e7a7e"] || '',
              industry: item.profile?.industry || profileSection?.["0e15d7b0-0ea5-4001-b93b-f8651458c98e"] || ''
            }
          };
        });

      if (processedReviews.length > 0) {
        const totalReviews = count || 0;
        // Use a callback to ensure we have the latest state and deduplicate by ID
        setReviews(prevReviews => {
          const reviewMap = new Map(prevReviews.map(r => [r.id, r]));
          processedReviews.forEach(review => reviewMap.set(review.id, review));
          const newReviews = Array.from(reviewMap.values());
          console.log('Total reviews:', totalReviews, 'Current reviews:', newReviews.length);
          setHasMoreReviews(newReviews.length < totalReviews);
          return newReviews;
        });
      } else {
        setHasMoreReviews(false);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      setHasMoreReviews(false);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const loadFeedback = async () => {
    if (!system) {
      console.log('No system available for loading feedback');
      return;
    }
    setIsLoadingFeedback(true);

    const assignmentId = surveyAssignments[system.id];
    if (!assignmentId) {
      console.log('No survey assignment found for system:', system.id);
      return;
    }
    console.log('Loading feedback with assignment ID:', assignmentId);
    
    console.log('Loading feedback for system:', system.id, 'with assignment:', assignmentId);
    
    try {
      // Load likes from published responses
      const { data: likesData, error: likesError } = await supabase
        .from('survey_responses')
        .select('responses, created_at')
        .eq('assignment_id', assignmentId)
        .eq('form_id', '65220036-b679-427b-8d75-4300b8634452')
        .eq('status', 'published')
        .not('responses->bccaf7e8-5f79-41f9-b338-6e861d94577b', 'is', 'null')
        .order('created_at', { ascending: false });

      if (likesError) {
        console.error('Error loading likes:', likesError);
        return;
      }

      console.log('Loaded likes data:', likesData);

      // Load dislikes from published responses
      const { data: dislikesData, error: dislikesError } = await supabase
        .from('survey_responses')
        .select('responses, created_at')
        .eq('assignment_id', assignmentId)
        .eq('form_id', '65220036-b679-427b-8d75-4300b8634452')
        .eq('status', 'published')
        .not('responses->79913215-7d75-4853-8f70-35ee5f7ecc17', 'is', 'null')
        .order('created_at', { ascending: false});

      if (dislikesError) {
        console.error('Error loading dislikes:', dislikesError);
        return;
      }

      console.log('Loaded dislikes data:', dislikesData);

      const processedLikes = likesData
        ?.map(item => {
          const moduleResponses = item.responses?.['bccaf7e8-5f79-41f9-b338-6e861d94577b'] || {};
          const content = moduleResponses['227e66b4-463a-452e-9051-91ef4bac92b3'] || '';
          console.log('Processing like item:', { raw: item, moduleResponses, content });
          return {
            content,
            created_at: item.created_at
          };
        })
        .filter(item => item.content.trim() !== '') || [];

      const processedDislikes = dislikesData
        ?.map(item => {
          const moduleResponses = item.responses?.['79913215-7d75-4853-8f70-35ee5f7ecc17'] || {};
          const content = moduleResponses['fb6fa55b-8dbf-415d-bb32-4647187dea41'] || '';
          console.log('Processing dislike item:', { raw: item, moduleResponses, content });
          return {
            content,
            created_at: item.created_at
          };
        })
        .filter(item => item.content.trim() !== '') || [];

      console.log('Setting likes:', processedLikes);
      console.log('Setting dislikes:', processedDislikes);
      setLikes(processedLikes);
      setDislikes(processedDislikes);
    } catch (error) {
      console.error('Error loading feedback:', error);
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  const loadNasScore = async () => {
    if (!system) return;
    
    setIsLoadingNas(true);
    setNasError(null);

    const assignmentId = surveyAssignments[system.id];
    if (!assignmentId) {
      setNasError('No survey assignment found');
      setIsLoadingNas(false);
      return;
    }

    try {
      const { data: nasResponses, error: nasError } = await supabase
        .from('survey_responses')
        .select('responses')
        .eq('assignment_id', assignmentId)
        .eq('form_id', '65220036-b679-427b-8d75-4300b8634452')
        .eq('status', 'published')
        .not('responses->dddcd6a3-0d6b-483c-a4eb-e26c86fa7281->86422dc6-d0c6-4117-ac62-bd32db087477', 'is', null);

      if (nasError) {
        console.error('Error loading NAS data:', nasError);
        setNasError('Failed to load NAS score');
        return;
      }

      if (!nasResponses || nasResponses.length === 0) {
        setNasScore(0);
        setNasReviewCount(0);
        return;
      }

      const sum = nasResponses.reduce((acc, response) => {
        const value = Number(response.responses?.['dddcd6a3-0d6b-483c-a4eb-e26c86fa7281']?.['86422dc6-d0c6-4117-ac62-bd32db087477']) || 0;
        return acc + value;
      }, 0);

      setNasScore(sum / nasResponses.length);
      setNasReviewCount(nasResponses.length);
    } catch (error) {
      console.error('Error in NAS calculation:', error);
      setNasError('Failed to calculate NAS score');
    } finally {
      setIsLoadingNas(false);
    }
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 2);
  };

  const loadSurveyAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('survey_assignments')
        .select(`
          id,
          target_id,
          form:survey_forms!inner (
            id,
            name,
            description,
            modules:survey_modules!inner (
              id,
              name,
              description,
              order_index,
              fields:survey_fields!inner (
                id,
                name,
                label,
                field_type,
                options,
                required,
                order_index
              )
            )
          )
        `)
        .eq('target_type', 'system');

      if (error) throw error;

      console.log('Survey assignments data:', data);

      const surveyMap: Record<string, any> = {};
      const assignmentMap: Record<string, string> = {};
      data?.forEach(assignment => {
        if (assignment.form) {
          surveyMap[assignment.target_id] = assignment.form;
          assignmentMap[assignment.target_id] = assignment.id;
        }
      });

      console.log('Survey map:', surveyMap);
      console.log('Assignment map:', assignmentMap);
      setSystemSurveys(surveyMap);
      setSurveyAssignments(assignmentMap);
    } catch (error) {
      console.error('Error loading survey assignments:', error);
    }
  };

  useEffect(() => {
    if (system) {
      const features = normalizeMultiselectValue(system.size).join(', ');
      seoService.processSEOData('system-detail', {
        systemName: system.name,
        systemDescription: system.description,
        vendor: system.vendor,
        keywords: features
      }).then(setSeoData);
      
      // Load survey assignments first
      loadSurveyAssignments();
    }
  }, [system]);

  // Load ratings when system changes
  useEffect(() => {
    if (system?.id && surveyAssignments[system.id]) {
      loadSystemRatings();
    }
  }, [system?.id, surveyAssignments[system?.id ?? '']]);

  // Load reviews when system changes
  useEffect(() => {
    if (system?.id && surveyAssignments[system.id]) {
      setReviews([]); // Reset reviews when system changes
      setIsLoadingReviews(false); // Reset loading state
      loadReviews();
    }
    return () => {
      setReviews([]);
      setHasMoreReviews(false);
      setIsLoadingReviews(false);
    };
  }, [system?.id, surveyAssignments[system?.id ?? '']]);

  // Separate effect for loading feedback
  useEffect(() => {
    if (system?.id && surveyAssignments[system.id]) {
      loadFeedback();
    }
    return () => {
      setLikes([]);
      setDislikes([]);
    };
  }, [system?.id, surveyAssignments[system?.id ?? '']]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#007AFF] animate-spin" />
      </div>
    );
  }

  if (error || !system) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center">
        <p className="text-[#FF3B30] mb-4">{error || 'System nie został znaleziony'}</p>
        <Link 
          to="/systemy-erp"
          className="inline-flex items-center text-[#007AFF] hover:text-[#0051CC] transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Powrót do katalogu systemów
        </Link>
      </div>
    );
  }

  const handleCompareToggle = () => {
    if (isSelected) {
      removeSystem(system.id);
    } else {
      addSystem(system);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {seoData && (
        <Helmet>
          <title>{seoData.title}</title>
          <meta name="description" content={seoData.description} />
          <meta name="keywords" content={seoData.keywords} />
          <meta name="robots" content={seoData.robots} />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-touch-fullscreen" content="yes" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="HandheldFriendly" content="true" />
          <meta name="MobileOptimized" content="width" />
          {seoData.structuredData && (
            <script type="application/ld+json">
              {JSON.stringify(seoData.structuredData)}
            </script>
          )}
        </Helmet>
      )}
      <div className="container mx-auto px-8 sm:px-8 lg:px-12 py-8">
        <div className="mb-6">
          <Button component={Link} to="/systemy-erp" variant="ghost">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Powrót do katalogu systemów
          </Button>
        </div>

        <div className="sf-card p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-[24px] font-semibold text-[#1d1d1f]">
                {system.name}
              </h1>
              <p className="text-[15px] text-[#86868b] mt-1">
                {system.vendor}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {system && systemSurveys[system.id] && !isEditor && (
                <button
                  onClick={() => {
                    if (canSubmitSurvey) {
                      setShowSurvey(true);
                    } else {
                      setShowSurvey(true);
                    }
                  }}
                  className="sf-button h-10 text-[15px] font-medium flex items-center bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED] px-4"
                  aria-label="Oceń system ERP"
                  title="Oceń system ERP"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline">Oceń system ERP</span>
                </button>
              )}
              <button
                onClick={handleCompareToggle}
                className={`sf-button h-10 text-[15px] font-medium flex items-center px-4
                  ${isSelected 
                    ? 'bg-[#2c3b67] text-white hover:bg-[#2c3b67]/90'
                    : 'bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED]'
                  }`}
              >
                <Scale className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">
                  {isSelected ? 'Usuń z raportu ERP' : 'Dodaj do raportu ERP'}
                </span>
              </button>
            </div>
          </div>

          <p className="text-[17px] leading-relaxed text-[#1d1d1f] mb-8">
            {system.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-8">
            {normalizeMultiselectValue(system.size).map((size, index) => (
              <MultiSelectValue
                key={`${size}-${index}`}
                value={size}
                onClick={() => {}}
                isHighlighted={false}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Rating Card Section - Separate Card */}
      {loadingRatings ? (
        <div className="container mx-auto px-8 sm:px-8 lg:px-12">
          <div className="sf-card p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-[#86868b] animate-spin" />
              <span className="ml-2 text-[#86868b]">Wczytywanie ocen...</span>
            </div>
          </div>
        </div>
      ) : ratingError ? (
        <div className="container mx-auto px-8 sm:px-8 lg:px-12">
          <div className="sf-card p-6">
            <p className="text-[#FF3B30] text-center">{ratingError}</p>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-8 sm:px-8 lg:px-12">
          {user ? (
            <>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <RatingCard
                    averageRating={systemRating.averageRating}
                    totalReviews={systemRating.totalReviews}
                    distribution={systemRating.distribution}
                  />
                  <CategoryRatings ratings={categoryRatings} />
                </div>
                <NasCard
                  nasScore={nasScore}
                  totalReviews={nasReviewCount}
                  isLoading={isLoadingNas}
                  error={nasError}
                />
              </div>
              <LikesAndDislikes
                likes={likes.slice(0, visibleCount)}
                dislikes={dislikes.slice(0, visibleCount)}
                onLoadMore={handleLoadMore}
              />
              <ReviewCards 
                reviews={reviews} 
                onLoadMore={loadReviews} 
                hasMore={hasMoreReviews}
              />
            </>
          ) : (
            <ReviewAddCard />
          )}
        </div>
      )}

      {system && showSurvey && (
        <SurveyModal
          isOpen={showSurvey}
          onClose={() => setShowSurvey(false)}
          surveyForm={systemSurveys[system.id]}
          assignmentId={surveyAssignments[system.id]}
        />
      )}
    </div>
  );
};

export default SystemDetail;
