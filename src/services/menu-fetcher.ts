import { Menu, MenuFetcher, MenuFetchError } from '../types/menu';

/**
 * Abstract base menu fetcher with common functionality
 */
export abstract class BaseMenuFetcher implements MenuFetcher {
  protected constructor(
    private readonly source: string,
    private readonly maxRetries: number = 1,
    private readonly retryDelayMs: number = 1000
  ) {}

  /**
   * Template method that implements retry logic and error handling
   */
  async fetchWeeklyMenu(): Promise<Menu[]> {
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.info(`Fetching weekly menu from ${this.source} (attempt ${attempt}/${this.maxRetries})`);
        const menus = await this.fetchWeeklyMenuFromSource();
        console.info(`Successfully fetched weekly menu from ${this.source}`);
        
        return menus.map(menu => ({
          ...menu,
          metadata: {
            ...menu.metadata,
            source: this.source,
            fetchedAt: new Date()
          }
        }));
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`Failed to fetch weekly menu from ${this.source}:`, error);
        
        if (error instanceof MenuFetchError && !error.retryable) {
          throw error;
        }
        
        if (attempt < this.maxRetries) {
          console.info(`Retrying in ${this.retryDelayMs}ms...`);
          await this.delay(this.retryDelayMs);
        }
      }
    }

    throw new MenuFetchError(
      `Failed to fetch weekly menu from ${this.source} after ${this.maxRetries} attempts`,
      lastError
    );
  }

  /**
   * Abstract method to be implemented by concrete fetchers
   */
  protected abstract fetchWeeklyMenuFromSource(): Promise<Menu[]>;

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Placeholder implementation for development/testing
 */
export class MockMenuFetcher extends BaseMenuFetcher {
  constructor() {
    super('mock');
  }

  protected async fetchWeeklyMenuFromSource(): Promise<Menu[]> {
    const monday = new Date();
    monday.setDate(monday.getDate() - monday.getDay() + 1); // Set to Monday
    const weekMenus: Menu[] = [];

    // Generate menus for 5 days (Monday-Friday)
    for (let i = 0; i < 5; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);

      weekMenus.push({
        date,
        meals: [],
        metadata: {
          source: 'mock',
          fetchedAt: new Date(),
          validUntil: new Date(date.getTime() + 24 * 60 * 60 * 1000)
        }
      });
    }

    return weekMenus;
  }
}