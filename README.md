# Backend Setup Guide

This guide will help you set up and run the backend service on your local machine.

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn package manager

## Installation Steps

1. **Clone the repository**   ```bash
   git clone <repository-url>
   cd <project-directory>   ```

2. **Install dependencies**   ```bash
   npm install
   # or
   yarn install   ```

3. **Environment Setup**
   - Copy the `.env.example` file to create a new `.env` file   ```bash
   cp .env.example .env   ```
   - Update the `.env` file with your local configuration:   ```env
   PORT=9090
   NODE_ENV=development

   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_USER=<your_postgres_username>
   POSTGRES_PASSWORD=<your_postgres_password>
   POSTGRES_DB=<your_database_name>

   JWT_SECRET=<your_jwt_secret_key>
   JWT_EXPIRES_IN=24h

   DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}

   GITHUB_TOKEN=<your_github_personal_access_token>   ```

4. **Database Setup**
   - Create a new PostgreSQL database   ```bash
   createdb <your_database_name>   ```
   - Run database migrations   ```bash
   npx prisma migrate dev
   # or
   yarn prisma migrate dev   ```

5. **Start the Development Server**   ```bash
   npm run dev
   # or
   yarn dev   ```

The server should now be running at `http://localhost:9090`

## Available Scripts

- `npm run dev`: Start the development server with hot-reload
- `npm run build`: Build the TypeScript project
- `npm start`: Start the production server
- `npm run prisma:generate`: Generate Prisma client
- `npm run prisma:migrate`: Run database migrations

## API Documentation

The API endpoints can be accessed at:
- Local: `http://localhost:9090/api`

## Troubleshooting

1. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **TypeScript Compilation Errors**
   - Run `tsc --noEmit` to check for type errors
   - Ensure all dependencies are properly installed

3. **Prisma Issues**
   - Run `npx prisma generate` to regenerate Prisma client
   - Verify DATABASE_URL in `.env` is correct

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port number | Yes |
| NODE_ENV | Environment (development/production) | Yes |
| POSTGRES_HOST | PostgreSQL host | Yes |
| POSTGRES_PORT | PostgreSQL port | Yes |
| POSTGRES_USER | PostgreSQL username | Yes |
| POSTGRES_PASSWORD | PostgreSQL password | Yes |
| POSTGRES_DB | PostgreSQL database name | Yes |
| JWT_SECRET | Secret key for JWT tokens | Yes |
| JWT_EXPIRES_IN | JWT token expiration time | Yes |
| GITHUB_TOKEN | GitHub Personal Access Token | Yes |

## License

[Your License]
