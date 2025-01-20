import { migrateSystemsData } from './migrateData';

const runMigration = async () => {
  console.log('Starting data migration...');
  try {
    await migrateSystemsData();
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();