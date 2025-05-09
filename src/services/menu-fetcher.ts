import { Menu, MenuFetcher, MenuFetchError } from '../types/menu';

/**
 * Abstract base menu fetcher with common functionality
 */
export abstract class BaseMenuFetcher implements MenuFetcher {
  protected constructor(
    private readonly source: string,
    private readonly maxRetries: number = 3,
    private readonly retryDelayMs: number = 1000
  ) {}

  /**
   * Template method that implements retry logic and error handling
   */
  async fetchDailyMenu(): Promise<Menu> {
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.info(`Fetching menu from ${this.source} (attempt ${attempt}/${this.maxRetries})`);
        const menu = await this.fetchMenuFromSource();
        console.info(`Successfully fetched menu from ${this.source}`);
        return {
          ...menu,
          metadata: {
            ...menu.metadata,
            source: this.source,
            fetchedAt: new Date()
          }
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`Failed to fetch menu from ${this.source}:`, error);
        
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
      `Failed to fetch menu from ${this.source} after ${this.maxRetries} attempts`,
      lastError
    );
  }

  /**
   * Abstract method to be implemented by concrete fetchers
   */
  protected abstract fetchMenuFromSource(): Promise<Menu>;

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

  protected async fetchMenuFromSource(): Promise<Menu> {
    return {
      date: new Date(),
      meals: [],
      metadata: {
        source: 'mock',
        fetchedAt: new Date(),
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // valid for 24h
      }
    };
  }
}