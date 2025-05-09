import { prisma } from '../lib/prisma';

async function verifyDatabaseConnection() {
  console.log('Attempting to verify database connection...');
  
  try {
    // Try to query the database
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful!');

    // Get database version for additional verification
    const version = await prisma.$queryRaw<[{ version: string }]>`SELECT version()`;
    console.log('📊 Database version:', version[0].version);

    // Check if our table exists
    const tableExists = await prisma.$queryRaw<[{ exists: boolean }]>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'daily_menus'
      );
    `;
    console.log('📋 DailyMenu table exists:', tableExists[0].exists ? '✅ Yes' : '❌ No');

  } catch (error) {
    console.error('❌ Database connection failed!');
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the verification
verifyDatabaseConnection();