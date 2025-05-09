# Canteen Information System Documentation

## System Overview

### Architecture Overview

The Canteen Information System is a modern web application built with Next.js that provides access to daily canteen menus. The system follows a three-tier architecture:

1. **Frontend Layer**: Next.js web application
2. **API Layer**: RESTful endpoints for menu access
3. **Data Layer**: PostgreSQL database with Prisma ORM

```mermaid
graph TD
    A[Web Client] -->|HTTP Request| B[Next.js API Routes]
    B -->|Query| C[PostgreSQL Database]
    D[Menu Fetcher Service] -->|Store| C
    E[Cron Job] -->|Trigger| D
```

### Component Descriptions

#### 1. Menu Fetcher Service
- Abstract base class providing retry logic and error handling
- Pluggable architecture for different menu sources
- Built-in mock implementation for development

#### 2. API Service
- RESTful endpoints for menu access
- Query parameter support for specific dates
- Standardized error handling and responses

#### 3. Database Layer
- PostgreSQL database
- Prisma ORM for type-safe database access
- Optimized schema with indexes

### Data Flow

1. **Menu Fetching Flow**:
   ```mermaid
   sequenceDiagram
       Cron Job->>Menu Fetcher: Trigger fetch
       Menu Fetcher->>External Source: Request menu
       External Source->>Menu Fetcher: Return menu data
       Menu Fetcher->>Database: Store menu
   ```

2. **Menu Request Flow**:
   ```mermaid
   sequenceDiagram
       Client->>API: GET /api/v1/menu
       API->>Database: Query menu
       Database->>API: Return menu data
       API->>Client: JSON response
   ```

### Data Structures

#### Menu Model
```typescript
interface Menu {
  date: Date;
  meals: Meal[];
  metadata: MenuMetadata;
}

interface Meal {
  name: string;
  category: MealCategory;
  price: Price;
  allergens?: string[];
  additives?: string[];
}
```

#### Database Schema
```prisma
model DailyMenu {
  id          Int      @id @default(autoincrement())
  date        DateTime @unique @db.Date
  menuText    String   @db.Text
  lastUpdated DateTime @default(now()) @db.Timestamptz
}
```

## Environment Variables

The system requires the following environment variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
# Add other required environment variables
```

## Error Handling

The system implements comprehensive error handling:

1. **Menu Fetcher Errors**
   - Automatic retry logic with configurable attempts
   - Distinction between retryable and non-retryable errors

2. **API Error Responses**
   - 404: Menu not found
   - 500: Internal server error
   - 503: Database connection error

## Security Considerations

1. Database access is restricted to internal network
2. Environment variables for sensitive configuration
3. Input validation on API endpoints
4. Rate limiting (to be implemented)