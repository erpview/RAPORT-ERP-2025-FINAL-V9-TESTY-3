import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import { supabase } from '../config/supabase';
import { System } from '../types/system';

const importSystemsFromCsv = async (filePath: string): Promise<void> => {
  const systems: Omit<System, 'id'>[] = [];

  // Create CSV parser
  const parser = parse({
    delimiter: ',',
    columns: true,
    cast: (value, context) => {
      // Handle empty values
      if (value === '') return null;
      
      // Handle boolean values
      if (value === 'true') return true;
      if (value === 'false') return false;
      
      // Handle arrays (values in curly braces)
      if (value.startsWith('{') && value.endsWith('}')) {
        return value.slice(1, -1).split(',').filter(Boolean);
      }
      
      // Handle integer fields
      const integerFields = ['max_users', 'concurrent_users'];
      if (integerFields.includes(context.column)) {
        return value === '' ? null : parseInt(value, 10);
      }
      
      // Remove quotes from string values
      if (typeof value === 'string') {
        return value.replace(/^"(.*)"$/, '$1');
      }
      
      return value;
    }
  });

  // Read and parse CSV file
  const parseFile = new Promise((resolve, reject) => {
    createReadStream(filePath)
      .pipe(parser)
      .on('data', (row) => {
        // Clean up the data before adding to systems array
        Object.keys(row).forEach(key => {
          if (row[key] === '') {
            row[key] = null;
          }
        });
        systems.push(row);
      })
      .on('end', resolve)
      .on('error', reject);
  });

  try {
    console.log('Reading CSV file...');
    await parseFile;

    // First, clear existing data
    console.log('Clearing existing data...');
    const { error: deleteError } = await supabase
      .from('systems')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
      console.error('Error clearing existing data:', deleteError);
      throw deleteError;
    }
    console.log('Cleared existing data');

    // Then insert new data
    console.log('Importing systems to Supabase...');
    const { error: insertError } = await supabase
      .from('systems')
      .insert(systems);

    if (insertError) {
      console.error('Error inserting data:', insertError);
      throw insertError;
    }
    
    console.log('Import completed successfully');
    console.log(`Imported ${systems.length} systems`);
  } catch (error) {
    console.error('Error during import:', error);
    throw error;
  }
};

// Get the command line arguments
const args = process.argv.slice(2);
const filePath = args[0];

if (!filePath) {
  console.error('Please provide a CSV file path');
  process.exit(1);
}

// Run the import
importSystemsFromCsv(filePath)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  });