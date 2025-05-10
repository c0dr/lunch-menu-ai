# Canteen API

A modern web application that fetches, processes, and serves daily canteen menu information. Built with Next.js and TypeScript, it uses Gemini AI to convert menu images into structured data.

## Features

- 🤖 **AI-Powered Menu Processing**: Uses Google's Gemini to extract text from menu images
- 🗃️ **Automatic Menu Fetching**: Scheduled cron jobs to keep menus up-to-date
- 🌐 **RESTful API**: Easy access to menu data through standardized endpoints
- 📱 **Responsive UI**: Modern interface for viewing daily and weekly menus
- 🔄 **Real-time Updates**: Auto-updates as you edit with Next.js hot reloading

## Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   npm install
   ```

2. **Configure Environment**
   ```bash
   # Create .env file with required variables
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   GEMINI_API_KEY="your-gemini-api-key"
   ```

3. **Setup Database**
   ```bash
   npx prisma db push
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Run production server
- `npm run fetch-menu`: Manually trigger menu fetch
- `npm run create-test-menu`: Create test menu data
- `npm run verify-db`: Verify database connection

## API Endpoints

### GET /api/v1/menu
Retrieve menu for a specific date
```typescript
GET /api/v1/menu?date=2024-05-10
```

### GET /api/v1/menu/fetch
Manually trigger menu fetch
```typescript
POST /api/v1/menu/fetch
```

## Project Structure

```
├── src/
│   ├── app/              # Next.js pages and API routes
│   ├── components/       # React components
│   ├── services/        # Core services (menu fetcher, storage)
│   ├── lib/             # Utilities and configurations
│   └── types/           # TypeScript type definitions
├── prisma/              # Database schema and migrations
└── docs/               # Detailed documentation
```

## Documentation

- [System Overview](docs/system-overview.md)
- [API Documentation](docs/api-documentation.md)
- [Menu Fetcher Guide](docs/menu-fetcher-guide.md)
- [Setup Guide](docs/setup-guide.md)

## Tech Stack

- **Frontend**: Next.js, TypeScript, React
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **AI**: Google Gemini API
- **Development**: ESLint, PostCSS

## Requirements

- Node.js 18+
- PostgreSQL 12+
- Google Cloud Project with Gemini API enabled
