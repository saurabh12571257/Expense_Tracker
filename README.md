# Expense Tracker

<img width="1468" alt="Screenshot 2025-03-14 at 10 30 29 PM" src="https://github.com/user-attachments/assets/ca729018-700f-43e6-94e5-2fe93844acb1" />


A modern web application to track your income and expenses, providing analytics on your spending habits and helping you manage your finances efficiently.

## Features

- User-friendly UI for adding income and expenses
- Dashboard with analytics and category breakdown
- Expense tracking by categories
- Recent transactions list

## Tech Stack

- **Frontend**: React.js with Tailwind CSS
- **State Management**: React Hooks (useState)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/expense-tracker.git
cd expense-tracker
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
expense-tracker/
├── public/
├── src/
│   ├── App.jsx         # Main application component
│   ├── Login.jsx       # Login component
│   ├── Register.jsx    # Registration component
│   ├── index.css       # Global styles with Tailwind directives
│   └── main.jsx        # Application entry point
├── index.html
├── package.json
├── tailwind.config.js  # Tailwind CSS configuration
└── README.md
```

## Future Enhancements

- User authentication
- Data persistence with backend integration
- Budget setting and alerts
- Export reports as PDF/CSV
- Mobile app version

## Docker Deployment

This application can be easily deployed using Docker:

1. **Prerequisites**
   - Docker
   - Docker Compose

2. **Setup**
   ```bash
   # Clone the repository
   git clone https://github.com/saurabh12571257/Expense_Tracker.git
   cd Expense_Tracker

   # Create environment files from templates
   cp .env.example .env
   cp tracker-backend/.env.example tracker-backend/.env
   
   # Edit tracker-backend/.env to add your database credentials
   nano tracker-backend/.env
   ```

3. **Deploy**
   ```bash
   docker-compose up -d
   ```

4. **Access**
   - Frontend: http://localhost
   - Backend API: http://localhost/api

For more details, see [DOCKER-GUIDE.md](DOCKER-GUIDE.md).
