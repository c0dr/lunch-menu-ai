# API Documentation

## Overview

The Canteen Information System provides a RESTful API for accessing daily menu information. This document details the available endpoints, request/response formats, and error handling.

## Base URL

```
http://localhost:3000/api/v1
```

## Endpoints

### Get Daily Menu

Retrieves the menu for a specific date.

```http
GET /menu?date={date}
```

#### Parameters

| Name | Type   | Required | Description                                    |
|------|--------|----------|------------------------------------------------|
| date | string | No       | Date in ISO format (YYYY-MM-DD). Defaults to today |

#### Response Format

```typescript
{
  id: number;
  date: string;        // ISO date format
  menuText: string;    // JSON string containing menu data
  lastUpdated: string; // ISO datetime format
}
```

#### Example Menu Data Structure

```json
{
  "date": "2025-09-05",
  "meals": [
    {
      "name": "Spaghetti Bolognese",
      "category": "MAIN",
      "price": {
        "students": 3.50,
        "employees": 4.50,
        "guests": 5.50
      },
      "allergens": ["GLUTEN", "EGGS"],
      "additives": ["E100", "E150"]
    }
  ],
  "metadata": {
    "source": "canteen-api",
    "fetchedAt": "2025-09-05T10:00:00Z",
    "validUntil": "2025-09-06T00:00:00Z"
  }
}
```

#### Example Requests

1. Get today's menu:
```bash
curl http://localhost:3000/api/v1/menu
```

2. Get menu for specific date:
```bash
curl http://localhost:3000/api/v1/menu?date=2025-09-05
```

#### Success Response

```json
{
  "id": 1,
  "date": "2025-09-05",
  "menuText": "{\"date\":\"2025-09-05\",\"meals\":[...]}",
  "lastUpdated": "2025-09-05T10:00:00Z"
}
```

## Error Handling

The API uses standard HTTP status codes and returns error messages in a consistent format:

```json
{
  "error": "Error message description"
}
```

### Status Codes

| Code | Description                                          |
|------|------------------------------------------------------|
| 200  | Success                                               |
| 400  | Bad Request - Invalid date format or other parameters |
| 404  | Not Found - No menu found for the specified date     |
| 500  | Internal Server Error                                |
| 503  | Service Unavailable - Database connection error      |

### Example Error Response

```json
{
  "error": "No menu found for the specified date"
}
```

## Rate Limiting

Currently, the API does not implement rate limiting, but it's planned for future releases.

## Meal Categories

The system supports the following meal categories:

```typescript
enum MealCategory {
  MAIN = 'MAIN',
  SIDE = 'SIDE',
  DESSERT = 'DESSERT',
  SOUP = 'SOUP',
  SPECIAL = 'SPECIAL'
}
```

## Data Types

### Price Structure

```typescript
interface Price {
  students: number;  // Price in EUR
  employees: number; // Price in EUR
  guests: number;    // Price in EUR
}
```

### Menu Metadata

```typescript
interface MenuMetadata {
  source: string;      // Source of the menu data
  fetchedAt: Date;     // When the data was fetched
  validUntil: Date;    // Data validity period
}
```

## Best Practices

1. Always specify dates in ISO format (YYYY-MM-DD)
2. Handle API errors gracefully in your client application
3. Cache responses when appropriate
4. Check the `lastUpdated` field to ensure data freshness

## Upcoming Features

1. Authentication/Authorization
2. Rate limiting
3. Bulk menu fetching
4. Menu search and filtering