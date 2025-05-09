/**
 * Menu fetcher service interface
 */
export interface MenuFetcher {
  /**
   * Fetches the daily menu from the source
   * @returns Promise with the fetched menu data
   * @throws MenuFetchError if fetching fails
   */
  fetchDailyMenu(): Promise<Menu>;
}

/**
 * Menu data structure
 */
export interface Menu {
  date: Date;
  meals: Meal[];
  metadata: MenuMetadata;
}

export interface Meal {
  name: string;
  category: MealCategory;
  price: Price;
  allergens?: string[];
  additives?: string[];
}

export interface Price {
  students: number;
  employees: number;
  guests: number;
}

export interface MenuMetadata {
  source: string;
  fetchedAt: Date;
  validUntil: Date;
}

export enum MealCategory {
  MAIN = 'MAIN',
  SIDE = 'SIDE',
  DESSERT = 'DESSERT',
  SOUP = 'SOUP',
  SPECIAL = 'SPECIAL'
}

/**
 * Custom error types
 */
export class MenuFetchError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error,
    public readonly retryable: boolean = true
  ) {
    super(message);
    this.name = 'MenuFetchError';
  }
}