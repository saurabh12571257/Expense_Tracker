# Docker Deployment Instructions

This document provides instructions for deploying the Expense Tracker application using Docker.

## Prerequisites

- Docker
- Docker Compose

## Deployment Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/saurabh12571257/Expense_Tracker.git
   cd Expense_Tracker
   ```

2. **Build and run the application**

   ```bash
   docker-compose up -d
   ```

   This will:
   - Build the frontend and backend Docker images
   - Start the containers in detached mode
   - Configure the network between them

3. **Access the application**

   Once deployed, you can access the application at:
   - Frontend: http://localhost
   - Backend API: http://localhost/api

4. **View logs**

   ```bash
   # View all logs
   docker-compose logs

   # View frontend logs
   docker-compose logs frontend

   # View backend logs
   docker-compose logs backend
   ```

5. **Stop the application**

   ```bash
   docker-compose down
   ```

## Configuration

### Environment Variables

The Docker deployment uses the following environment files:

- `.env` - Frontend environment variables
- `tracker-backend/.env.docker` - Backend environment variables

You may need to modify these files to change database connection details or other configuration options.

### Database Connection

The backend is configured to connect to your AWS RDS PostgreSQL instance:

```
DB_HOST=expensetracker.c3eii2s6e9dy.ap-south-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=ExpenseTracker
DB_PASSWORD=ExpenseTracker
```

Ensure that your RDS instance is accessible from the location where you're deploying the Docker containers.

## Troubleshooting

### Connection Issues

- Check if the backend server is running with `docker-compose logs backend`
- Ensure the RDS database is accessible from the deployment environment
- Verify that port 80 is not already in use on your host machine

### Container Issues

- Restart containers: `docker-compose restart`
- Rebuild containers: `docker-compose up -d --build`
- Check container status: `docker-compose ps` 