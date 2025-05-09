# Menu Fetcher Implementation Guide

## Overview

The Menu Fetcher is a crucial component of the Canteen Information System that retrieves menu data from various sources. This guide explains how to implement custom menu fetchers using the provided interfaces and base classes.

## Interface Definition

The system uses a `MenuFetcher` interface that all implementations must follow:

```typescript
interface MenuFetcher {
  fetchDailyMenu(): Promise<Menu>;
}
```

## Base Implementation

The system provides a `BaseMenuFetcher` abstract class with built-in retry logic:

```typescript
abstract class BaseMenuFetcher implements MenuFetcher {
  protected constructor(
    private readonly source: string,
    private readonly maxRetries: number = 3,
    private readonly retryDelayMs: number = 1000
  ) {}

  async fetchDailyMenu(): Promise<Menu> {
    // Retry logic implementation
  }

  protected abstract fetchMenuFromSource(): Promise<Menu>;
}
```

## Creating a Custom Fetcher

### 1. Create a New Class

```typescript
import { BaseMenuFetcher, Menu } from '../types/menu';

export class CustomMenuFetcher extends BaseMenuFetcher {
  constructor() {
    super('custom-source');
  }

  protected async fetchMenuFromSource(): Promise<Menu> {
    // Implementation here
  }
}
```

### 2. Implement Menu Fetching Logic

```typescript
protected async fetchMenuFromSource(): Promise<Menu> {
  // Example implementation
  const response = await fetch('https://custom-source.com/menu');
  const data = await response.json();
  
  return {
    date: new Date(data.date),
    meals: this.transformMeals(data.meals),
    metadata: {
      source: 'custom-source',
      fetchedAt: new Date(),
      validUntil: this.calculateValidUntil()
    }
  };
}
```

## Mock Implementation Example

The system includes a mock implementation for testing:

```typescript
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
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    };
  }
}
```

## Error Handling

### Custom Error Types

```typescript
class MenuFetchError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error,
    public readonly retryable: boolean = true
  ) {
    super(message);
    this.name = 'MenuFetchError';
  }
}
```

### Error Handling Example

```typescript
protected async fetchMenuFromSource(): Promise<Menu> {
  try {
    const response = await fetch(this.sourceUrl);
    
    if (!response.ok) {
      throw new MenuFetchError(
        `HTTP error ${response.status}`,
        undefined,
        response.status >= 500 // Only retry on server errors
      );
    }
    
    // Process response...
  } catch (error) {
    if (error instanceof MenuFetchError) {
      throw error;
    }
    
    throw new MenuFetchError(
      'Failed to fetch menu',
      error instanceof Error ? error : undefined
    );
  }
}
```

## Integration Steps

1. **Create Fetcher Class**
   ```typescript
   // src/services/custom-fetcher.ts
   export class CustomMenuFetcher extends BaseMenuFetcher {
     // Implementation
   }
   ```

2. **Configure Fetcher**
   ```typescript
   // src/config.ts
   import { CustomMenuFetcher } from './services/custom-fetcher';

   export const menuFetcher = new CustomMenuFetcher();
   ```

3. **Test Implementation**
   ```typescript
   // src/tests/custom-fetcher.test.ts
   describe('CustomMenuFetcher', () => {
     it('should fetch and transform menu data', async () => {
       const fetcher = new CustomMenuFetcher();
       const menu = await fetcher.fetchDailyMenu();
       
       expect(menu).toHaveProperty('date');
       expect(menu).toHaveProperty('meals');
       expect(menu).toHaveProperty('metadata');
     });
   });
   ```

## Best Practices

1. **Error Handling**
   - Use `MenuFetchError` for all errors
   - Set appropriate `retryable` flag
   - Include original error as `cause`

2. **Data Validation**
   - Validate external data thoroughly
   - Transform data to match system types
   - Handle missing or invalid data gracefully

3. **Performance**
   - Implement caching when appropriate
   - Set reasonable timeout limits
   - Consider rate limiting

4. **Monitoring**
   - Log fetch attempts and results
   - Track success/failure rates
   - Monitor response times

## Example: HTML Scraping Fetcher

```typescript
import { BaseMenuFetcher, Menu, Meal } from '../types/menu';
import * as cheerio from 'cheerio';

export class WebScraperMenuFetcher extends BaseMenuFetcher {
  constructor(private readonly url: string) {
    super('web-scraper');
  }

  protected async fetchMenuFromSource(): Promise<Menu> {
    const response = await fetch(this.url);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const meals: Meal[] = [];
    $('.menu-item').each((_, element) => {
      meals.push({
        name: $(element).find('.name').text(),
        category: this.parseCategory($(element).find('.category').text()),
        price: {
          students: this.parsePrice($(element).find('.student-price').text()),
          employees: this.parsePrice($(element).find('.employee-price').text()),
          guests: this.parsePrice($(element).find('.guest-price').text())
        }
      });
    });

    return {
      date: new Date(),
      meals,
      metadata: {
        source: 'web-scraper',
        fetchedAt: new Date(),
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    };
  }
}