import { createClient } from '@supabase/supabase-js';
import { System } from '../types/system';

const supabaseUrl = 'https://lhejpluydgktirpphuju.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoZWpwbHV5ZGdrdGlycHBodWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE2MzE5MjUsImV4cCI6MjA0NzIwNzkyNX0.0kurMWcZIsEy9RC07J8e2iX7LGPLdSXTg6h4XmNTURE';

const supabase = createClient(supabaseUrl, supabaseKey);

const systemsData: Omit<System, 'id'>[] = [
  // ... (previous systems data remains the same)
];

export const migrateSystemsData = async (): Promise<void> => {
  try {
    console.log('Starting data migration to Supabase...');
    
    // Delete all existing records
    const { error: deleteError } = await supabase
      .from('systems')
      .delete()
      .not('id', 'is', null);
      
    if (deleteError) {
      console.error('Error deleting existing data:', deleteError);
      throw deleteError;
    }
    console.log('Cleared existing data');

    // Insert new data in batches of 10
    const batchSize = 10;
    for (let i = 0; i < systemsData.length; i += batchSize) {
      const batch = systemsData.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from('systems')
        .insert(batch);

      if (insertError) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError);
        throw insertError;
      }
      console.log(`Inserted batch ${i / batchSize + 1} of ${Math.ceil(systemsData.length / batchSize)}`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
};