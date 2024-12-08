
# Backend Setup Guide

This guide will help you set up and run the backend service on your local machine.

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn package manager

## Installation Steps

1. **Clone the repository**   ```
   git clone <repository-url>
   cd <project-directory>   ```

2. **Install dependencies**   
```npm install```
or 
```yarn install   ```

3. **Environment Setup**
   - Copy the `.env.example` file to create a new `.env` file  
   - Update the `.env` file with your local configuration:  
   ```
   PORT=9090
   NODE_ENV=development

   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_USER=<your_postgres_username>
   POSTGRES_PASSWORD=<your_postgres_password>
   POSTGRES_DB=<your_database_name>

   JWT_SECRET=<your_jwt_secret_key>
   JWT_EXPIRES_IN=24h

   DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}``

   GITHUB_TOKEN=<your_github_personal_access_token> 

4. **Database Setup**
   - Create a new PostgreSQL database   ```
   createdb <your_database_name>   ```
   - Run database migrations   
  ```npx prisma migrate dev```
   ``` yarn prisma migrate dev   ```

5. **Start the Development Server**   
```npm run dev```
   ```yarn dev   ```

The server should now be running at `http://localhost:9090`

## Available Scripts

- `npm run dev`: Start the development server with hot-reload
- `npm run build`: Build the TypeScript project
- `npm run migrate`: Run database migrations

## API Documentation

The API endpoints can be accessed at:
- Local: `http://localhost:9090/api`

# Endpoints
The backend has a few endpoints.
1. ```/api/scan``` - IP Address Scan. You may Scan IP addresses.
**Body:**
```{"target":"192.168.0.1"}```
2. ```api/api/vulnerabilities```
3. ```api/api/vulnerabilities/github```
4. ```api/api/vulnerabilities/sploitus```

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


# License

The code is licensed under the MIT License.
