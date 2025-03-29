# Expense Tracker

A full-stack application for tracking personal expenses with categories, transactions, and dashboards.

## Features

- User Authentication (Register/Login)
- Transaction Management
- Category Management 
- Account Management
- Dashboard with expense analytics
- RDS PostgreSQL Database

## Tech Stack

- **Frontend**: React, Vite
- **Backend**: Node.js, Express
- **Database**: PostgreSQL

## Prerequisites

- Node.js (v16+)
- npm
- PostgreSQL database (or connection to a remote PostgreSQL database)

## Setup and Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/saurabh12571257/Expense_Tracker.git
   cd Expense_Tracker
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd tracker-backend
   npm install
   cd ..
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Update with your database credentials
   nano .env
   ```

4. **Build the frontend**
   ```bash
   npm run build
   ```

5. **Start the application**
   ```bash
   npm start
   ```

   The application will be available at `http://localhost:5002`

## Development Mode

To run the application in development mode with hot reloading:

```bash
npm run dev
```

This will start both the frontend development server and the backend server concurrently.

- Frontend will be available at: `http://localhost:5173`
- Backend API will be available at: `http://localhost:5002/api`

## API Endpoints

- `/api/auth` - Authentication routes
- `/api/transactions` - Transaction management
- `/api/categories` - Category management
- `/api/accounts` - Account management
- `/api/profile` - User profile management
