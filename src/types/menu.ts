/**
 * Menu fetcher service interface
 */
export interface MenuFetcher {
  /**
   * Fetches menus for the entire week
   * @returns Promise with an array of menus for each day
   * @throws MenuFetchError if fetching fails
   */
  fetchWeeklyMenu(): Promise<Menu[]>;
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