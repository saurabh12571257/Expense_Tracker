# Docker Deployment Guide

This document provides instructions for deploying the Expense Tracker application using Docker.

## Prerequisites

- Docker
- Docker Compose

## Deployment Steps

1. **Clone the repository or download the required files**

   ```bash
   git clone https://github.com/saurabh12571257/Expense_Tracker.git
   cd Expense_Tracker
   ```

   Alternatively, you only need these files:
   - `docker-compose.yml`
   - `nginx.conf`
   - Create `.env` and `tracker-backend/.env` based on the provided examples

2. **Create environment files**

   Create two environment files from the templates:

   ```bash
   # Frontend environment file
   cp .env.example .env

   # Backend environment file
   cp tracker-backend/.env.example tracker-backend/.env
   ```

   Then edit tracker-backend/.env to match your database credentials.

3. **Start the application**

   ```bash
   docker-compose up -d
   ```

   This will:
   - Pull the frontend and backend images from DockerHub
   - Start the containers in detached mode
   - Configure the network between them

## Accessing the Application

Once deployed, you can access the application at:
- Frontend: http://localhost
- Backend API: http://localhost/api

## Configuration

### Environment Variables

The Docker deployment uses the following environment files:

- `.env` - Frontend environment variables
- `tracker-backend/.env` - Backend environment variables

You need to create these files based on the provided examples (.env.example and tracker-backend/.env.example).

### Database Connection

Make sure your tracker-backend/.env has the correct database connection details:

```
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
JWT_SECRET=your-jwt-secret-key
PORT=5002
```

Ensure that your database is accessible from the location where you're deploying the Docker containers.

## Troubleshooting

### Connection Issues

- Check if the backend server is running with `docker-compose logs backend`
- Ensure the database is accessible from the deployment environment
- Verify that port 80 is not already in use on your host machine

### Container Issues

- Restart containers: `docker-compose restart`
- Pull latest images: `docker-compose pull`
- Check container status: `docker-compose ps`
- View logs: `docker-compose logs` 