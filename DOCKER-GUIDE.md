# Docker Deployment Guide

This document provides instructions for deploying the Expense Tracker application using Docker.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Option 1: Quick Deployment with DockerHub Images](#option-1-quick-deployment-with-dockerhub-images)
- [Option 2: Building Docker Images Locally](#option-2-building-docker-images-locally)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Docker
- Docker Compose

## Option 1: Quick Deployment with DockerHub Images

The quickest way to deploy the application is using the pre-built images from DockerHub:

1. **Clone the repository or download the required files**

   ```bash
   git clone https://github.com/saurabh12571257/Expense_Tracker.git
   cd Expense_Tracker
   ```

   Alternatively, you only need these files:
   - `docker-compose.dockerhub.yml`
   - `nginx.conf`
   - `tracker-backend/.env.docker`

2. **Start the application**

   ```bash
   docker-compose -f docker-compose.dockerhub.yml up -d
   ```

   This will:
   - Pull the frontend and backend images from DockerHub
   - Start the containers in detached mode
   - Configure the network between them

## Option 2: Building Docker Images Locally

If you want to build the images yourself:

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

## Accessing the Application

Once deployed, you can access the application at:
- Frontend: http://localhost
- Backend API: http://localhost/api

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

## Building and Pushing Images to DockerHub

If you've made changes and want to update the DockerHub images:

1. **Use the provided script**

   ```bash
   ./docker-build-push.sh
   ```

   This script will:
   - Log in to DockerHub (you'll be prompted for your password)
   - Build the frontend and backend images
   - Tag them with your DockerHub username
   - Push them to DockerHub

2. **Manual process**

   If you prefer to do it manually:

   ```bash
   # Log in to DockerHub
   docker login -u saurabhdave59
   
   # Build and tag images
   docker build -t saurabhdave59/expense-tracker-frontend:latest -f Dockerfile.frontend .
   docker build -t saurabhdave59/expense-tracker-backend:latest -f Dockerfile.backend .
   
   # Push images
   docker push saurabhdave59/expense-tracker-frontend:latest
   docker push saurabhdave59/expense-tracker-backend:latest
   ```

## Troubleshooting

### Connection Issues

- Check if the backend server is running with `docker-compose logs backend`
- Ensure the RDS database is accessible from the deployment environment
- Verify that port 80 is not already in use on your host machine

### Container Issues

- Restart containers: `docker-compose restart`
- Rebuild containers: `docker-compose up -d --build`
- Check container status: `docker-compose ps`
- View logs: `docker-compose logs` 