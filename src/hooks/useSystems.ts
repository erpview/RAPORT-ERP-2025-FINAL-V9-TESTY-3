import { useState, useEffect } from 'react';
import { System } from '../types/system';
import { fetchSystems } from '../services/systemsService';
import { toast } from 'react-hot-toast';

export const useSystems = () => {
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSystems = async () => {
      try {
        setLoading(true);
        const data = await fetchSystems();
        
        // Only show published systems
        const publishedSystems = data.filter(system => system.status === 'published');
        
        // Sort systems by vendor name first, then by system name
        const sortedData = [...publishedSystems].sort((a, b) => {
          const vendorCompare = a.vendor.localeCompare(b.vendor);
          if (vendorCompare !== 0) return vendorCompare;
          return a.name.localeCompare(b.name);
        });
        setSystems(sortedData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Wystąpił błąd podczas ładowania systemów';
        setError(errorMessage);
        toast.error('Nie udało się załadować listy systemów');
      } finally {
        setLoading(false);
      }
    };

    loadSystems();
  }, []);

  return { systems, loading, error };
};