# Deploying from DockerHub

This document provides instructions for deploying the Expense Tracker application using pre-built Docker images from DockerHub.

## Prerequisites

- Docker
- Docker Compose

## Quick Deployment

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

3. **Access the application**

   Once deployed, you can access the application at:
   - Frontend: http://localhost
   - Backend API: http://localhost/api

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

## Updating the Application

To update to the latest version of the images:

```bash
# Pull the latest images
docker-compose -f docker-compose.dockerhub.yml pull

# Restart the containers
docker-compose -f docker-compose.dockerhub.yml up -d
``` 