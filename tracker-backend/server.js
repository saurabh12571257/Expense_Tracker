const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Use CORS middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// Other middleware
app.use(express.json());

// Test route
app.get('/test-cors', (req, res) => {
  console.log('Test CORS route hit');
  res.json({ message: 'CORS test successful' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/accounts', require('./routes/accounts'));
app.use('/api/profile', require('./routes/profile'));

// Default route
app.get('/', (req, res) => {
  res.send('Expense Tracker API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
