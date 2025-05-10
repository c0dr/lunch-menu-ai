#!/usr/bin/env node

import cron from 'node-cron';
import { ConfluenceMenuFetcher } from '../services/confluence-menu-fetcher';
import { MenuFetchError } from '../types/menu';
import { PrismaMenuStorage } from '../services/menuStorage';

// Create fetcher instance
// Initialize services
const menuStorage = new PrismaMenuStorage();
const menuFetcher = new ConfluenceMenuFetcher();

/**
 * Fetches and stores menus for the entire week
 */
async function fetchAndStoreWeeklyMenu(): Promise<void> {
  try {
    // Fetch menus for the whole week
    const menus = await menuFetcher.fetchWeeklyMenu();
    
    // Convert menus to string format for storage
    const menuData = menus.map(menu => ({
      date: menu.date,
      menuText: JSON.stringify(menu)
    }));

    // Store all menus in a single transaction
    await menuStorage.saveWeeklyMenu(menuData);
    
    console.info(`Successfully fetched and stored ${menus.length} menus for the week of ${menus[0].date.toISOString()}`);
  } catch (error) {
    const errorMessage = error instanceof MenuFetchError
      ? `Weekly menu fetch failed: ${error.message}`
      : `Unexpected error during weekly menu fetch: ${error}`;
    
    console.error(errorMessage);
    
    // Error logging for monitoring
    console.error(JSON.stringify({
      type: 'WEEKLY_MENU_FETCH_ERROR',
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
  cron.schedule(CRON_SCHEDULE, fetchAndStoreWeeklyMenu, {
    timezone: 'Europe/Berlin',
    scheduled: true
  });

  // Also run immediately on startup
  fetchAndStoreWeeklyMenu().catch(error => {
    console.error('Initial weekly menu fetch failed:', error);
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
export { fetchAndStoreWeeklyMenu, CRON_SCHEDULE };