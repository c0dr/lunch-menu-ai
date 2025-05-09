#!/usr/bin/env node

import cron from 'node-cron';
import { MockMenuFetcher } from '../services/menu-fetcher';
import { MenuFetchError } from '../types/menu';
import { PrismaMenuStorage } from '../services/menuStorage';

// Create fetcher instance
// Initialize services
const menuStorage = new PrismaMenuStorage();
const menuFetcher = new MockMenuFetcher();

/**
 * Fetches and stores the daily menu
 */
async function fetchAndStoreMenu(): Promise<void> {
  try {
    const menu = await menuFetcher.fetchDailyMenu();
    // Convert menu to string format for storage
    const menuText = JSON.stringify(menu);
    await menuStorage.saveMenu(menu.date, menuText);
    console.info('Successfully fetched and stored menu for', menu.date.toISOString());
  } catch (error) {
    const errorMessage = error instanceof MenuFetchError
      ? `Menu fetch failed: ${error.message}`
      : `Unexpected error during menu fetch: ${error}`;
    
    console.error(errorMessage);
    
    // TODO: Implement proper error notification
    // For now, just log to stderr which can be monitored
    console.error(JSON.stringify({
      type: 'MENU_FETCH_ERROR',
      timestamp: new Date().toISOString(),
      error: errorMessage,
      retryable: error instanceof MenuFetchError ? error.retryable : true
    }));
  }
}

// Schedule cron job to run at 6 AM Berlin time every day
// Format: Minute Hour Day Month Day-of-week
const CRON_SCHEDULE = '0 6 * * *';

if (require.main === module) {
  // Validate cron expression
  if (!cron.validate(CRON_SCHEDULE)) {
    console.error('Invalid cron schedule:', CRON_SCHEDULE);
    process.exit(1);
  }

  console.info('Starting menu fetch scheduler...');
  console.info(`Schedule: ${CRON_SCHEDULE} (Europe/Berlin)`);

  // Schedule the cron job with timezone
  cron.schedule(CRON_SCHEDULE, fetchAndStoreMenu, {
    timezone: 'Europe/Berlin',
    scheduled: true
  });

  // Also run immediately on startup
  fetchAndStoreMenu().catch(error => {
    console.error('Initial menu fetch failed:', error);
  });

  // Keep the process running
  process.stdin.resume();

  // Handle termination signals
  const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
  signals.forEach(signal => {
    process.on(signal, () => {
      console.info(`\nReceived ${signal}, shutting down...`);
      process.exit(0);
    });
  });
}

// Export for testing
export { fetchAndStoreMenu, CRON_SCHEDULE };