#!/bin/bash

# Set your DockerHub username
DOCKERHUB_USERNAME=saurabhdave59

# Login to DockerHub (you'll be prompted for password)
echo "Logging in to DockerHub as $DOCKERHUB_USERNAME"
docker login -u $DOCKERHUB_USERNAME

# Build and tag the frontend image
echo "Building frontend image..."
docker build -t $DOCKERHUB_USERNAME/expense-tracker-frontend:latest -f Dockerfile.frontend .

# Build and tag the backend image
echo "Building backend image..."
docker build -t $DOCKERHUB_USERNAME/expense-tracker-backend:latest -f Dockerfile.backend .

# Push the frontend image to DockerHub
echo "Pushing frontend image to DockerHub..."
docker push $DOCKERHUB_USERNAME/expense-tracker-frontend:latest

# Push the backend image to DockerHub
echo "Pushing backend image to DockerHub..."
docker push $DOCKERHUB_USERNAME/expense-tracker-backend:latest

echo "All images have been built and pushed to DockerHub!" 