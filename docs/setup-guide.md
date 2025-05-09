# Setup Guide

This guide walks through the setup process for the Canteen Information System.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn package manager

## Installation Steps

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd canteen-api
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**

   a. Create a PostgreSQL database:
   ```sql
   CREATE DATABASE canteen;
   ```

   b. Configure database connection:
   ```bash
   # Create .env file with database credentials
   cp .env.example .env
   ```

   Edit `.env` file:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/canteen"
   ```

   c. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

## Test Data Creation

1. **Generate Mock Data**
   ```bash
   npm run create-test-menu
   ```

   This script will:
   - Create sample menu entries
   - Populate with realistic meal data
   - Set appropriate prices

2. **Verify Database Connection**
   ```bash
   npm run verify-db
   ```

## Development Environment

1. **Start Development Server**
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:3000`

2. **Test API Endpoint**
   ```bash
   curl http://localhost:3000/api/v1/menu
   ```

## Environment Configuration

### Required Environment Variables

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/canteen"

# API Configuration (if needed)
API_KEY=your_api_key
NODE_ENV=development
```

### Optional Environment Variables

```env
# Fetcher Configuration
MAX_RETRIES=3
RETRY_DELAY_MS=1000
```

## Verification Steps

1. **Database Connectivity**
   ```bash
   npm run verify-db-connection
   ```

2. **Menu Fetcher Test**
   ```bash
   npm run test-menu-fetch
   ```

3. **API Health Check**
   ```bash
   curl http://localhost:3000/api/health
   ```

## Troubleshooting

### Common Issues

1. **Database Connection Fails**
   - Verify PostgreSQL is running
   - Check credentials in `.env`
   - Ensure database exists

2. **Prisma Client Issues**
   ```bash
   npx prisma generate
   ```

3. **Menu Fetcher Errors**
   - Check network connectivity
   - Verify source URL configuration
   - Review logs for detailed error messages

## Next Steps

1. Configure real menu fetcher implementation
2. Set up monitoring (recommended)
3. Configure backup strategy
4. Set up CI/CD pipeline

For additional support, refer to:
- [System Overview](./system-overview.md)
- [API Documentation](./api-documentation.md)
- [Menu Fetcher Guide](./menu-fetcher-guide.md)